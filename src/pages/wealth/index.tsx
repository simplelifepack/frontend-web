import { useEffect, useMemo, useState } from "react";
import { Calculator, FileCheck, Link2, Paperclip, Search, ShieldAlert, X } from "lucide-react";

import Card from "@/components/Card";
import SectionHead from "@/components/SectionHead";
import { btnGhost } from "@/constants/theme";
import { api, type TrustMember, type WealthRecord } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchDocuments } from "@/store/slices/documentsSlice";
import CaptureProofDialog from "./capture-proof-dialog";
import WealthHandoffDialog from "./sos-handoff-dialog";
import { attentionRows, calculateLoanBreakdown, dashboardStats, money, recordAmount, recordSubtitle, statusFor, typeLabels } from "./wealth-view";

export default function WealthPage() {
  const dispatch = useAppDispatch();
  const docsLoaded = useAppSelector((state) => state.documents.loaded);
  const user = useAppSelector((state) => state.auth.user);
  const [records, setRecords] = useState<WealthRecord[]>([]);
  const [trustedMembers, setTrustedMembers] = useState<TrustMember[]>([]);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [handoffOpen, setHandoffOpen] = useState(false);
  const [selected, setSelected] = useState<WealthRecord | null>(null);
  const stats = useMemo(() => dashboardStats(records), [records]);

  const load = async () => {
    setRecords(await api.wealth.records());
    api.trust.get().then((trust) => setTrustedMembers(trust.members)).catch(() => setTrustedMembers([]));
  };
  useEffect(() => {
    void load();
    if (!docsLoaded) void dispatch(fetchDocuments());
  }, [dispatch, docsLoaded]);

  const saved = (record: WealthRecord) => setRecords((current) => [record, ...current.filter((item) => item.id !== record.id)]);

  return (
    <div className="lp-route lp-wealth-route">
      <div className="lp-wealth-page-top">
        <div className="lp-wealth-search"><Search size={15} /><input placeholder="Search..." /></div>
        {user ? <div className="lp-wealth-user"><span>{user.name.charAt(0).toUpperCase()}</span><b>{user.name}</b></div> : null}
      </div>
      <SectionHead title="Wealth" sub="Not a balance sheet: whether your family could access all of it if something happened to you." action={null} />
      <div className="lp-wealth-actions">
        <button type="button" style={btnGhost} onClick={() => setCaptureOpen(true)}><FileCheck size={15} /> Capture proof</button>
        <button type="button" className="danger" onClick={() => setHandoffOpen(true)}><ShieldAlert size={15} /> SOS handoff</button>
      </div>
      <Readiness stats={stats} records={records} onSummary={() => setHandoffOpen(true)} />
      <div className="lp-wealth-main-grid">
        <div>
          <NeedsAttention records={records} onSelect={setSelected} onCapture={() => setCaptureOpen(true)} />
          <RecordSection title="Assets" total={stats.assetTotal} records={stats.assets} onSelect={setSelected} />
          <RecordSection title="Liabilities" total={stats.liabilityTotal} records={stats.liabilities} negative onSelect={setSelected} />
          <RecordSection title="Protection" total={stats.protectionTotal} records={stats.protection} onSelect={setSelected} />
          <RecordSection title="Payment proofs" records={stats.proofs} onSelect={setSelected} />
        </div>
        <LegacyPanel readiness={stats.readiness} members={trustedMembers} onHandoff={() => setHandoffOpen(true)} />
      </div>
      {captureOpen ? <CaptureProofDialog onClose={() => setCaptureOpen(false)} onSaved={(record) => { saved(record); setCaptureOpen(false); }} /> : null}
      {selected ? <RecordDetail record={selected} onClose={() => setSelected(null)} /> : null}
      {handoffOpen ? <WealthHandoffDialog onClose={() => setHandoffOpen(false)} /> : null}
    </div>
  );
}

function Readiness({ stats, records, onSummary }: { stats: ReturnType<typeof dashboardStats>; records: WealthRecord[]; onSummary: () => void }) {
  return (
    <>
      <div className="lp-wealth-readiness">
        <b><Link2 size={15} /> Estate readiness</b><strong>{stats.readiness}%</strong><span><i style={{ width: `${stats.readiness}%` }} /></span>
        <small>{records.length} records · {stats.accessMissing} access missing</small><button type="button">How?</button><button type="button" onClick={onSummary}>Estate summary</button>
      </div>
      <div className="lp-wealth-strip">
        <span>Net worth <b>{money(stats.assetTotal - stats.liabilityTotal)}</b></span><span>Assets <b>{money(stats.assetTotal)}</b></span>
        <span>Liabilities <b>{money(stats.liabilityTotal)}</b></span><span>Protection <b>{money(stats.protectionTotal)}</b></span>
      </div>
    </>
  );
}

function NeedsAttention({ records, onSelect, onCapture }: { records: WealthRecord[]; onSelect: (record: WealthRecord) => void; onCapture: () => void }) {
  const rows = attentionRows(records);
  return (
    <Card style={{ padding: 0, overflow: "hidden", marginBottom: 16 }}>
      <div className="lp-wealth-panel-head"><span>Needs attention</span><b>{rows.length}</b></div>
      {rows.map(({ record, severity, reason, action }) => <button key={`${record.id}-${reason}`} type="button" className="lp-wealth-attention-row" onClick={() => action === "Attach" ? onCapture() : onSelect(record)}><em className={severity.toLowerCase()}>{severity}</em><span><b>{record.title} · {reason}</b><small>{recordSubtitle(record)}</small></span><strong>{action}</strong></button>)}
      {!rows.length ? <div className="lp-wealth-empty">No urgent Wealth gaps right now.</div> : null}
    </Card>
  );
}

function RecordSection({ title, total, records, negative, onSelect }: { title: string; total?: number; records: WealthRecord[]; negative?: boolean; onSelect: (record: WealthRecord) => void }) {
  if (!records.length) return null;
  return (
    <Card style={{ padding: 0, overflow: "hidden", marginBottom: 16 }}>
      <div className="lp-wealth-section-head"><span>{title}</span>{total !== undefined ? <b>{negative ? "-" : ""}{money(total)}</b> : null}</div>
      {records.map((record) => <RecordRow key={record.id} record={record} negative={negative} onSelect={() => onSelect(record)} />)}
    </Card>
  );
}

function RecordRow({ record, negative, onSelect }: { record: WealthRecord; negative?: boolean; onSelect: () => void }) {
  const status = statusFor(record);
  return (
    <button type="button" className="lp-wealth-record-row" onClick={onSelect}>
      <span className="lp-wealth-link-icon"><Link2 size={14} /></span><span><b>{record.title}</b><small>{recordSubtitle(record)}</small></span>
      <strong className={negative ? "negative" : ""}>{negative ? "-" : ""}{money(recordAmount(record))}</strong>
      <StatusBadge ok={status.document} label="Doc" /><StatusBadge ok={status.nominee} label="Nominee" /><StatusBadge ok={status.access} label="Access" />
    </button>
  );
}

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return <em className={`lp-wealth-status ${ok ? "ok" : "bad"}`}>{ok ? "✓" : "×"} {label}</em>;
}

function LegacyPanel({ readiness, members, onHandoff }: { readiness: number; members: TrustMember[]; onHandoff: () => void }) {
  return <Card style={{ position: "sticky", top: 16, height: "max-content" }}><div className="lp-wealth-summary-title"><Link2 size={16} /> Legacy handoff</div><p>Who steps in, and whether nothing is lost if you are gone.</p><div className="lp-wealth-legacy-score"><b>{readiness}</b><span>of documented value has a document, a nominee, and access instructions on file</span></div>{members.slice(0, 3).map((member) => <div key={member.id} className="lp-wealth-trusted"><span>{member.name.charAt(0)}</span><b>{member.name}</b><em>{member.accessType.name}</em></div>)}<button type="button" className="lp-wealth-summary-primary" onClick={onHandoff}>Prepare estate summary</button><button type="button" style={{ ...btnGhost, width: "100%", justifyContent: "center", marginTop: 8 }}>Manage trusted people</button></Card>;
}

function RecordDetail({ record, onClose }: { record: WealthRecord; onClose: () => void }) {
  const details = Object.entries(record.details).filter(([, value]) => value !== null && value !== "");
  const loanBreakdown = calculateLoanBreakdown(record) ?? record.loanBreakdown;
  return <div className="lp-sos-backdrop" role="presentation"><div className="lp-sos-dialog lp-wealth-detail" role="dialog" aria-modal="true"><div className="lp-sos-head"><div><span><Link2 size={16} /> {typeLabels[record.type]}</span><h2>{record.title}</h2></div><button type="button" onClick={onClose} aria-label="Close"><X size={18} /></button></div><div className="lp-sos-panel"><section className="lp-sos-group"><h3>Record details</h3>{details.map(([key, value]) => <div key={key} className="lp-wealth-kv"><span>{key.replace(/([A-Z])/g, " $1")}</span><b>{String(value)}</b></div>)}{record.notes ? <div className="lp-wealth-note"><span>Notes</span>{record.notes}</div> : null}{record.followUpDate || record.followUpNote ? <div className="lp-wealth-note"><span>Follow-up</span>{record.followUpDate ? new Date(record.followUpDate).toLocaleDateString() : ""} {record.followUpNote}</div> : null}</section><section className="lp-sos-group"><h3>Attached proof</h3>{record.attachments.map((doc) => <div key={doc.id} className="lp-sos-recipient"><Paperclip size={15} /><span><b>{doc.title || doc.originalName}</b><small>{doc.mimeType}</small></span></div>)}{!record.attachments.length ? <p>No proof attached yet.</p> : null}{loanBreakdown ? <div className="lp-wealth-loan-box"><h3><Calculator size={15} /> Loan breakup</h3><b>Principal {money(loanBreakdown.principal)}</b><b>Interest {money(loanBreakdown.interest)}</b><b>Payments {money(loanBreakdown.payments)}</b><strong>Outstanding {money(loanBreakdown.outstanding)}</strong></div> : null}</section></div></div></div>;
}
