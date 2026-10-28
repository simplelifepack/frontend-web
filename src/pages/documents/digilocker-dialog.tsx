import { useEffect, useRef, useState } from "react";
import { FileCheck2 } from "lucide-react";
import { Button, Checkbox, ModalBackdrop, ModalPanel, ModalHeader, ModalContent, ModalActions, Stack, Row, Text, Card, ScrollRegion } from "@/design-system";
import { digilocker, type LockerDocument, type LockerSession } from "@/lib/digilocker-api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchDocuments } from "@/store/slices/documentsSlice";
const SESSION_KEY = "readines.digilocker.session";
const OWNER_KEY = `${SESSION_KEY}.owner`;
function pendingSession(userId: string) {
  if (sessionStorage.getItem(OWNER_KEY) === userId) return sessionStorage.getItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(OWNER_KEY);
  return null;
}
const CONSENT_TEXT = "ReadiNes will securely copy your selected DigiLocker documents into your account. These copies will be encrypted and processed using our existing AI document management system.";
const errorMessage = (error: unknown) => error instanceof Error ? error.message : "DigiLocker could not complete the request.";

export default function DigiLockerDialog() {
  const userId = useAppSelector(state => state.auth.user?.id ?? "");
  return userId ? <AccountDigiLockerDialog key={userId} userId={userId} /> : null;
}
function AccountDigiLockerDialog({ userId }: { userId: string }) {
  const dispatch = useAppDispatch();
  const importGeneration = useRef(0);
  const callback = new URLSearchParams(window.location.hash.slice(1));
  const [invalidReturn, setInvalidReturn] = useState(() => callback.has("digilocker_error") ||
    (callback.has("digilocker") && callback.get("digilocker") !== pendingSession(userId)));
  const [open, setOpen] = useState(() => callback.has("digilocker") || callback.has("digilocker_error"));
  const [id, setId] = useState(() => pendingSession(userId) ?? "");
  const [session, setSession] = useState<LockerSession | null>(null);
  const [documents, setDocuments] = useState<LockerDocument[]>([]);
  const [selection, setSelection] = useState<string[]>([]);
  const [confirm, setConfirm] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [busy, setBusy] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState("");
  const [visibleDocuments, setVisibleDocuments] = useState(50);
  const [retryUntil, setRetryUntil] = useState(0);
  const [connectionRefreshKey, setConnectionRefreshKey] = useState(0);
  useEffect(() => { setVisibleDocuments(50); }, [id]);
  useEffect(() => {
    if (!retryUntil) return;
    const timer = setTimeout(() => setRetryUntil(0), Math.max(0, retryUntil - Date.now()));
    return () => clearTimeout(timer);
  }, [retryUntil]);
  const showError = (error: unknown) => {
    const delay = (error as { retryAfterMs?: number }).retryAfterMs;
    if (delay) setRetryUntil(Date.now() + delay);
    setMessage(errorMessage(error));
  };

  useEffect(() => {
    const result = new URLSearchParams(window.location.hash.slice(1));
    if (result.has("digilocker") || result.has("digilocker_error")) {
      const expected = pendingSession(userId);
      if (result.has("digilocker_error") || result.get("digilocker") !== expected) setMessage("DigiLocker authorization could not be verified. Start a new connection.");
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, [userId]);
  useEffect(() => {
    if (!open) return;
    let active = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(new DOMException("Connection check timed out. Use Refresh Status to retry.", "TimeoutError")), 20_000);
    setBusy(true);
    void (async () => {
      const status = await digilocker.status(controller.signal);
      if (!active) return;
      setConfigured(status.configured);
      if (!status.configured) { setMessage(status.message ?? "DigiLocker is not configured."); return; }
      if (id && !invalidReturn) {
        const current = await digilocker.session(id, controller.signal);
        if (!active) return;
        setSession(current);
        if (["AUTHENTICATED", "IMPORTING"].includes(current.status)) {
          const result = await digilocker.documents(id, controller.signal);
          if (active) setDocuments(result.documents);
        } else {
          setDocuments([]);
          setSelection([]);
          setMessage(({ PENDING: "Authorization was not completed. Connect again or cancel.", CONSENT_DENIED: "DigiLocker consent was declined. You can start a new connection.", EXPIRED: "Your DigiLocker session expired. Connect again.", CANCELLED: "DigiLocker connection was cancelled.", FAILED: "DigiLocker authentication failed. Please reconnect." } as Record<string, string>)[current.status] ?? "Please reconnect DigiLocker.");
        }
      }
    })().catch(error => { if (active) { setSession(null); setDocuments([]); setSelection([]); setMessage(controller.signal.reason?.name === "TimeoutError" ? "Connection check timed out. Use Refresh Status to retry." : errorMessage(error)); } }).finally(() => { clearTimeout(timeout); if (active) setBusy(false); });
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [open, id, invalidReturn, connectionRefreshKey]);
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    if (!open || !id || importing || !["IMPORTING", "PENDING"].includes(session?.status ?? "")) return;
    const controller = new AbortController();
    let active = true;
    let delay = 1500;
    let timer: ReturnType<typeof setTimeout>;
    const generation = importGeneration.current;
    const poll = async () => {
      if (document.hidden || !active) return;
      try {
        const next = await digilocker.session(id, controller.signal);
        if (!active || generation !== importGeneration.current) return;
        if (session?.status === "PENDING" && next.status === "AUTHENTICATED") {
          const result = await digilocker.documents(id, controller.signal);
          if (!active) return;
          setDocuments(result.documents);
        }
        delay = 1500; setMessage(""); setSession(next);
        setSelection(previous => previous.filter(reference => !next.progress.some(p => p.reference === reference && p.phase === "Completed")));
        if (["EXPIRED", "CANCELLED", "CONSENT_DENIED", "FAILED"].includes(next.status)) {
          setSelection([]);
          setMessage(next.status === "EXPIRED" ? "DigiLocker access expired. Your imported documents are saved. Reconnect to continue." : "This connection ended. Your imported documents are saved. Reconnect to retry remaining documents.");
        }
        if (session?.status === "IMPORTING" && next.status !== "IMPORTING") void dispatch(fetchDocuments());
      } catch (error) {
        if (!active || controller.signal.aborted) return;
        delay = Math.min(30_000, Math.max(delay * 2, (error as { retryAfterMs?: number }).retryAfterMs ?? 0));
        setMessage("Unable to refresh DigiLocker progress. Retrying automatically. You can refresh status or reconnect.");
      }
      if (active && !document.hidden) timer = setTimeout(() => void poll(), delay);
    };
    const visibility = () => { clearTimeout(timer); if (!document.hidden) void poll(); };
    document.addEventListener("visibilitychange", visibility);
    void poll();
    return () => { active = false; controller.abort(); clearTimeout(timer); document.removeEventListener("visibilitychange", visibility); };
  }, [open, id, importing, session?.status, dispatch, refreshKey]);

  const connect = async () => {
    setBusy(true); setMessage("");
    try {
      if (id) {
        try { await digilocker.cancel(id); }
        catch (error) { if ((error as { status?: number }).status !== 404) throw error; }
      }
      const next = await digilocker.start();
      sessionStorage.setItem(SESSION_KEY, next.id);
      sessionStorage.setItem(OWNER_KEY, userId);
      window.location.assign(next.authorizationUrl);
    } catch (error) { showError(error); setBusy(false); }
  };
  const close = async () => {
    if (importing) return;
    setBusy(true);
    try {
      if (id) {
        try { await digilocker.cancel(id); }
        catch (error) { if ((error as { status?: number }).status !== 404) throw error; }
      }
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(OWNER_KEY);
      setInvalidReturn(false); setId(""); setSession(null); setDocuments([]); setSelection([]); setConfirm(false); setMessage(""); setOpen(false);
    } catch (error) { showError(error); }
    finally { setBusy(false); }
  };
  const runImport = async () => {
    // This is the sole import entry point and is reachable only from Allow & Import.
    if (importing || !selection.length || session?.status !== "AUTHENTICATED") return;
    importGeneration.current++;
    setConfirm(false); setImporting(true); setMessage("");
    try {
      const next = await digilocker.import(id, selection);
      importGeneration.current++;
      setSession(next);
      setSelection(previous => previous.filter(reference => !next.progress.some(p => p.reference === reference && p.phase === "Completed")));
      void dispatch(fetchDocuments());
    } catch (error) {
      showError(error);
      try { setSession(await digilocker.session(id)); } catch { /* A new connection can recover an expired session. */ }
    } finally { importGeneration.current++; setImporting(false); }
  };
  const locked = busy || importing || session?.status === "IMPORTING" || retryUntil > Date.now();
  const completed = new Set(session?.progress.filter(p => p.phase === "Completed").map(p => p.reference));
  const available = documents.filter(doc => doc.available && !completed.has(doc.reference));
  const connected = session?.status === "AUTHENTICATED" || session?.status === "IMPORTING";
  return <>
    <Button variant="secondary" type="button" onClick={() => setOpen(true)}><FileCheck2 aria-hidden="true" size="var(--icon-small)" /> DigiLocker</Button>
    {open && <ModalBackdrop><ModalPanel size="wide" aria-labelledby="digilocker-title" onDismiss={() => { if (!locked) void close(); }}>
      <ModalHeader><Text as="h2" id="digilocker-title" size="lg" weight="semibold">{confirm ? "Copy documents to ReadiNes?" : "DigiLocker"}</Text></ModalHeader>
      <ModalContent><Stack>
        {confirm ? <>
          <Text>{CONSENT_TEXT}</Text>
          <Text tone="muted">{selection.length} selected document(s). Your existing AI enabled/disabled preference and account limits apply. No copies are made if you cancel.</Text>
        </> : <>
          {!connected && <><Text>Connect DigiLocker to view the issued documents you authorize us to access. You will sign in and grant permission on DigiLocker.</Text><Text tone="muted">After you return, choose documents and explicitly allow copying them to ReadiNes. Aadhaar and formats without a supported PDF download cannot be imported.</Text></>}
          {connected && <>
            <Text>Select documents to copy into your account. The date shown is the last modified date supplied by DigiLocker; issue dates are shown only when available.</Text>
            <Row><Button variant="tertiary" disabled={locked || !available.length} onClick={() => setSelection(available.slice(0, 50).map(doc => doc.reference))}>{available.length > 50 ? "Select First 50" : "Select All"}</Button><Button variant="tertiary" disabled={locked} onClick={() => setSelection([])}>Deselect All</Button></Row>
            {available.length > 50 && <Text tone="muted">Import up to 50 documents per batch.</Text>}
            <ScrollRegion $vertical style={{ maxHeight: "50vh" }}><Stack>
              {documents.length === 0 && <Text tone="muted">DigiLocker returned no issued documents for this authorization.</Text>}
              {documents.slice(0, visibleDocuments).map(doc => {
                const progress = session?.progress.find(p => p.reference === doc.reference);
                return <Card key={doc.reference}><Stack $gap="s8">
                  <Row $wrap={false}><Checkbox aria-label={`Select ${doc.name}`} checked={selection.includes(doc.reference)} disabled={locked || !doc.available || completed.has(doc.reference)} onChange={event => setSelection(previous => event.target.checked ? [...previous, doc.reference].slice(0, 50) : previous.filter(ref => ref !== doc.reference))} /><Text weight="semibold">{doc.name}</Text></Row>
                  <Text tone="muted">{[doc.type, doc.issuer, doc.issueDate ? `Issued: ${doc.issueDate}` : doc.modifiedAt ? `Modified: ${doc.modifiedAt}` : null].filter(Boolean).join(" · ")}</Text>
                  {doc.reason && <Text tone="muted">{doc.reason}</Text>}
                  {progress && <Text role="status" tone={progress.phase === "Failed" ? "danger" : "muted"}>{progress.phase}{progress.duplicate ? " — already in Documents" : ""}{progress.message ? `: ${progress.message}` : ""}</Text>}
                </Stack></Card>;
              })}
              {documents.length > visibleDocuments && <Button variant="tertiary" onClick={() => setVisibleDocuments(count => count + 50)}>Show More Documents ({documents.length - visibleDocuments})</Button>}
            </Stack></ScrollRegion>
          </>}
        </>}
        {!connected && session?.progress.map(progress => <Text key={progress.reference} role="status" tone={progress.phase === "Failed" ? "danger" : "muted"}>{documents.find(doc => doc.reference === progress.reference)?.name ?? "Document"}: {progress.phase}{progress.message ? ` — ${progress.message}` : ""}</Text>)}
        {message && <Text role="status" tone="danger">{message}</Text>}
      </Stack></ModalContent>
      <ModalActions>
        {confirm ? <><Button variant="secondary" onClick={() => setConfirm(false)}>Cancel</Button><Button variant="primary" onClick={() => void runImport()}>Allow &amp; Import</Button></> : <>
          <Button variant="secondary" disabled={busy || importing} onClick={() => void close()}>{session?.status === "IMPORTING" ? "Cancel Import" : connected ? "Done" : "Cancel"}</Button>
          <Button variant="tertiary" disabled={busy || importing || retryUntil > Date.now()} onClick={() => {
            setRefreshKey(value => value + 1);
            setConnectionRefreshKey(value => value + 1);
            setMessage("");
          }}>Refresh Status</Button>
          {message && session?.status === "IMPORTING" && <Button variant="secondary" disabled={busy || importing} onClick={() => void connect()}>Reconnect</Button>}
          {connected ? <Button variant="primary" disabled={locked || !selection.length} loading={importing} onClick={() => setConfirm(true)}>{selection.some(ref => session?.progress.some(p => p.reference === ref && p.phase === "Failed")) ? "Retry Selected" : "Import Selected"}</Button> : <Button variant="primary" disabled={busy || !configured || retryUntil > Date.now()} loading={busy} onClick={() => void connect()}>Connect DigiLocker</Button>}
        </>}
      </ModalActions>
    </ModalPanel></ModalBackdrop>}
  </>;
}
