import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, Mail, PackageCheck, ShieldAlert, X } from "lucide-react";

import { api, type WealthHandoffSummary } from "@/lib/api";

type Status = "loading" | "confirm" | "progress" | "done";

export default function WealthHandoffDialog({ onClose }: { onClose: () => void }) {
  const [status, setStatus] = useState<Status>("loading");
  const [summary, setSummary] = useState<WealthHandoffSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sendResult, setSendResult] = useState<Awaited<ReturnType<typeof api.wealth.sendHandoff>> | null>(null);

  useEffect(() => {
    let active = true;
    api.wealth.handoffSummary()
      .then((data) => {
        if (!active) return;
        setSummary(data);
        setStatus("confirm");
      })
      .catch((caught: Error) => {
        if (active) setError(caught.message);
      });
    return () => {
      active = false;
    };
  }, []);

  const recipients = useMemo(() => ({
    family: summary?.recipients.family ?? [],
    emergency: summary?.recipients.emergency ?? [],
  }), [summary]);
  const familySummary = summary?.handoffTypes.find((item) => item.type === "family");
  const emergencySummary = summary?.handoffTypes.find((item) => item.type === "emergency");
  const canSend = recipients.family.length + recipients.emergency.length > 0;
  const resultCounts = {
    sent: sendResult?.results.filter((result) => result.sent).length ?? 0,
    failed: sendResult?.results.filter((result) => !result.sent).length ?? 0,
  };

  async function send() {
    if (!summary) return;
    setStatus("progress");
    setError(null);
    try {
      setSendResult(await api.wealth.sendHandoff({
        familyRecipientIds: recipients.family.map((recipient) => recipient.id),
        emergencyRecipientIds: recipients.emergency.map((recipient) => recipient.id),
      }));
      setStatus("done");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not send SOS handoff.");
      setStatus("confirm");
    }
  }

  return (
    <div className="lp-sos-backdrop" role="presentation">
      <div className="lp-sos-dialog lp-sos-emergency" role="dialog" aria-modal="true" aria-labelledby="sos-title">
        <div className="lp-sos-head">
          <div><span><ShieldAlert size={16} /> Wealth module</span><h2 id="sos-title">SOS Handoff</h2><p>Emergency package for all verified Wealth recipients. Nothing sends until you confirm.</p></div>
          <button type="button" onClick={onClose} aria-label="Close SOS handoff"><X size={18} /></button>
        </div>
        {error ? <div className="lp-sos-error">{error}</div> : null}
        {status === "loading" ? <div className="lp-sos-loading"><Loader2 size={18} /> Loading emergency handoff</div> : null}
        {status === "confirm" && summary ? <Confirm summary={summary} familySummary={familySummary} emergencySummary={emergencySummary} /> : null}
        {status === "progress" ? <Progress /> : null}
        {status === "done" ? <Done sendResult={sendResult} sent={resultCounts.sent} failed={resultCounts.failed} /> : null}
        <div className="lp-sos-foot">
          {status === "done" ? <button type="button" className="primary" onClick={onClose}>Close</button> : null}
          {status === "confirm" ? <button type="button" className="primary danger" disabled={!canSend} onClick={send}><Mail size={15} /> Confirm and send</button> : null}
        </div>
      </div>
    </div>
  );
}

function Confirm({ summary, familySummary, emergencySummary }: { summary: WealthHandoffSummary; familySummary?: WealthHandoffSummary["handoffTypes"][number]; emergencySummary?: WealthHandoffSummary["handoffTypes"][number] }) {
  return (
    <div className="lp-sos-panel lp-sos-emergency-panel">
      <section className="lp-sos-confirm">
        <h3>Emergency send summary</h3>
        <p>Family recipients: <b>{summary.recipients.family.length}</b></p>
        <p>Emergency recipients: <b>{summary.recipients.emergency.length}</b></p>
        {familySummary ? <CountList title="Family package includes" counts={familySummary.counts} /> : null}
        {emergencySummary ? <CountList title="Emergency package includes" counts={emergencySummary.counts} /> : null}
        <div className="lp-sos-chips"><span>ZIP archive</span><span>Readable Wealth summary</span><span>Verified emails only</span><span>No passwords or keys</span></div>
        {emergencySummary?.excluded.length ? <div className="lp-sos-excluded">{emergencySummary.excluded.map((item) => <span key={item}>Emergency excludes {item}</span>)}</div> : null}
      </section>
    </div>
  );
}

function CountList({ title, counts }: { title: string; counts: WealthHandoffSummary["handoffTypes"][number]["counts"] }) {
  return <div className="lp-sos-counts"><b><PackageCheck size={15} /> {title}</b><span>{counts.assets} Assets</span><span>{counts.insurance} Insurance policies</span><span>{counts.loans} Loans</span><span>{counts.financialRecords} Financial records</span><span>{counts.documents} Documents</span><span>{counts.images} Images</span></div>;
}

function Progress() {
  return <div className="lp-sos-progress"><Loader2 size={24} /><b>Generating ZIP archive</b><span>Building the package and emailing verified recipients.</span><i><em /></i></div>;
}

function Done({ sendResult, sent, failed }: { sendResult: Awaited<ReturnType<typeof api.wealth.sendHandoff>> | null; sent: number; failed: number }) {
  return (
    <div className="lp-sos-progress done">
      <CheckCircle2 size={28} /><b>SOS Handoff complete</b><span>{sent} sent, {failed} failed.</span>
      {sendResult?.results.map((result) => <p key={`${result.handoffType}-${result.email}`}>{result.email}: {result.sent ? "sent" : result.reason ?? "failed"}</p>)}
    </div>
  );
}
