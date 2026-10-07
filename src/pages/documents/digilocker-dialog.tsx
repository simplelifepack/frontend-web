import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, FileCheck2, X } from "lucide-react";

import { btnGhost, btnPrimary, T } from "@/constants/theme";
import { api, type DigiLockerDocumentOption, type DigiLockerSession, type DigiLockerStatus } from "@/lib/api";
import { useAppDispatch } from "@/store/hooks";
import { setImportedAnalyses } from "@/store/slices/documentsSlice";

type Props = {
  open: boolean;
  initialSessionId?: string | null;
  onClose: () => void;
  onImported: () => void;
};

const labels: Record<string, string> = {
  AADHAAR: "Aadhaar",
  PAN: "PAN",
  DRIVING_LICENSE: "Driving License",
};

const POLL_MS = 4_000;

function terminal(session: DigiLockerSession | null) {
  return Boolean(session && ["AUTHENTICATED", "EXPIRED", "CONSENT_DENIED", "CANCELLED", "FAILED"].includes(session.status));
}

export default function DigiLockerDialog({ open, initialSessionId, onClose, onImported }: Props) {
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<DigiLockerStatus | null>(null);
  const [session, setSession] = useState<DigiLockerSession | null>(null);
  const [documents, setDocuments] = useState<DigiLockerDocumentOption[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");

  const loadStatus = useCallback(async () => {
    const next = await api.digilocker.status();
    setStatus(next);
    if (!next.configured) setMessage(next.message ?? "DigiLocker integration is coming soon.");
    return next;
  }, []);

  const refreshSession = useCallback(async (sessionId: string) => {
    const next = await api.digilocker.sessionStatus(sessionId);
    setSession(next);
    if (next.status === "AUTHENTICATED") {
      const response = await api.digilocker.documents(next.id);
      setDocuments(response.documents);
      setSelected(new Set(response.documents.map((item) => item.type)));
      setMessage("DigiLocker consent complete. Select the documents to import.");
    }
    return next;
  }, []);

  useEffect(() => {
    if (!open) return;
    void loadStatus().catch(() => setMessage("Unable to load DigiLocker status."));
  }, [loadStatus, open]);

  useEffect(() => {
    if (!open || !initialSessionId) return;
    setMessage("Checking DigiLocker consent status...");
    void refreshSession(initialSessionId).catch((error) => setMessage(error instanceof Error ? error.message : "Unable to check DigiLocker status."));
  }, [initialSessionId, open, refreshSession]);

  useEffect(() => {
    if (!open || !session || terminal(session)) return;
    const timer = window.setTimeout(() => {
      void refreshSession(session.id).catch(() => setMessage("Unable to refresh DigiLocker status."));
    }, POLL_MS);
    return () => window.clearTimeout(timer);
  }, [open, refreshSession, session]);

  const selectableDocuments = useMemo(() => documents.length ? documents : (status?.supportedDocuments ?? []).map((type) => ({ type, label: labels[type] ?? type, status: "available" as const })), [documents, status]);

  if (!open) return null;

  const start = async () => {
    setBusy("start");
    setMessage("");
    try {
      const next = await api.digilocker.start(`${window.location.origin}/documents`);
      setSession(next);
      if (next.consentUrl) window.location.assign(next.consentUrl);
      else setMessage("DigiLocker did not return a consent link. Please try again.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to start DigiLocker consent.");
    } finally {
      setBusy("");
    }
  };

  const cancel = async () => {
    if (!session) { onClose(); return; }
    setBusy("cancel");
    try {
      setSession(await api.digilocker.cancel(session.id));
      setMessage("DigiLocker consent was cancelled.");
    } catch {
      setMessage("Unable to cancel this DigiLocker session.");
    } finally {
      setBusy("");
    }
  };

  const importSelected = async () => {
    if (!session || !selected.size) return;
    setBusy("import");
    setMessage("Preparing DigiLocker documents for review...");
    try {
      const response = await api.digilocker.import(session.id, [...selected]);
      const analyses = response.results.flatMap((result) => result.analysis ? [result.analysis] : []);
      if (analyses.length) {
        dispatch(setImportedAnalyses(analyses));
        window.dispatchEvent(new CustomEvent("readiness:open-upload", { detail: { stayOnSave: true } }));
        onImported();
        onClose();
      } else {
        setMessage("No DigiLocker documents were ready to review.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to import DigiLocker documents.");
    } finally {
      setBusy("");
    }
  };

  return <div className="lp-modal-backdrop" style={{ zIndex: 100, padding: 14 }} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="lp-modal-panel" role="dialog" aria-modal="true" aria-labelledby="digilocker-title" style={{ width: "min(680px,calc(100vw - 28px))" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div><h2 id="digilocker-title" style={{ margin: 0, color: T.white }}>Import from DigiLocker</h2><p style={{ color: T.muted, fontSize: 13 }}>Consent-based verified identity documents</p></div>
        <button aria-label="Close DigiLocker import" style={btnGhost} onClick={onClose}><X size={15} /></button>
      </div>
      {!status?.configured ? <div style={{ marginTop: 18, padding: 16, background: T.raised, borderRadius: 12, display: "flex", gap: 12 }}>
        <FileCheck2 color={T.action} /><div><b style={{ color: T.white }}>DigiLocker integration is coming soon.</b><p style={{ color: T.text, fontSize: 13, lineHeight: 1.6 }}>Readiness will enable this after Cashfree onboarding and backend credentials are configured.</p></div>
      </div> : session?.status === "AUTHENTICATED" ? <div style={{ marginTop: 18, padding: 16, background: T.raised, borderRadius: 12 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}><Check color={T.mint} /><b style={{ color: T.white }}>Consent complete</b></div>
        <div style={{ display: "grid", gap: 9, marginTop: 14 }}>
          {selectableDocuments.map((item) => <label key={item.type} style={{ display: "flex", alignItems: "center", gap: 10, color: T.text, border: `1px solid ${T.border}`, borderRadius: 9, padding: 10 }}>
            <input type="checkbox" checked={selected.has(item.type)} onChange={() => setSelected((current) => { const next = new Set(current); if (next.has(item.type)) next.delete(item.type); else next.add(item.type); return next; })} />
            <span>{item.label}</span>
          </label>)}
        </div>
        <button style={{ ...btnPrimary, marginTop: 14 }} disabled={Boolean(busy) || !selected.size} onClick={() => void importSelected()}>{busy === "import" ? "Preparing..." : `Import selected (${selected.size})`}</button>
      </div> : <div style={{ marginTop: 18, padding: 16, background: T.raised, borderRadius: 12 }}>
        <div style={{ display: "flex", gap: 12 }}><FileCheck2 color={T.action} /><div><b style={{ color: T.white }}>Start DigiLocker consent</b><p style={{ color: T.text, fontSize: 13, lineHeight: 1.6 }}>You will be redirected to DigiLocker through Cashfree. Nothing is imported until you return and select documents.</p></div></div>
        {session ? <div style={{ color: T.muted, fontSize: 12, marginTop: 12 }}>Current status: {session.status}</div> : null}
        <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
          <button style={btnPrimary} disabled={Boolean(busy)} onClick={() => void start()}>{busy === "start" ? "Opening DigiLocker..." : "Continue to DigiLocker"}</button>
          {session && !terminal(session) ? <button style={btnGhost} disabled={Boolean(busy)} onClick={() => void cancel()}>Cancel session</button> : null}
        </div>
      </div>}
      {message ? <p style={{ color: /unable|failed|expired|denied|cancelled/i.test(message) ? T.coral : T.muted, fontSize: 13 }}>{message}</p> : null}
    </div>
  </div>;
}
