import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Calculator, ChevronRight, Coins, FileCheck, FileText, Landmark, Link2, Paperclip, Plus, Search, ShieldAlert, ShieldCheck, Wallet, X } from "lucide-react";
import { useLocation } from "react-router-dom";

import Card from "@/components/Card";
import SectionHead from "@/components/SectionHead";
import { btnGhost } from "@/constants/theme";
import { api, type WealthRecord } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchDocuments } from "@/store/slices/documentsSlice";
import CaptureProofDialog from "./capture-proof-dialog";
import RecordActionsDialog from "./record-actions-dialog";
import WealthHandoffDialog from "./sos-handoff-dialog";
import { attentionRows, calculateLoanBreakdown, dashboardStats, money, recordAmount, recordSubtitle, statusFor, typeLabels } from "./wealth-view";

export default function WealthPage() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const docsLoaded = useAppSelector((state) => state.documents.loaded);
  const user = useAppSelector((state) => state.auth.user);
  const [records, setRecords] = useState<WealthRecord[]>([]);
  const [captureOpen, setCaptureOpen] = useState<"asset" | "proof" | null>(null);
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [handoffOpen, setHandoffOpen] = useState(false);
  const [selected, setSelected] = useState<WealthRecord | null>(null);
  const [action, setAction] = useState<{ mode: "edit" | "note" | "attach" | "delete"; record: WealthRecord } | null>(null);
  const [query, setQuery] = useState("");
  const [showMath, setShowMath] = useState(false);
  const stats = useMemo(() => dashboardStats(records), [records]);
  const shownRecords = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return records;
    return records.filter((record) => [record.title, recordSubtitle(record), typeLabels[record.type], ...Object.values(record.details).map(String)].join(" ").toLowerCase().includes(needle));
  }, [query, records]);
  const shownStats = useMemo(() => dashboardStats(shownRecords), [shownRecords]);

  const load = async () => {
    setRecords(await api.wealth.records());
  };
  useEffect(() => {
    void load();
    if (!docsLoaded) void dispatch(fetchDocuments());
  }, [dispatch, docsLoaded]);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const record = records.find((item) => item.id === params.get("record"));
    if (!record) return;
    const mode = params.get("action");
    if (mode === "attach" || mode === "note") setAction({ mode, record });
    else setSelected(record);
  }, [location.search, records]);

  const saved = (record: WealthRecord) => setRecords((current) => [record, ...current.filter((item) => item.id !== record.id)]);
  const deleted = (id: string) => setRecords((current) => current.filter((item) => item.id !== id));

  return (
    <div className="lp-route lp-wealth-route">
      <div className="lp-mobile-module-head">
        <h1>Wealth</h1>
        <div>
          <button type="button" onClick={() => setActionSheetOpen(true)} aria-label="Wealth actions"><Plus size={18} /></button>
          <button type="button" aria-label="Search Wealth"><Search size={17} /></button>
          <span>{user?.name?.charAt(0).toUpperCase() || "A"}</span>
        </div>
      </div>
      <SectionHead title="Wealth" sub="Not a balance sheet: whether your family could access all of it if something happened to you." action={null} />
      <div className="lp-wealth-actions">
        <button type="button" style={btnGhost} onClick={() => setCaptureOpen("asset")}><Plus size={15} /> Add holding</button>
        <button type="button" style={btnGhost} onClick={() => setCaptureOpen("proof")}><FileCheck size={15} /> Capture proof</button>
        <button type="button" className="danger" onClick={() => setHandoffOpen(true)}><ShieldAlert size={15} /> SOS handoff</button>
      </div>
      {actionSheetOpen ? (
        <WealthActionSheet
          onClose={() => setActionSheetOpen(false)}
          onDocument={() => { setActionSheetOpen(false); setCaptureOpen("proof"); }}
          onHolding={() => { setActionSheetOpen(false); setCaptureOpen("asset"); }}
          onMoney={() => { setActionSheetOpen(false); setCaptureOpen("proof"); }}
        />
      ) : null}
      <Readiness stats={stats} records={records} showMath={showMath} onMath={() => setShowMath((value) => !value)} onSummary={() => setHandoffOpen(true)} />
      {showMath ? <ReadinessMath records={records} /> : null}
      <NeedsAttention records={shownRecords} onSelect={setSelected} onAction={(mode, record) => setAction({ mode, record })} />
      {!shownRecords.length ? <EmptyWealth query={query} onCapture={() => setCaptureOpen("asset")} /> : null}
      <RecordSection title="Accounts and investments" total={shownStats.assetTotal} records={shownStats.assets} tone="asset" onSelect={setSelected} />
      <RecordSection title="Loans" total={shownStats.liabilityTotal} records={shownStats.liabilities} tone="liability" negative onSelect={setSelected} />
      <RecordSection title="Insurance" total={shownStats.protectionTotal} records={shownStats.protection} tone="protection" onSelect={setSelected} />
      <LentBorrowedSection records={shownStats.lentBorrowed} onRecord={() => setCaptureOpen("proof")} onSelect={setSelected} />
      {captureOpen ? <CaptureProofDialog mode={captureOpen} initialCategoryCode={captureOpen === "asset" ? "asset" : "payment_proof"} title={captureOpen === "asset" ? "Add holding" : "Capture proof"} onClose={() => setCaptureOpen(null)} onSaved={(record) => { saved(record); setCaptureOpen(null); }} /> : null}
      {selected ? <RecordDetail record={selected} onClose={() => setSelected(null)} onAction={(mode) => setAction({ mode, record: selected })} /> : null}
      {action ? <RecordActionsDialog mode={action.mode} record={action.record} onClose={() => setAction(null)} onDeleted={(id) => { deleted(id); setSelected(null); }} onSaved={(record) => { saved(record); setSelected(record); }} /> : null}
      {handoffOpen ? <WealthHandoffDialog onClose={() => setHandoffOpen(false)} /> : null}
    </div>
  );
}

function WealthActionSheet({ onClose, onDocument, onHolding, onMoney }: { onClose: () => void; onDocument: () => void; onHolding: () => void; onMoney: () => void }) {
  return (
    <>
      <div className="lp-scrim" onClick={onClose} />
      <div className="lp-sheet" role="dialog" aria-modal="true" aria-label="Wealth actions">
        <div className="lp-sheet-grab" />
        <div className="lp-sheet-head"><b>Wealth actions</b><button type="button" onClick={onClose}>Done</button></div>
        <button type="button" className="lp-sheet-item" onClick={onDocument}><FileText size={19} /> From a document in your vault</button>
        <button type="button" className="lp-sheet-item" onClick={onHolding}><Plus size={19} /> Without a document (cash, gold, informal)</button>
        <button type="button" className="lp-sheet-item" onClick={onMoney}><Coins size={19} /> Record money lent or borrowed</button>
      </div>
    </>
  );
}

function Readiness({ stats, records, showMath, onMath, onSummary }: { stats: ReturnType<typeof dashboardStats>; records: WealthRecord[]; showMath: boolean; onMath: () => void; onSummary: () => void }) {
  const gaps = stats.accessMissing;
  const withAccess = records.length - gaps;
  const owedToYou = records.filter((record) => record.type === "LOAN_GIVEN" || (record.type === "PAYMENT_PROOF" && record.details.direction !== "received")).reduce((total, record) => total + recordAmount(record), 0);
  return (
    <Card className="lp-wealth-summary-card">
      <div className="lp-wealth-summary-main">
        <div className="lp-wealth-card-title"><span><Link2 size={16} /> Family access readiness</span></div>
        <div className="lp-wealth-score">{stats.readiness}%</div>
        <div className="lp-wealth-progress"><i style={{ width: `${stats.readiness}%` }} /></div>
        <div className="lp-wealth-gaps"><span>{records.length} docs</span><span>{gaps} access missing</span></div>
        <button className="lp-wealth-how" type="button" onClick={onMath}>{showMath ? "Hide" : "How?"}</button>
        <div className="lp-wealth-summary-side">
          <div><span>Owed to you</span><b>{money(owedToYou)}</b></div>
          <div><span>You owe</span><b>{money(stats.liabilityTotal)}</b></div>
        </div>
      </div>
      <div className="lp-wealth-summary-actions">
        <button type="button" onClick={onSummary}>Family summary <ChevronRight size={14} /></button>
        
      </div>
    </Card>
  );
}

function ReadinessMath({ records }: { records: WealthRecord[] }) {
  return <Card style={{ marginBottom: 14 }}><p className="lp-wealth-math-copy">Readiness counts each record once for proof and once for access instructions. Nominees stay visible on rows, but are not folded into this score yet.</p>{records.slice(0, 6).map((record) => { const status = statusFor(record); return <div key={record.id} className="lp-wealth-math-row"><span>{record.title}</span><b>{status.document ? "proof" : "no proof"} · {status.access ? "access" : "no access"}</b></div>; })}</Card>;
}

function NeedsAttention({ records, onSelect, onAction }: { records: WealthRecord[]; onSelect: (record: WealthRecord) => void; onAction: (mode: "note" | "attach", record: WealthRecord) => void }) {
  const [all, setAll] = useState(false);
  const rows = attentionRows(records);
  const shownRows = all ? rows : rows.slice(0, 3);
  return (
    <Card style={{ padding: 0, overflow: "hidden", marginBottom: 16 }}>
      <div className="lp-wealth-panel-head"><span><AlertTriangle size={16} /> Needs attention</span><b>{rows.length}</b></div>
      {shownRows.map(({ record, severity, reason, action }) => <button key={`${record.id}-${reason}`} type="button" className="lp-wealth-attention-row" onClick={() => action === "Attach" ? onAction("attach", record) : action === "Add note" ? onAction("note", record) : onSelect(record)}><em className={severity.toLowerCase()}>{severity[0] + severity.slice(1).toLowerCase()}</em><span><b>{record.title} · {reason}</b><small>{recordSubtitle(record)}</small></span><strong>{action}</strong><ChevronRight size={14} /></button>)}
      {rows.length > 3 ? <button type="button" className="lp-wealth-view-all" onClick={() => setAll((value) => !value)}>{all ? "Show less" : `View all ${rows.length}`} <ChevronRight size={14} /></button> : null}
      {!rows.length ? <div className="lp-wealth-empty">No urgent Wealth gaps right now.</div> : null}
    </Card>
  );
}

function EmptyWealth({ query, onCapture }: { query: string; onCapture: () => void }) {
  return <Card style={{ textAlign: "center", padding: "26px 20px", marginBottom: 16 }}><span className="lp-wealth-empty-icon"><Wallet size={22} /></span><div className="lp-wealth-empty-title">{query ? "No matching records" : "Nothing recorded yet"}</div><p>{query ? "Try another search term, or capture proof for a new account, policy, loan, or payment." : "Capture an account, a policy, a loan, or informal money proof so your family can find it later."}</p><button type="button" className="lp-wealth-summary-primary" onClick={onCapture}>Capture proof</button></Card>;
}

function RecordSection({ title, total, records, negative, tone, onSelect }: { title: string; total?: number; records: WealthRecord[]; negative?: boolean; tone: "asset" | "liability" | "protection" | "proof"; onSelect: (record: WealthRecord) => void }) {
  if (!records.length) return null;
  return (
    <Card style={{ padding: 0, overflow: "hidden", marginBottom: 16 }}>
      <div className="lp-wealth-section-head"><span>{title}</span>{total !== undefined ? <b>{negative ? "-" : ""}{money(total)}</b> : null}</div>
      {records.map((record) => <RecordRow key={record.id} record={record} negative={negative} tone={tone} onSelect={() => onSelect(record)} />)}
    </Card>
  );
}

function LentBorrowedSection({ records, onRecord, onSelect }: { records: WealthRecord[]; onRecord: () => void; onSelect: (record: WealthRecord) => void }) {
  if (!records.length) return null;
  const open = records.filter((record) => record.followUpDate || record.type === "LOAN_GIVEN" || record.type === "LOAN_TAKEN").length;
  return (
    <Card style={{ padding: 0, overflow: "hidden", marginBottom: 16 }}>
      <div className="lp-wealth-section-head lp-lent-head"><span>Lent and borrowed</span><small>{open} open</small><button type="button" onClick={onRecord}>Record</button></div>
      {records.map((record) => <LentBorrowedRow key={record.id} record={record} onSelect={() => onSelect(record)} />)}
    </Card>
  );
}

function LentBorrowedRow({ record, onSelect }: { record: WealthRecord; onSelect: () => void }) {
  const party = String(record.details.party || record.details.paidTo || record.details.receivedFrom || record.details.provider || "Unspecified");
  const amount = recordAmount(record);
  const youOwe = record.type === "LOAN_TAKEN" || record.details.direction === "received";
  const settled = !record.followUpDate && record.type === "PAYMENT_PROOF";
  return (
    <button type="button" className="lp-lent-row" onClick={onSelect}>
      <span><b>{party}</b><small>{record.title} · {record.followUpDate ? `follow up ${new Date(record.followUpDate).toLocaleDateString()}` : settled ? "settled" : "open"}</small></span>
      <strong className={youOwe ? "negative" : ""}>{money(amount)} {settled ? "" : youOwe ? "you owe" : "owed to you"}</strong>
      <span className="lp-wchips"><StatusBadge ok={record.attachments.length > 0} label="Evidence" /><StatusBadge ok={party !== "Unspecified"} label="Contact" /></span>
      <em>{settled ? "Reopen" : "Settled"}</em>
      <ChevronRight size={14} className="lp-wealth-chevron" />
    </button>
  );
}

function RecordRow({ record, negative, tone, onSelect }: { record: WealthRecord; negative?: boolean; tone: "asset" | "liability" | "protection" | "proof"; onSelect: () => void }) {
  const status = statusFor(record);
  const Icon = tone === "liability" ? Landmark : tone === "protection" ? ShieldCheck : tone === "proof" ? FileCheck : Coins;
  return (
    <button type="button" className="lp-wealth-record-row lp-wrow lp-hrow" onClick={onSelect}>
      <span className={`lp-wealth-link-icon ${tone}`}><Icon size={14} /></span><span className="lp-wname"><b>{record.title}</b><small>{recordSubtitle(record)}</small></span>
      <strong className={`lp-wamt ${negative ? "negative" : ""}`}>{negative ? "-" : ""}{money(recordAmount(record))}</strong>
      <span className="lp-wchips"><StatusBadge ok={status.document} label="Doc" /><StatusBadge ok={status.nominee} label="Nominee" /><StatusBadge ok={status.access} label="Access" /></span>
      <ChevronRight size={14} className="lp-wealth-chevron" />
    </button>
  );
}

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return <em className={`lp-wealth-status ${ok ? "ok" : "bad"}`}>{ok ? "✓" : "×"} {label}</em>;
}

function RecordDetail({ record, onClose, onAction }: { record: WealthRecord; onClose: () => void; onAction: (mode: "edit" | "attach" | "delete") => void }) {
  const details = Object.entries(record.details).filter(([, value]) => value !== null && value !== "");
  const loanBreakdown = calculateLoanBreakdown(record) ?? record.loanBreakdown;
  return <div className="lp-sos-backdrop" role="presentation"><div className="lp-sos-dialog lp-wealth-detail" role="dialog" aria-modal="true"><div className="lp-sos-head"><div><span><Link2 size={16} /> {typeLabels[record.type]}</span><h2>{record.title}</h2></div><button type="button" onClick={onClose} aria-label="Close"><X size={18} /></button></div><div className="lp-sos-panel"><section className="lp-sos-group"><h3>Record details</h3>{details.map(([key, value]) => <div key={key} className="lp-wealth-kv"><span>{key.replace(/([A-Z])/g, " $1")}</span><b>{String(value)}</b></div>)}{record.notes ? <div className="lp-wealth-note"><span>Notes</span>{record.notes}</div> : null}{record.followUpDate || record.followUpNote ? <div className="lp-wealth-note"><span>Follow-up</span>{record.followUpDate ? new Date(record.followUpDate).toLocaleDateString() : ""} {record.followUpNote}</div> : null}</section><section className="lp-sos-group"><h3>Attached proof</h3>{record.attachments.map((doc) => <div key={doc.id} className="lp-sos-recipient"><Paperclip size={15} /><span><b>{doc.title || doc.originalName}</b><small>{doc.mimeType}</small></span></div>)}{!record.attachments.length ? <p>No proof attached yet.</p> : null}{loanBreakdown ? <div className="lp-wealth-loan-box"><h3><Calculator size={15} /> Loan breakup</h3><b>Principal {money(loanBreakdown.principal)}</b><b>Interest {money(loanBreakdown.interest)}</b><b>Payments {money(loanBreakdown.payments)}</b><strong>Outstanding {money(loanBreakdown.outstanding)}</strong></div> : null}<div className="lp-wealth-detail-actions"><button type="button" onClick={() => onAction("edit")}>Edit</button><button type="button" onClick={() => onAction("attach")}>Attach proof</button><button type="button" className="danger" onClick={() => onAction("delete")}>Delete</button></div></section></div></div></div>;
}
