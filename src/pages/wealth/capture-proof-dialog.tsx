import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { FileUp, Paperclip, Trash2, X } from "lucide-react";

import UploadDocumentModal from "@/components/UploadDocumentModal";
import { api, type DocumentRecord, type WealthRecord, type WealthRecordPayload, type WealthRecordType } from "@/lib/api";
import { categories, documentTitle, fieldsObject, labelize } from "@/pages/documents/document-utils";
import { useAppSelector } from "@/store/hooks";

type Mode = "asset" | "proof";
type Props = { mode?: Mode; initialCategoryCode?: string; title?: string; onClose: () => void; onSaved: (record: WealthRecord) => void };

const currencies = ["INR", "USD", "EUR", "GBP", "AED", "SGD"];
const today = () => new Date().toISOString().slice(0, 10);
const css = {
  panel: "var(--lp-panel)",
  raised: "var(--lp-raised)",
  border: "var(--lp-border)",
  text: "var(--lp-text)",
  muted: "var(--lp-muted)",
  heading: "var(--lp-heading)",
  action: "var(--lp-action)",
  coral: "var(--lp-coral)",
  mint: "var(--lp-mint)",
};

function inputStyle(): CSSProperties {
  return { width: "100%", background: css.raised, border: `1px solid ${css.border}`, borderRadius: 9, padding: "9px 11px", color: css.text, fontSize: 14, outline: "none" };
}

function labelStyle(): CSSProperties {
  return { display: "block", marginBottom: 5, color: css.muted, fontSize: 12, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", fontVariantNumeric: "tabular-nums" };
}

function Modal({ children, onClose, danger }: { children: ReactNode; onClose: () => void; danger?: boolean }) {
  return <div className="lp-modalwrap" onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 72, background: "var(--lpv-scrim)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}><div className="lp-modalbox lp-wealth-ref-modal" onClick={(event) => event.stopPropagation()} style={{ background: css.panel, border: `1px solid ${danger ? "color-mix(in srgb, var(--lp-coral) 45%, transparent)" : css.border}`, borderRadius: 16, width: "min(500px,100%)", maxHeight: "92vh", overflowY: "auto", padding: 22 }}><div className="lp-sheet-grab lp-grabonly" />{children}</div></div>;
}

export default function CaptureProofDialog({ mode, initialCategoryCode, title, onClose, onSaved }: Props) {
  const resolved: Mode = mode ?? (initialCategoryCode === "payment_proof" ? "proof" : "asset");
  return resolved === "proof" ? <ProofModal onClose={onClose} onSaved={onSaved} /> : <HoldingModal title={title} onClose={onClose} onSaved={onSaved} />;
}

function HoldingModal({ title = "Add holding", onClose, onSaved }: { title?: string; onClose: () => void; onSaved: (record: WealthRecord) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [f, setF] = useState({ name: "", kind: "asset", type: "", institution: "", accountRef: "", value: "", currency: "INR", memberId: "you", renewalDate: "", maturityDate: "", accessNote: "", nominee: false, nomineeName: "" });
  const set = (key: string, value: string | boolean) => setF((current) => ({ ...current, [key]: value }));
  const kindType: WealthRecordType = f.kind === "liability" ? "LOAN_TAKEN" : f.kind === "cover" ? "INSURANCE" : "ASSET";
  const valueKey = f.kind === "liability" ? "principalAmount" : f.kind === "cover" ? "coverageAmount" : "value";
  const valid = f.name.trim().length > 0;

  async function save() {
    if (!valid) return;
    setBusy(true);
    setError(null);
    const details = { assetType: f.type, provider: f.institution, institution: f.institution, accountRef: f.accountRef, currency: f.currency, memberId: f.memberId, renewalDate: f.renewalDate, maturityDate: f.maturityDate, accessInstruction: f.accessNote, nominee: f.nomineeName || (f.nominee ? "Named" : ""), [valueKey]: f.value, amount: f.value };
    const payload: WealthRecordPayload = { type: kindType, title: f.name.trim(), details, notes: f.accessNote, followUpDate: null, followUpNote: "", attachmentDocumentIds: [] };
    try {
      onSaved(await api.wealth.createRecord(payload));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add holding.");
    } finally {
      setBusy(false);
    }
  }

  return <Modal onClose={onClose}><Head title={title} onClose={onClose} /><label style={labelStyle()}>Name</label><input style={inputStyle()} value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Investment portfolio" /><div className="lp-wealth-form-row" style={{ display: "flex", gap: 10, marginTop: 12 }}><Field label="Kind"><select style={inputStyle()} value={f.kind} onChange={(e) => set("kind", e.target.value)}>{["asset", "liability", "cover"].map((item) => <option key={item} value={item}>{item}</option>)}</select></Field><Field label="Type"><input style={inputStyle()} value={f.type} onChange={(e) => set("type", e.target.value)} placeholder="Mutual funds / Mortgage" /></Field></div><div className="lp-wealth-form-row" style={{ display: "flex", gap: 10, marginTop: 12 }}><Field label="Institution"><input style={inputStyle()} value={f.institution} onChange={(e) => set("institution", e.target.value)} placeholder="Bank / insurer" /></Field><Field label="Account"><input style={inputStyle()} value={f.accountRef} onChange={(e) => set("accountRef", e.target.value)} placeholder="...4821" /></Field></div><div className="lp-wealth-form-row" style={{ display: "flex", gap: 10, marginTop: 12 }}><Field label={f.kind === "liability" ? "Outstanding" : f.kind === "cover" ? "Cover" : "Value"}><input type="number" min="0" style={inputStyle()} value={f.value} onChange={(e) => set("value", e.target.value)} placeholder="0" /></Field><Field label="Currency"><select style={inputStyle()} value={f.currency} onChange={(e) => set("currency", e.target.value)}>{currencies.map((item) => <option key={item}>{item}</option>)}</select></Field></div><div style={{ marginTop: 12 }}><Field label="Owner"><select style={inputStyle()} value={f.memberId} onChange={(e) => set("memberId", e.target.value)}><option value="you">You</option></select></Field></div>{f.kind === "cover" ? <DateField label="Renewal date" value={f.renewalDate} onChange={(value) => set("renewalDate", value)} /> : null}{f.kind === "asset" ? <DateField label="Maturity date (deposits, retirement)" value={f.maturityDate} onChange={(value) => set("maturityDate", value)} /> : null}<div style={{ marginTop: 12 }}><label style={labelStyle()}>{f.kind === "liability" ? "Closure instructions for the family" : "Access instructions for the family"}</label><textarea style={{ ...inputStyle(), minHeight: 58, resize: "vertical", fontFamily: "inherit" }} value={f.accessNote} onChange={(e) => set("accessNote", e.target.value)} placeholder={f.kind === "liability" ? "Who to contact, account details, and how to close or take over the loan" : "Where it is, who to contact, how to claim (locker no., agent, portal)"} /></div>{f.kind !== "liability" ? <div className="lp-wealth-form-row" style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "center" }}><label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: css.text }}><input type="checkbox" checked={f.nominee} onChange={(e) => set("nominee", e.target.checked)} /> Nominee named</label>{f.nominee ? <input style={{ ...inputStyle(), flex: 1 }} value={f.nomineeName} onChange={(e) => set("nomineeName", e.target.value)} placeholder="Nominee name" /> : null}</div> : null}{error ? <div className="lp-sos-error">{error}</div> : null}<div className="lp-wealth-form-actions" style={{ display: "flex", gap: 10, marginTop: 20 }}><button disabled={!valid || busy} onClick={save} style={{ background: css.action, color: "var(--lp-action-text)", border: "none", borderRadius: 10, padding: "10px 15px", fontWeight: 800, flex: 1, minHeight: 44, opacity: valid && !busy ? 1 : 0.4 }}>{busy ? "Saving..." : "Add holding"}</button><button onClick={onClose} title="Close" aria-label="Close" style={{ background: css.raised, color: css.coral, border: `1px solid color-mix(in srgb, var(--lp-coral) 45%, transparent)`, borderRadius: 10, padding: "10px 14px" }}><Trash2 size={15} /></button></div></Modal>;
}

function ProofModal({ onClose, onSaved }: { onClose: () => void; onSaved: (record: WealthRecord) => void }) {
  const documents = useAppSelector((state) => state.documents.items);
  const user = useAppSelector((state) => state.auth.user);
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);
  const [uploading, setUploading] = useState(false);
  const [more, setMore] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [f, setF] = useState({ purpose: "", counterparty: "", direction: "paid", amount: "", currency: "INR", date: today(), followUpOn: "", followUpNote: "" });
  const set = (key: string, value: string) => setF((current) => ({ ...current, [key]: value }));
  const relevantDocs = useMemo(() => documents.filter(isWealthEvidenceDocument), [documents]);
  const valid = Boolean(selectedDoc && f.purpose.trim());
  const choose = (doc: DocumentRecord) => {
    setSelectedDoc(doc);
    setF((current) => ({ ...current, purpose: current.purpose || documentTitle(doc), amount: current.amount || amountFromDocument(doc) }));
  };

  async function save() {
    if (!valid || !selectedDoc) return;
    setBusy(true);
    setError(null);
    try {
      const amount = f.amount.trim();
      const details = { amount, currency: f.currency, date: f.date, party: f.counterparty, paidTo: f.direction === "paid" ? f.counterparty : "", receivedFrom: f.direction === "received" ? f.counterparty : "", direction: f.direction, followUpOn: f.followUpOn, sourceDocumentId: selectedDoc.id, sourceDocumentCategory: selectedDoc.category, sourceDocumentType: selectedDoc.documentType };
      const record = await api.wealth.createRecord({ type: wealthTypeFor(selectedDoc, f.direction), title: f.purpose.trim(), details, notes: f.followUpNote, followUpDate: f.followUpOn || null, followUpNote: f.followUpNote, attachmentDocumentIds: [selectedDoc.id] });
      onSaved(record);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to capture proof.");
    } finally {
      setBusy(false);
    }
  }

  if (uploading) return <UploadDocumentModal open onClose={() => setUploading(false)} onSaved={choose} />;
  if (!selectedDoc) return <Modal onClose={onClose}><div className="lp-vault-picker-head"><h2>From a document in your vault</h2><button type="button" onClick={onClose}>Done</button></div><button type="button" className="lp-vault-doc-row upload" onClick={() => setUploading(true)}><span className="lp-vault-icon upload"><FileUp size={17} /></span><span><b>Scan or upload a new document</b><small>Statement, policy, or deed. It is filed in Documents and opened here.</small></span></button><div className="lp-vault-doc-list">{relevantDocs.map((doc) => <DocumentRow key={doc.id} doc={doc} fallbackOwner={user?.name} onClick={() => choose(doc)} />)}{!relevantDocs.length ? <div className="lp-vault-empty">No matching vault documents yet.</div> : null}</div></Modal>;
  return <Modal onClose={onClose}><Head title="Capture proof" onClose={onClose} /><DocumentRow doc={selectedDoc} fallbackOwner={user?.name} selected onClick={() => setSelectedDoc(null)} /><label style={{ ...labelStyle(), marginTop: 14 }}>What for</label><input style={inputStyle()} value={f.purpose} onChange={(e) => set("purpose", e.target.value)} placeholder="e.g. investment account, loan proof, policy" /><div className="lp-wealth-form-row" style={{ display: "flex", gap: 10 }}><Field label="Amount"><input style={inputStyle()} type="number" min="0" value={f.amount} onChange={(e) => set("amount", e.target.value)} placeholder="Optional" /></Field><Field label="Currency"><select style={inputStyle()} value={f.currency} onChange={(e) => set("currency", e.target.value)}>{currencies.map((item) => <option key={item}>{item}</option>)}</select></Field></div><div className="lp-wealth-form-row" style={{ display: "flex", gap: 10, marginTop: 12 }}><Field label="Which way"><select style={inputStyle()} value={f.direction} onChange={(e) => set("direction", e.target.value)}><option value="paid">I lent / paid</option><option value="received">I borrowed / received</option></select></Field><Field label="Date"><input style={inputStyle()} type="date" value={f.date} onChange={(e) => set("date", e.target.value)} /></Field></div><button onClick={() => setMore((value) => !value)} style={{ background: "none", border: "none", cursor: "pointer", color: css.muted, fontSize: 12.5, fontWeight: 600, padding: 0, marginTop: 12 }}>{more ? "Fewer details" : "Who and when to follow up"}</button>{more ? <><label style={{ ...labelStyle(), marginTop: 12 }}>Who</label><input style={inputStyle()} value={f.counterparty} onChange={(e) => set("counterparty", e.target.value)} placeholder="e.g. bank, insurer, person" /><div className="lp-wealth-form-row" style={{ display: "flex", gap: 10 }}><Field label="Follow up on"><input style={inputStyle()} type="date" value={f.followUpOn} onChange={(e) => set("followUpOn", e.target.value)} /></Field><Field label="Follow-up note"><input style={inputStyle()} value={f.followUpNote} onChange={(e) => set("followUpNote", e.target.value)} placeholder="e.g. call branch" /></Field></div></> : null}{error ? <div className="lp-sos-error">{error}</div> : null}<button disabled={!valid || busy} onClick={save} style={{ background: css.action, color: "var(--lp-action-text)", border: "none", borderRadius: 10, width: "100%", justifyContent: "center", marginTop: 16, minHeight: 44, fontWeight: 800, opacity: valid && !busy ? 1 : 0.4 }}>{busy ? "Saving..." : "Use as proof"}</button></Modal>;
}

function DocumentRow({ doc, fallbackOwner, onClick, selected }: { doc: DocumentRecord; fallbackOwner?: string; onClick: () => void; selected?: boolean }) {
  const meta = categoryMeta(doc.category);
  const Icon = meta.icon;
  const owner = doc.owner || fallbackOwner || "You";
  return <button type="button" className={`lp-vault-doc-row ${selected ? "selected" : ""}`} onClick={onClick}><span className="lp-vault-icon" style={{ color: meta.accent, borderColor: `${meta.accent}55`, background: `${meta.accent}18` }}><Icon size={16} /></span><span><b>{documentTitle(doc)}</b><small>{owner} · {labelize(doc.category)}</small></span></button>;
}

function categoryMeta(category: string) {
  return categories.find((item) => item.name.toLowerCase() === category.toLowerCase() || item.key === category.toLowerCase()) ?? categories[categories.length - 1]!;
}

function isWealthEvidenceDocument(doc: DocumentRecord) {
  const haystack = [doc.category, doc.documentType, doc.normalizedType, doc.title, doc.originalName, JSON.stringify(fieldsObject(doc))].join(" ").toLowerCase();
  return ["finance", "insurance", "bank", "investment", "itr", "tax", "transaction", "property", "deed", "loan", "liability", "policy", "statement", "payment", "receipt"].some((word) => haystack.includes(word));
}

function amountFromDocument(doc: DocumentRecord) {
  const fields = fieldsObject(doc);
  const found = ["amount", "value", "coverageAmount", "principalAmount"].map((key) => fields[key]).find((value) => typeof value === "string" || typeof value === "number");
  return found ? String(found).replace(/[^\d.]/g, "") : "";
}

function wealthTypeFor(doc: DocumentRecord, direction: string): WealthRecordType {
  const haystack = `${doc.category} ${doc.documentType} ${doc.normalizedType ?? ""}`.toLowerCase();
  if (haystack.includes("insurance") || haystack.includes("policy")) return "INSURANCE";
  if (haystack.includes("loan") || direction === "received") return "LOAN_TAKEN";
  if (haystack.includes("payment") || haystack.includes("receipt") || haystack.includes("transaction")) return "PAYMENT_PROOF";
  return "ASSET";
}

function Head({ title, onClose }: { title: string; onClose: () => void }) {
  return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><b style={{ color: css.heading, fontSize: 18 }}>{title}</b><button onClick={onClose} style={{ background: css.raised, border: `1px solid ${css.border}`, borderRadius: 10, color: css.text, padding: 8 }}><X size={16} /></button></div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div style={{ flex: 1, marginTop: 12 }}><label style={labelStyle()}>{label}</label>{children}</div>;
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <div style={{ marginTop: 12 }}><label style={labelStyle()}>{label}</label><input type="date" style={inputStyle()} value={value} onChange={(e) => onChange(e.target.value)} /></div>;
}
