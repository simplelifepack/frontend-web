import { useState } from "react";
import { FileCheck, Paperclip, Trash2, X } from "lucide-react";

import { api, type WealthRecord, type WealthRecordPayload } from "@/lib/api";
import { useAppDispatch } from "@/store/hooks";
import { fetchDocuments } from "@/store/slices/documentsSlice";
import { money, recordAmount, recordSubtitle, typeLabels } from "./wealth-view";

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

export default function RecordActionsDialog({ mode, record, onClose, onDeleted, onSaved }: Props) {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState(record.title);
  const [amount, setAmount] = useState(String(recordAmount(record) || ""));
  const [institution, setInstitution] = useState(detailText(record, "institution"));
  const [nominee, setNominee] = useState(detailText(record, "nominee"));
  const [accessInstruction, setAccessInstruction] = useState(detailText(record, "accessInstruction"));
  const [notes, setNotes] = useState(record.notes ?? "");
  const [files, setFiles] = useState<File[]>([]);
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
      const analysis = await api.documents.analyze(files, false);
      const primary = analysis.files[0]!;
      const saved = await api.documents.save({
        tempFileIds: analysis.files.map((item) => item.tempFileId),
        originalName: primary.originalName,
        mimeType: primary.mimeType,
        size: analysis.files.reduce((sum, item) => sum + item.size, 0),
        title: title.trim() || primary.originalName,
        category: record.type === "INSURANCE" ? "Insurance" : "Finance",
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

  const heading = mode === "attach" ? "Attach proof" : mode === "note" ? "Add note" : mode === "delete" ? "Delete record" : "Edit record";
  const canSave = title.trim().length > 0;

  return (
    <div className="lp-sos-backdrop" role="presentation">
      <div className="lp-sos-dialog lp-capture-dialog" role="dialog" aria-modal="true">
        <div className="lp-sos-head"><div><span><FileCheck size={16} /> {typeLabels[record.type]}</span><h2>{heading}</h2><p>{record.title} · {recordSubtitle(record)}</p></div><button type="button" onClick={onClose} aria-label="Close"><X size={18} /></button></div>
        <div className="lp-capture-panel">
          {mode === "delete" ? <p className="lp-wealth-note">This removes the Wealth record. Attached documents stay in Documents.</p> : null}
          {mode === "attach" ? <label className="lp-wealth-field wide">Proof<span className="lp-wealth-proof-drop"><Paperclip size={22} /><b>{files.length ? `${files.length} file${files.length === 1 ? "" : "s"} selected` : "Attach documents"}</b><small>Photo, screenshot, receipt, or PDF</small><input type="file" hidden multiple accept="image/*,application/pdf" onChange={(event) => setFiles(Array.from(event.target.files ?? []))} /></span></label> : null}
          {mode === "note" ? <label className="lp-wealth-field wide">Access instructions<textarea value={accessInstruction || notes} onChange={(event) => { setAccessInstruction(event.target.value); setNotes(event.target.value); }} placeholder="Where to find it, who to contact, and what your family should do." /></label> : null}
          {mode === "edit" ? <div className="lp-capture-grid"><label className="lp-wealth-field wide">Title<input value={title} onChange={(event) => setTitle(event.target.value)} /></label><label className="lp-wealth-field">Amount<input inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} /></label><label className="lp-wealth-field">Institution / person<input value={institution} onChange={(event) => setInstitution(event.target.value)} /></label><label className="lp-wealth-field">Nominee<input value={nominee} onChange={(event) => setNominee(event.target.value)} /></label><label className="lp-wealth-field wide">Access instructions<textarea value={accessInstruction} onChange={(event) => setAccessInstruction(event.target.value)} /></label><label className="lp-wealth-field wide">Notes<textarea value={notes} onChange={(event) => setNotes(event.target.value)} /></label></div> : null}
          {error ? <div className="lp-sos-error">{error}</div> : null}
        </div>
        <div className="lp-sos-foot">
          <button type="button" onClick={onClose}>Cancel</button>
          {mode === "delete" ? <button type="button" className="primary danger" disabled={busy} onClick={deleteRecord}><Trash2 size={15} /> {busy ? "Deleting..." : "Delete"}</button> : null}
          {mode === "attach" ? <button type="button" className="primary" disabled={busy || !files.length} onClick={attachFiles}>{busy ? "Attaching..." : "Attach"}</button> : null}
          {mode === "note" ? <button type="button" className="primary" disabled={busy} onClick={() => saveRecord(payload(record, { notes, details: { ...record.details, accessInstruction } }))}>{busy ? "Saving..." : "Save note"}</button> : null}
          {mode === "edit" ? <button type="button" className="primary" disabled={busy || !canSave} onClick={() => saveRecord(payload(record, { title, notes, details: { ...record.details, amount, value: amount, institution, nominee, accessInstruction } }))}>{busy ? "Saving..." : "Save changes"}</button> : null}
        </div>
      </div>
    </div>
  );
}
