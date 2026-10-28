import { Text, Button } from "@/design-system";
import { FileText } from "lucide-react";
import { api, type DocumentRecord, type WealthRecordPayload } from "@/lib/api";
import { documentTitle } from "@/pages/documents/document-utils";
import { payloadFromRecord } from "./wealth-view";
import { css } from "./capture-proof-dialog.Mode";
import { initialStateFromDocument, initialTypeChoice } from "./capture-proof-dialog.initialStateFromDocument";
import { useHoldingModalState } from "./capture-proof-dialog.useHoldingModalState";


export function useHoldingModalLogic(props: Parameters<typeof useHoldingModalState>[0]) {

const { title, record, initialDocument, onClose, onSaved, onDeleted, documents, user, familyMembers, busy, setBusy, error, setError, fillNote, setFillNote, uploading, setUploading, f, setF, typeChoice, setTypeChoice, otherType, setOtherType, attachedDocumentIds, setAttachedDocumentIds, attachedDocuments, setAttachedDocuments, attachedDocumentList, linkedDocument, ownerOptions, set, setKind, resolvedType, kindType, valueKey, valid } = useHoldingModalState(props);


  async function save() {
    if (!valid) return;
    setBusy(true);
    setError(null);
    const details = {
      ...(record?.details ?? {}),
      assetType: f.kind === "asset" ? resolvedType : "",
      loanType: f.kind === "liability" ? resolvedType : "",
      insuranceType: f.kind === "cover" ? resolvedType : "",
      type: resolvedType,
      typeClassification: typeChoice === "Other" ? "other" : "predefined",
      provider: f.institution,
      institution: f.institution,
      accountRef: f.accountRef,
      currency: f.currency,
      memberId: f.memberId,
      renewalDate: f.renewalDate,
      maturityDate: f.maturityDate,
      accessInstruction: f.accessNote,
      nominee: f.nominee ? f.nomineeName || "Named" : "",
      nomineeName: f.nominee ? f.nomineeName : "",
      [valueKey]: f.value,
      amount: f.value,
      categoryCode:
        f.kind === "liability"
          ? "loan"
          : f.kind === "cover"
            ? "insurance"
            : "asset",
    };
    const payload: WealthRecordPayload = record
      ? payloadFromRecord(record, {
          type: kindType,
          title: f.name.trim(),
          details,
          notes: f.accessNote,
          attachmentDocumentIds: attachedDocumentIds,
        })
      : {
          type: kindType,
          title: f.name.trim(),
          details,
          notes: f.accessNote,
          followUpDate: null,
          followUpNote: "",
          attachmentDocumentIds: attachedDocumentIds,
        };
    try {
      onSaved(
        record
          ? await api.wealth.updateRecord(record.id, payload)
          : await api.wealth.createRecord(payload),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : record
            ? "Unable to update holding."
            : "Unable to add holding.",
      );
    } finally {
      setBusy(false);
    }
  }

  function attachDocument(document: DocumentRecord) {
    setAttachedDocuments((current) => [
      document,
      ...current.filter((item) => item.id !== document.id),
    ]);
    setAttachedDocumentIds((current) => [
      ...new Set([...current, document.id]),
    ]);
    const draft = initialStateFromDocument(document);
    setF((current) => {
      const next = { ...current };
      (Object.keys(draft) as Array<keyof typeof draft>).forEach((key) => {
        if (!next[key] && draft[key]) next[key] = draft[key] as never;
      });
      return next;
    });
    if (!typeChoice && draft.type) {
      const choice = initialTypeChoice(draft.kind, draft.type);
      setTypeChoice(choice);
      setOtherType(choice === "Other" ? draft.type : "");
    }
    setFillNote(null);
  }

  function fillFromDocument() {
    if (!linkedDocument) return;
    let count = 0;
    const draft = initialStateFromDocument(linkedDocument);
    const next = { ...f };
    const apply = (key: keyof typeof f, value: string) => {
      if (next[key]) return;
      if (!value) return;
      next[key] = String(value) as never;
      count += 1;
    };
    apply("name", draft.name);
    apply("kind", draft.kind);
    apply("institution", draft.institution);
    apply("accountRef", draft.accountRef);
    apply("value", draft.value);
    apply("currency", draft.currency);
    apply("renewalDate", draft.renewalDate);
    apply("maturityDate", draft.maturityDate);
    setF(next);
    if (!typeChoice && draft.type) {
      const choice = initialTypeChoice(draft.kind, draft.type);
      setTypeChoice(choice);
      setOtherType(choice === "Other" ? draft.type : "");
      count += 1;
    }
    const hasDocumentDetails = [
      draft.name,
      draft.type,
      draft.institution,
      draft.accountRef,
      draft.value,
      draft.renewalDate,
      draft.maturityDate,
    ].some(Boolean);
    setFillNote(
      count
        ? `Filled ${count} field${count === 1 ? "" : "s"} from your document. Check and confirm.`
        : hasDocumentDetails
          ? "Document details are already filled. Check and confirm."
          : "No additional fields found. Fill in by hand.",
    );
  }

  async function deleteHolding() {
    if (!record || busy) return;
    if (
      !window.confirm(
        `${record.title} will be removed from Wealth. Attached documents stay in Documents.`,
      )
    )
      return;
    setBusy(true);
    setError(null);
    try {
      await api.wealth.deleteRecord(record.id);
      onDeleted?.(record.id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to remove holding.",
      );
    } finally {
      setBusy(false);
    }
  }
return { title, record, initialDocument, onClose, onSaved, onDeleted, documents, user, familyMembers, busy, setBusy, error, setError, fillNote, setFillNote, uploading, setUploading, f, setF, typeChoice, setTypeChoice, otherType, setOtherType, attachedDocumentIds, setAttachedDocumentIds, attachedDocuments, setAttachedDocuments, attachedDocumentList, linkedDocument, ownerOptions, set, setKind, resolvedType, kindType, valueKey, valid, save, attachDocument, fillFromDocument, deleteHolding };
}


export function HoldingModalViewSection1(context: ReturnType<typeof useHoldingModalLogic>) {
const { title, record, initialDocument, onClose, onSaved, onDeleted, documents, user, familyMembers, busy, setBusy, error, setError, fillNote, setFillNote, uploading, setUploading, f, setF, typeChoice, setTypeChoice, otherType, setOtherType, attachedDocumentIds, setAttachedDocumentIds, attachedDocuments, setAttachedDocuments, attachedDocumentList, linkedDocument, ownerOptions, set, setKind, resolvedType, kindType, valueKey, valid, save, attachDocument, fillFromDocument, deleteHolding } = context;
return (<div className="lp-holding-doc-banner">
        <FileText aria-hidden="true" focusable="false" size="var(--icon-small)" color={css.muted} />
        <Text size="md">
          {linkedDocument
            ? fillNote ||
              `${documentTitle(linkedDocument)} is linked. Read it once to fill what it states.`
            : "Add a document now, or save this holding and attach one later."}
        </Text>
        <div   className="lp-holding-doc-actions">
          {linkedDocument ? (
            <Button size="sm" variant="tertiary"
              type="button"
              onClick={fillFromDocument}
              disabled={!linkedDocument}
            >
              {fillNote ? "Read again" : "Fill from this document"}
            </Button>
          ) : null}
          {!linkedDocument ? (
            <Button size="sm" variant="tertiary" type="button" onClick={() => setUploading(true)}>
              Add document
            </Button>
          ) : null}
        </div>
      </div>);
}
