import { useState } from "react";
import { ChevronUp, Paperclip, Trash2, X } from "lucide-react";

import { api, type WealthRecord, type WealthRecordPayload } from "@/lib/api";
import { useAppDispatch } from "@/store/hooks";
import { fetchDocuments } from "@/store/slices/documentsSlice";
import { classifyWealthRecord, recordAmount, typeLabels } from "./wealth-view";

type ActionMode = "edit" | "note" | "attach" | "delete";

type Props = {
  mode: ActionMode;
  record: WealthRecord;
  onClose: () => void;
  onDeleted: (id: string) => void;
  onSaved: (record: WealthRecord) => void;
};

function payload(record: WealthRecord, patch: Partial<WealthRecordPayload> = {}): WealthRecordPayload {
  return {
    type: patch.type ?? record.type,
    title: patch.title ?? record.title,
    details: patch.details ?? record.details,
    notes: patch.notes ?? record.notes ?? "",
    followUpDate: patch.followUpDate ?? record.followUpDate ?? null,
    followUpNote: patch.followUpNote ?? record.followUpNote ?? "",
    attachmentDocumentIds: patch.attachmentDocumentIds ?? record.attachmentDocumentIds ?? record.attachments.map((item) => item.documentId),
  };
}

function detailText(record: WealthRecord, key: string) {
  const value = record.details[key];
  return value == null ? "" : String(value);
}

function isMoneyLentBorrowed(record: WealthRecord) {
  return record.details.recordKind === "money_lent_borrowed";
}

export default function RecordActionsDialog({ mode, record, onClose, onDeleted, onSaved }: Props) {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState(record.title);
  const [amount, setAmount] = useState(String(recordAmount(record) || ""));
  const [currency, setCurrency] = useState(detailText(record, "currency") || "INR");
  const [direction, setDirection] = useState(detailText(record, "direction") === "BORROWED" ? "BORROWED" : "LENT");
  const [transactionDate, setTransactionDate] = useState(detailText(record, "transactionDate") || detailText(record, "date"));
  const [who, setWho] = useState(detailText(record, "who") || detailText(record, "party"));
  const [followUpDate, setFollowUpDate] = useState(record.followUpDate ? record.followUpDate.slice(0, 10) : "");
  const [followUpNote, setFollowUpNote] = useState(record.followUpNote ?? "");
  const [accessInstruction, setAccessInstruction] = useState(detailText(record, "accessInstruction"));
  const [notes, setNotes] = useState(record.notes ?? "");
  const [files, setFiles] = useState<File[]>([]);
  const [more, setMore] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveRecord(next: WealthRecordPayload) {
    setBusy(true);
    setError(null);
    try {
      const saved = await api.wealth.updateRecord(record.id, next);
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update Wealth record.");
    } finally {
      setBusy(false);
    }
  }

  async function attachFiles() {
    if (!files.length) return;
    setBusy(true);
    setError(null);
    try {
      const domain = classifyWealthRecord(record);
      const analysis = await api.documents.analyze(files, false);
      const primary = analysis.files[0]!;
      const saved = await api.documents.save({
        tempFileIds: analysis.files.map((item) => item.tempFileId),
        originalName: primary.originalName,
        mimeType: primary.mimeType,
        size: analysis.files.reduce((sum, item) => sum + item.size, 0),
        title: title.trim() || primary.originalName,
        category: domain === "protection" ? "Insurance" : "Finance",
        documentType: typeLabels[record.type],
        confidence: 90,
        fields: { nameOnDocument: analysis.document.nameOnDocument ?? undefined, uniqueNumber: analysis.document.uniqueNumber ?? undefined },
        reviewFields: [],
        rawExtractedText: "",
        warnings: analysis.warnings ?? [],
        evidence: [],
        analysisSource: "ai",
        userConfirmedUnknown: true,
      });
      const nextIds = [...new Set([...(record.attachmentDocumentIds ?? record.attachments.map((item) => item.documentId)), saved.document.id])];
      const updated = await api.wealth.updateRecord(record.id, payload(record, { attachmentDocumentIds: nextIds }));
      void dispatch(fetchDocuments());
      onSaved(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to attach proof.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteRecord() {
    setBusy(true);
    setError(null);
    try {
      await api.wealth.deleteRecord(record.id);
      onDeleted(record.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete Wealth record.");
    } finally {
      setBusy(false);
    }
  }

  async function saveMoneyEdit() {
    if (!canSave || busy) return;
    setBusy(true);
    setError(null);
    try {
      let updated = await api.wealth.updateRecord(
        record.id,
        payload(record, moneyRecord ? {
          type: direction === "BORROWED" ? "LOAN_TAKEN" : "LOAN_GIVEN",
          title,
          notes,
          followUpDate: followUpDate || null,
          followUpNote,
          details: moneyDetails,
        } : {
          title,
          notes,
          details: { ...record.details, amount, value: amount, accessInstruction },
        }),
      );
      if (files.length) {
        const domain = classifyWealthRecord(updated);
        const analysis = await api.documents.analyze(files, false);
        const primary = analysis.files[0]!;
        const saved = await api.documents.save({
          tempFileIds: analysis.files.map((item) => item.tempFileId),
          originalName: primary.originalName,
          mimeType: primary.mimeType,
          size: analysis.files.reduce((sum, item) => sum + item.size, 0),
          title: title.trim() || primary.originalName,
          category: domain === "protection" ? "Insurance" : "Finance",
          documentType: typeLabels[updated.type],
          confidence: 90,
          fields: { nameOnDocument: analysis.document.nameOnDocument ?? undefined, uniqueNumber: analysis.document.uniqueNumber ?? undefined },
          reviewFields: [],
          rawExtractedText: "",
          warnings: analysis.warnings ?? [],
          evidence: [],
          analysisSource: "ai",
          userConfirmedUnknown: true,
        });
        const nextIds = [...new Set([...(updated.attachmentDocumentIds ?? updated.attachments.map((item) => item.documentId)), saved.document.id])];
        updated = await api.wealth.updateRecord(updated.id, payload(updated, { attachmentDocumentIds: nextIds }));
        void dispatch(fetchDocuments());
      }
      onSaved(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update Wealth record.");
    } finally {
      setBusy(false);
    }
  }

  const heading = mode === "attach" ? "Attach proof" : mode === "note" ? "Add note" : mode === "delete" ? "Delete record" : "Edit money lent or borrowed";
  const moneyRecord = isMoneyLentBorrowed(record);
  const canSave = title.trim().length > 0 && (!moneyRecord || (Number(amount) > 0 && currency.trim() && direction && transactionDate));
  const moneyDetails = {
    ...record.details,
    recordKind: "money_lent_borrowed",
    whatFor: title.trim(),
    amount,
    principalAmount: amount,
    currency,
    direction,
    transactionDate,
    date: transactionDate,
    who,
    party: who,
    paidTo: direction === "LENT" ? who : "",
    receivedFrom: direction === "BORROWED" ? who : "",
    followUpOn: followUpDate,
    proofStatus: record.attachments.length ? "attached" : "cash_no_record",
  };

  return (
    <div className="lp-modalwrap" role="presentation" onClick={onClose}>
      <div className={`lp-modalbox lp-wealth-ref-modal lp-wealth-action-modal ${mode === "edit" ? "lp-money-modal" : ""}`} role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="lp-wealth-modal-head">
          <b>{heading}</b>
          <button type="button" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>
        {mode === "edit" ? <p className="lp-wealth-form-copy">Attach the UPI screenshot, chat, or statement line, confirm who and how much, done. Cash with no record is fine too; say so.</p> : null}
        {mode === "delete" ? <p className="lp-wealth-form-copy">This removes the Wealth record. Attached documents stay in Documents.</p> : null}
        {mode === "attach" ? <label className="lp-wealth-proof-drop lp-action-proof-drop"><Paperclip size={22} /><b>{files.length ? `${files.length} file${files.length === 1 ? "" : "s"} selected` : "Attach documents"}</b><small>Photo, screenshot, receipt, or PDF</small><input type="file" hidden multiple accept="image/*,application/pdf" onChange={(event) => setFiles(Array.from(event.target.files ?? []))} /></label> : null}
        {mode === "note" ? <div className="lp-action-field"><label>Access instructions</label><textarea value={accessInstruction || notes} onChange={(event) => { setAccessInstruction(event.target.value); setNotes(event.target.value); }} placeholder="Where to find it, who to contact, and what your family should do." /></div> : null}
        {mode === "edit" ? <div className="lp-action-edit-form"><label className="lp-money-proof lp-money-proof-edit"><Paperclip size={22} color="var(--lp-action)" /><b>{files.length ? `${files.length} file${files.length === 1 ? "" : "s"} selected` : "Photo · screenshot · receipt · PDF"}</b><small>The proof is the record; it files into Documents too</small><input type="file" hidden multiple accept="image/*,application/pdf" onChange={(event) => setFiles(Array.from(event.target.files ?? []))} /></label><div className="lp-action-field wide"><label>What for</label><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. car down payment, hospital bill, wedding advance" /></div><div className="lp-wealth-edit-row"><div className="lp-action-field amount"><label>Amount</label><input inputMode="decimal" type="number" min="0" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0" /></div><div className="lp-action-field"><label>Currency</label><select value={currency} onChange={(event) => setCurrency(event.target.value.toUpperCase())}><option value="INR">INR</option><option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option><option value="AED">AED</option><option value="SGD">SGD</option></select></div></div><div className="lp-wealth-edit-row"><div className="lp-action-field"><label>Which way</label><select value={direction} onChange={(event) => setDirection(event.target.value)}><option value="LENT">I lent</option><option value="BORROWED">I borrowed</option></select></div><div className="lp-action-field"><label>Date</label><input type="date" value={transactionDate} onChange={(event) => setTransactionDate(event.target.value)} /></div></div><button type="button" className="lp-money-more" onClick={() => setMore((value) => !value)}><ChevronUp size={12} style={{ transform: more ? "none" : "rotate(180deg)" }} /> {more ? "Fewer details" : "Who and when to follow up"}</button>{more ? <><div className="lp-action-field wide"><label>Who</label><input value={who} onChange={(event) => setWho(event.target.value)} placeholder="e.g. Rohan K (friend), Meera (sister)" /></div><div className="lp-wealth-edit-row"><div className="lp-action-field"><label>Follow up on</label><input type="date" value={followUpDate} onChange={(event) => setFollowUpDate(event.target.value)} /></div><div className="lp-action-field"><label>Follow-up note</label><input value={followUpNote} onChange={(event) => setFollowUpNote(event.target.value)} placeholder="e.g. check if cheque cleared" /></div></div></> : null}</div> : null}
        {error ? <div className="lp-sos-error">{error}</div> : null}
        <div className="lp-wealth-form-actions">
          {mode === "delete" ? <button type="button" className="danger" disabled={busy} onClick={deleteRecord}><Trash2 size={15} /> {busy ? "Deleting..." : "Delete"}</button> : null}
          {mode === "attach" ? <button type="button" disabled={busy || !files.length} onClick={attachFiles}>{busy ? "Attaching..." : "Attach"}</button> : null}
          {mode === "note" ? <button type="button" disabled={busy} onClick={() => saveRecord(payload(record, { notes, details: { ...record.details, accessInstruction } }))}>{busy ? "Saving..." : "Save note"}</button> : null}
          {mode === "edit" ? <button type="button" disabled={busy || !canSave} onClick={saveMoneyEdit}>{busy ? "Saving..." : "Save changes"}</button> : null}
          {mode === "edit" ? <button type="button" className="remove-entry" disabled={busy} onClick={deleteRecord}><Trash2 size={14} /> Remove this entry</button> : null}
        </div>
      </div>
    </div>
  );
}
