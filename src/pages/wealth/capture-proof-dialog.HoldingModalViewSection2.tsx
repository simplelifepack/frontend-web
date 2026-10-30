import { Text, Input, SelectMenu, Checkbox } from "@/design-system";
import { useMemo, useState } from "react";
import { api, type DocumentRecord, type WealthRecord, type WealthRecordPayload } from "@/lib/api";
import { documentTitle } from "@/pages/documents/document-utils";
import { useAppSelector } from "@/store/hooks";
import { inputStyle, currencies, today } from "./capture-proof-dialog.Mode";
import { TypeCombobox } from "./capture-proof-dialog.initialStateFromDocument";
import { Field, isWealthEvidenceDocument, amountFromDocument, normalizeAmount } from "./capture-proof-dialog.DocumentRow";
import { useHoldingModalLogic } from "./capture-proof-dialog.useHoldingModalLogic";


export function HoldingModalViewSection2(context: ReturnType<typeof useHoldingModalLogic>) {
const { title, record, initialDocument, onClose, onSaved, onDeleted, documents, user, familyMembers, busy, setBusy, error, setError, fillNote, setFillNote, uploading, setUploading, f, setF, typeChoice, setTypeChoice, otherType, setOtherType, attachedDocumentIds, setAttachedDocumentIds, attachedDocuments, setAttachedDocuments, attachedDocumentList, linkedDocument, ownerOptions, set, setKind, resolvedType, kindType, valueKey, valid, save, attachDocument, fillFromDocument, deleteHolding } = context;
return (<div
        className="lp-wealth-form-row"
        style={{ display: "flex", gap: "var(--space-s10)", marginTop: "var(--space-s12)" }}
      >
        <Field label="Kind">
          <SelectMenu
            value={f.kind}
            onValueChange={(selectedValue) => setKind(selectedValue)}
            options={["asset", "liability", "cover"].map((item) => ({
              value: item,
              label: item,
            }))}
          />
        </Field>
        <Field label="Type">
          <TypeCombobox
            kind={f.kind}
            value={typeChoice}
            onChange={setTypeChoice}
            onOtherQuery={setOtherType}
          />
        </Field>
      </div>);
}


export function HoldingModalViewSection3(context: ReturnType<typeof useHoldingModalLogic>) {
const { title, record, initialDocument, onClose, onSaved, onDeleted, documents, user, familyMembers, busy, setBusy, error, setError, fillNote, setFillNote, uploading, setUploading, f, setF, typeChoice, setTypeChoice, otherType, setOtherType, attachedDocumentIds, setAttachedDocumentIds, attachedDocuments, setAttachedDocuments, attachedDocumentList, linkedDocument, ownerOptions, set, setKind, resolvedType, kindType, valueKey, valid, save, attachDocument, fillFromDocument, deleteHolding } = context;
return (<div
        className="lp-wealth-form-row lp-holding-money-row"
        style={{ display: "flex", gap: "var(--space-s10)", marginTop: "var(--space-s12)" }}
      >
        <Field
          label={
            f.kind === "liability"
              ? "Outstanding"
              : f.kind === "cover"
                ? "Cover"
                : "Value"
          }
        >
          <Input
            type="number"
            min="0"
            style={inputStyle()}
            value={f.value}
            onChange={(e) => set("value", e.target.value)}
            placeholder="0"
          />
        </Field>
        <Field label="Currency">
          <SelectMenu
            value={f.currency}
            onValueChange={(selectedValue) => set("currency", selectedValue)}
            options={currencies.map((item) => ({ value: item, label: item }))}
          />
        </Field>
      </div>);
}


export function HoldingModalViewSection4(context: ReturnType<typeof useHoldingModalLogic>) {
const { title, record, initialDocument, onClose, onSaved, onDeleted, documents, user, familyMembers, busy, setBusy, error, setError, fillNote, setFillNote, uploading, setUploading, f, setF, typeChoice, setTypeChoice, otherType, setOtherType, attachedDocumentIds, setAttachedDocumentIds, attachedDocuments, setAttachedDocuments, attachedDocumentList, linkedDocument, ownerOptions, set, setKind, resolvedType, kindType, valueKey, valid, save, attachDocument, fillFromDocument, deleteHolding } = context;
return (<div
          className="lp-wealth-form-row lp-holding-nominee"
          style={{
            marginTop: "var(--space-s14)",
            display: "flex",
            gap: "var(--space-s10)",
            alignItems: "center",
          }}
        >
          <Text as="label" size="md" weight="medium">
            <Checkbox
              type="checkbox"
              checked={f.nominee}
              onChange={(e) => set("nominee", e.target.checked)}
            />{" "}
            Nominee named
          </Text>
          {f.nominee ? (
            <Input
              style={{ ...inputStyle(), flex: 1 }}
              value={f.nomineeName}
              onChange={(e) => set("nomineeName", e.target.value)}
              placeholder="Nominee name"
            />
          ) : null}
        </div>);
}


export function useMoneyLentBorrowedModalLogic({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: (record: WealthRecord) => void;
}) {

  const documents = useAppSelector((state) => state.documents.items);
  const user = useAppSelector((state) => state.auth.user);
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [more, setMore] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [f, setF] = useState({
    whatFor: "",
    amount: "",
    currency: currencies[0] ?? "INR",
    direction: "LENT",
    date: today(),
    who: "",
    followUpOn: "",
    followUpNote: "",
  });
  const set = (key: string, value: string) => {
    setF((current) => ({ ...current, [key]: value }));
    setError(null);
  };
  const relevantDocs = useMemo(
    () => documents.filter(isWealthEvidenceDocument),
    [documents],
  );
  const amount = Number(f.amount);
  const valid =
    f.whatFor.trim().length > 0 &&
    Number.isFinite(amount) &&
    amount > 0 &&
    Boolean(f.currency) &&
    Boolean(f.direction) &&
    Boolean(f.date);
  const choose = (doc: DocumentRecord) => {
    setSelectedDoc(doc);
    setShowDocs(false);
    setF((current) => ({
      ...current,
      whatFor: current.whatFor || documentTitle(doc),
      amount: current.amount || amountFromDocument(doc),
    }));
  };

  async function save() {
    if (!valid || busy) {
      setError("Enter what for, amount, currency, which way, and date.");
      return;
    }
    setBusy(true);
    setError(null);
    const amountText = normalizeAmount(f.amount);
    const direction = f.direction === "BORROWED" ? "BORROWED" : "LENT";
    const details = {
      recordKind: "money_lent_borrowed",
      whatFor: f.whatFor.trim(),
      amount: amountText,
      principalAmount: amountText,
      currency: f.currency,
      direction,
      transactionDate: f.date,
      date: f.date,
      who: f.who.trim(),
      party: f.who.trim(),
      paidTo: direction === "LENT" ? f.who.trim() : "",
      receivedFrom: direction === "BORROWED" ? f.who.trim() : "",
      followUpOn: f.followUpOn,
      proofStatus: selectedDoc ? "attached" : "cash_no_record",
      sourceDocumentId: selectedDoc?.id ?? "",
      sourceDocumentCategory: selectedDoc?.category ?? "",
      sourceDocumentType: selectedDoc?.documentType ?? "",
    };
    const payload: WealthRecordPayload = {
      type: direction === "BORROWED" ? "LOAN_TAKEN" : "LOAN_GIVEN",
      title: f.whatFor.trim(),
      details,
      notes: f.followUpNote,
      followUpDate: f.followUpOn || null,
      followUpNote: f.followUpNote,
      attachmentDocumentIds: selectedDoc ? [selectedDoc.id] : [],
    };
    try {
      onSaved(await api.wealth.createRecord(payload));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to record money lent or borrowed.",
      );
    } finally {
      setBusy(false);
    }
  }
return { onClose, onSaved, documents, user, selectedDoc, setSelectedDoc, uploading, setUploading, showDocs, setShowDocs, more, setMore, busy, setBusy, error, setError, f, setF, set, relevantDocs, amount, valid, choose, save };
}
