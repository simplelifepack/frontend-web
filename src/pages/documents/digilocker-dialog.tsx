import { useEffect, useRef, useState } from "react";
import { FileCheck2 } from "lucide-react";
import { Button, Checkbox, ModalBackdrop, ModalPanel, ModalHeader, ModalContent, ModalActions, Stack, Row, Text, Card, ScrollRegion } from "@/design-system";
import { digilocker, type LockerDocument, type LockerSession } from "@/lib/digilocker-api";
import { useAppDispatch } from "@/store/hooks";
import { fetchDocuments } from "@/store/slices/documentsSlice";
const SESSION_KEY = "readines.digilocker.session";
const CONSENT_TEXT = "ReadiNes will securely copy your selected DigiLocker documents into your account. These copies will be encrypted and processed using our existing AI document management system.";
const errorMessage = (error: unknown) => error instanceof Error ? error.message : "DigiLocker could not complete the request.";

export default function DigiLockerDialog() {
  const dispatch = useAppDispatch();
  const importGeneration = useRef(0);
  const callback = new URLSearchParams(window.location.hash.slice(1));
  const [invalidReturn, setInvalidReturn] = useState(() => callback.has("digilocker_error") ||
    (callback.has("digilocker") && callback.get("digilocker") !== sessionStorage.getItem(SESSION_KEY)));
  const [open, setOpen] = useState(() => callback.has("digilocker") || callback.has("digilocker_error"));
  const [id, setId] = useState(() => sessionStorage.getItem(SESSION_KEY) ?? "");
  const [session, setSession] = useState<LockerSession | null>(null);
  const [documents, setDocuments] = useState<LockerDocument[]>([]);
  const [selection, setSelection] = useState<string[]>([]);
  const [confirm, setConfirm] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [busy, setBusy] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const result = new URLSearchParams(window.location.hash.slice(1));
    if (result.has("digilocker") || result.has("digilocker_error")) {
      const expected = sessionStorage.getItem(SESSION_KEY);
      if (result.has("digilocker_error") || result.get("digilocker") !== expected) setMessage("DigiLocker authorization could not be verified. Start a new connection.");
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);
  useEffect(() => {
    if (!open) return;
    let active = true;
    setBusy(true);
    void (async () => {
      const status = await digilocker.status();
      if (!active) return;
      setConfigured(status.configured);
      if (!status.configured) { setMessage(status.message ?? "DigiLocker is not configured."); return; }
      if (id && !invalidReturn) {
        const current = await digilocker.session(id);
        if (!active) return;
        setSession(current);
        if (["AUTHENTICATED", "IMPORTING"].includes(current.status)) {
          const result = await digilocker.documents(id);
          if (active) setDocuments(result.documents);
        } else {
          setDocuments([]);
          setSelection([]);
          setMessage(({ PENDING: "Authorization was not completed. Connect again or cancel.", CONSENT_DENIED: "DigiLocker consent was declined. You can start a new connection.", EXPIRED: "Your DigiLocker session expired. Connect again.", CANCELLED: "DigiLocker connection was cancelled.", FAILED: "DigiLocker authentication failed. Please reconnect." } as Record<string, string>)[current.status] ?? "Please reconnect DigiLocker.");
        }
      }
    })().catch(error => { if (active) { setSession(null); setDocuments([]); setSelection([]); setMessage(errorMessage(error)); } }).finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [open, id, invalidReturn]);
  useEffect(() => {
    if (!open || !id || (!importing && !["IMPORTING", "PENDING"].includes(session?.status ?? ""))) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    const generation = importGeneration.current;
    const poll = async () => {
      try {
        const next = await digilocker.session(id);
        if (active && generation === importGeneration.current && (!importing || next.status === "IMPORTING")) {
          if (session?.status === "PENDING" && next.status === "AUTHENTICATED") {
            const result = await digilocker.documents(id);
            if (!active) return;
            setDocuments(result.documents); setMessage("");
          }
          setSession(next);
          setSelection(previous => previous.filter(reference => !next.progress.some(p => p.reference === reference && p.phase === "Completed")));
          if (["EXPIRED", "CANCELLED", "CONSENT_DENIED", "FAILED"].includes(next.status)) {
            setDocuments([]); setSelection([]);
            setMessage("DigiLocker authorization ended or expired. Connect again to continue.");
          }
          if (session?.status === "IMPORTING" && next.status !== "IMPORTING") void dispatch(fetchDocuments());
        }
      } catch {
        if (active && !importing) setMessage("Unable to refresh DigiLocker progress. Retrying automatically.");
      }
      if (active) timer = setTimeout(() => void poll(), 1500);
    };
    void poll();
    return () => { active = false; clearTimeout(timer); };
  }, [open, id, importing, session?.status, dispatch]);

  const connect = async () => {
    setBusy(true); setMessage("");
    try {
      if (id && session?.status !== "IMPORTING") {
        try { await digilocker.cancel(id); }
        catch (error) { if ((error as { status?: number }).status !== 404) throw error; }
      }
      const next = await digilocker.start();
      sessionStorage.setItem(SESSION_KEY, next.id);
      window.location.assign(next.authorizationUrl);
    } catch (error) { setMessage(errorMessage(error)); setBusy(false); }
  };
  const close = async () => {
    if (importing || session?.status === "IMPORTING") return;
    setBusy(true);
    try {
      if (id) {
        try { await digilocker.cancel(id); }
        catch (error) { if ((error as { status?: number }).status !== 404) throw error; }
      }
      sessionStorage.removeItem(SESSION_KEY);
      setInvalidReturn(false); setId(""); setSession(null); setDocuments([]); setSelection([]); setConfirm(false); setMessage(""); setOpen(false);
    } catch (error) { setMessage(errorMessage(error)); }
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
      setMessage(errorMessage(error));
      try { setSession(await digilocker.session(id)); } catch { /* A new connection can recover an expired session. */ }
    } finally { importGeneration.current++; setImporting(false); }
  };
  const locked = busy || importing || session?.status === "IMPORTING";
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
            <ScrollRegion $vertical><Stack>
              {documents.length === 0 && <Text tone="muted">DigiLocker returned no issued documents for this authorization.</Text>}
              {documents.map(doc => {
                const progress = session?.progress.find(p => p.reference === doc.reference);
                return <Card key={doc.reference}><Stack $gap="s8">
                  <Row $wrap={false}><Checkbox aria-label={`Select ${doc.name}`} checked={selection.includes(doc.reference)} disabled={locked || !doc.available || completed.has(doc.reference)} onChange={event => setSelection(previous => event.target.checked ? [...previous, doc.reference].slice(0, 50) : previous.filter(ref => ref !== doc.reference))} /><Text weight="semibold">{doc.name}</Text></Row>
                  <Text tone="muted">{[doc.type, doc.issuer, doc.issueDate ? `Issued: ${doc.issueDate}` : doc.modifiedAt ? `Modified: ${doc.modifiedAt}` : null].filter(Boolean).join(" · ")}</Text>
                  {doc.reason && <Text tone="muted">{doc.reason}</Text>}
                  {progress && <Text role="status" tone={progress.phase === "Failed" ? "danger" : "muted"}>{progress.phase}{progress.duplicate ? " — already in Documents" : ""}{progress.message ? `: ${progress.message}` : ""}</Text>}
                </Stack></Card>;
              })}
            </Stack></ScrollRegion>
          </>}
        </>}
        {message && <Text role="status" tone="danger">{message}</Text>}
      </Stack></ModalContent>
      <ModalActions>
        {confirm ? <><Button variant="secondary" onClick={() => setConfirm(false)}>Cancel</Button><Button variant="primary" onClick={() => void runImport()}>Allow &amp; Import</Button></> : <>
          <Button variant="secondary" disabled={locked} onClick={() => void close()}>{connected ? "Done" : "Cancel"}</Button>
          {connected ? <Button variant="primary" disabled={locked || !selection.length} loading={importing} onClick={() => setConfirm(true)}>{selection.some(ref => session?.progress.some(p => p.reference === ref && p.phase === "Failed")) ? "Retry Selected" : "Import Selected"}</Button> : <Button variant="primary" disabled={busy || !configured} loading={busy} onClick={() => void connect()}>Connect DigiLocker</Button>}
        </>}
      </ModalActions>
    </ModalPanel></ModalBackdrop>}
  </>;
}
