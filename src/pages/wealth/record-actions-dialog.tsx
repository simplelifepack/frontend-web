import { Text, ModalPanel, ModalBackdrop, Textarea, Input, Select, Button } from "@/design-system";

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
    <ModalBackdrop  role="presentation" onClick={onClose}>
      <ModalPanel onDismiss={onClose} aria-label="Wealth record" className={`lp-wealth-ref-modal lp-wealth-action-modal ${mode === "edit" ? "lp-money-modal" : ""}`} role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="lp-wealth-modal-head">
          <Text as="b" size="md" weight="semibold">{heading}</Text>
          <Button size="sm" iconOnly variant="tertiary" type="button" onClick={onClose} aria-label="Close"><X aria-hidden="true" focusable="false" size="var(--icon-small)" /></Button>
        </div>
        {mode === "edit" ? <Text as="p" size="md" className="lp-wealth-form-copy">Attach the UPI screenshot, chat, or statement line, confirm who and how much, done. Cash with no record is fine too; say so.</Text> : null}
        {mode === "delete" ? <Text as="p" size="md" className="lp-wealth-form-copy">This removes the Wealth record. Attached documents stay in Documents.</Text> : null}
        {mode === "attach" ? <Text as="label" size="md" className="lp-wealth-proof-drop lp-action-proof-drop"><Paperclip aria-hidden="true" focusable="false" size={22} /><b>{files.length ? `${files.length} file${files.length === 1 ? "" : "s"} selected` : "Attach documents"}</b><small>Photo, screenshot, receipt, or PDF</small><input type="file" hidden multiple accept="image/*,application/pdf" onChange={(event) => setFiles(Array.from(event.target.files ?? []))} /></Text> : null}
        {mode === "note" ? <div className="lp-action-field"><Text as="label" size="md">Access instructions</Text><Textarea value={accessInstruction || notes} onChange={(event) => { setAccessInstruction(event.target.value); setNotes(event.target.value); }} placeholder="Where to find it, who to contact, and what your family should do." /></div> : null}
        {mode === "edit" ? <div className="lp-action-edit-form"><Text as="label" size="md" className="lp-money-proof lp-money-proof-edit"><Paperclip aria-hidden="true" focusable="false" size={22} color="var(--lp-action)" /><b>{files.length ? `${files.length} file${files.length === 1 ? "" : "s"} selected` : "Photo · screenshot · receipt · PDF"}</b><small>The proof is the record; it files into Documents too</small><input type="file" hidden multiple accept="image/*,application/pdf" onChange={(event) => setFiles(Array.from(event.target.files ?? []))} /></Text><div className="lp-action-field wide"><Text as="label" size="md">What for</Text><Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. car down payment, hospital bill, wedding advance" /></div><div className="lp-wealth-edit-row"><div className="lp-action-field amount"><Text as="label" size="md">Amount</Text><Input inputMode="decimal" type="number" min="0" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0" /></div><div className="lp-action-field"><Text as="label" size="md">Currency</Text><Select value={currency} onChange={(event) => setCurrency(event.target.value.toUpperCase())}><option value="INR">INR</option><option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option><option value="AED">AED</option><option value="SGD">SGD</option></Select></div></div><div className="lp-wealth-edit-row"><div className="lp-action-field"><Text as="label" size="md">Which way</Text><Select value={direction} onChange={(event) => setDirection(event.target.value)}><option value="LENT">I lent</option><option value="BORROWED">I borrowed</option></Select></div><div className="lp-action-field"><Text as="label" size="md">Date</Text><Input type="date" value={transactionDate} onChange={(event) => setTransactionDate(event.target.value)} /></div></div><Button size="sm" variant="tertiary" type="button" onClick={() => setMore((value) => !value)}><ChevronUp aria-hidden="true" focusable="false" size={12} style={{ transform: more ? "none" : "rotate(180deg)" }} /> {more ? "Fewer details" : "Who and when to follow up"}</Button>{more ? <><div className="lp-action-field wide"><Text as="label" size="md">Who</Text><Input value={who} onChange={(event) => setWho(event.target.value)} placeholder="e.g. Rohan K (friend), Meera (sister)" /></div><div className="lp-wealth-edit-row"><div className="lp-action-field"><Text as="label" size="md">Follow up on</Text><Input type="date" value={followUpDate} onChange={(event) => setFollowUpDate(event.target.value)} /></div><div className="lp-action-field"><Text as="label" size="md">Follow-up note</Text><Input value={followUpNote} onChange={(event) => setFollowUpNote(event.target.value)} placeholder="e.g. check if cheque cleared" /></div></div></> : null}</div> : null}
        {error ? <Text as="div" size="md" className="lp-sos-error">{error}</Text> : null}
        <div   className="lp-wealth-form-actions">
          {mode === "delete" ? <Button tone="danger" loading={Boolean(busy)} variant="primary" type="button" disabled={busy} onClick={deleteRecord}><Trash2 aria-hidden="true" focusable="false" size={15} /> {busy ? "Deleting..." : "Delete"}</Button> : null}
          {mode === "attach" ? <Button loading={Boolean(busy)} variant="primary" type="button" disabled={busy || !files.length} onClick={attachFiles}>{busy ? "Attaching..." : "Attach"}</Button> : null}
          {mode === "note" ? <Button loading={Boolean(busy)} variant="primary" type="button" disabled={busy} onClick={() => saveRecord(payload(record, { notes, details: { ...record.details, accessInstruction } }))}>{busy ? "Saving..." : "Save note"}</Button> : null}
          {mode === "edit" ? <Button loading={Boolean(busy)} variant="primary" type="button" disabled={busy || !canSave} onClick={saveMoneyEdit}>{busy ? "Saving..." : "Save changes"}</Button> : null}
          {mode === "edit" ? <Button size="sm" tone="danger" variant="tertiary" type="button" disabled={busy} onClick={deleteRecord}><Trash2 aria-hidden="true" focusable="false" size={14} /> Remove this entry</Button> : null}
        </div>
      </ModalPanel>
    </ModalBackdrop>
  );
}
