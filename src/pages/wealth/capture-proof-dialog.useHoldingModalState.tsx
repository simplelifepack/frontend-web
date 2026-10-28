import { useState } from "react";
import { type DocumentRecord, type WealthRecord, type WealthRecordType } from "@/lib/api";
import { useAppSelector } from "@/store/hooks";
import { initialHoldingState, text } from "./capture-proof-dialog.Mode";
import { initialStateFromDocument, initialTypeChoice } from "./capture-proof-dialog.initialStateFromDocument";


export function useHoldingModalState({
  title,
  record,
  initialDocument,
  onClose,
  onSaved,
  onDeleted,
}: {
  title?: string;
  record?: WealthRecord;
  initialDocument?: DocumentRecord;
  onClose: () => void;
  onSaved: (record: WealthRecord) => void;
  onDeleted?: (id: string) => void;
}) {

  const documents = useAppSelector((state) => state.documents.items);
  const user = useAppSelector((state) => state.auth.user);
  const familyMembers = useAppSelector((state) => state.family.members);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fillNote, setFillNote] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [f, setF] = useState(() =>
    record
      ? initialHoldingState(record)
      : initialDocument
        ? initialStateFromDocument(initialDocument)
        : initialHoldingState(),
  );
  const [typeChoice, setTypeChoice] = useState(() => {
    const initial = record
      ? initialHoldingState(record)
      : initialDocument
        ? initialStateFromDocument(initialDocument)
        : initialHoldingState();
    return initialTypeChoice(initial.kind, initial.type);
  });
  const [otherType, setOtherType] = useState(() => {
    const initial = record
      ? initialHoldingState(record)
      : initialDocument
        ? initialStateFromDocument(initialDocument)
        : initialHoldingState();
    return initialTypeChoice(initial.kind, initial.type) === "Other"
      ? initial.type
      : "";
  });
  const [attachedDocumentIds, setAttachedDocumentIds] = useState<string[]>(
    () => [
      ...new Set(
        record?.attachmentDocumentIds?.length
          ? record.attachmentDocumentIds
          : (record?.attachments.map((item) => item.documentId) ??
              (initialDocument ? [initialDocument.id] : [])),
      ),
    ],
  );
  const [attachedDocuments, setAttachedDocuments] = useState<DocumentRecord[]>(
    () => (initialDocument ? [initialDocument] : []),
  );
  const attachedDocumentList = attachedDocumentIds
    .map(
      (id) =>
        attachedDocuments.find((doc) => doc.id === id) ??
        documents.find((doc) => doc.id === id),
    )
    .filter((doc): doc is DocumentRecord => Boolean(doc));
  const linkedDocument = attachedDocumentList[0] ?? null;
  const ownerOptions = [
    { id: "you", name: user?.name || "You" },
    ...familyMembers.map((member) => ({ id: member.id, name: member.name })),
  ];
  if (f.memberId && !ownerOptions.some((member) => member.id === f.memberId)) {
    ownerOptions.push({
      id: f.memberId,
      name:
        text(
          record?.details.ownerName || record?.details.owner || f.memberId,
        ) || f.memberId,
    });
  }
  const set = (key: string, value: string | boolean) =>
    setF((current) => ({ ...current, [key]: value }));
  const setKind = (kind: string) => {
    setF((current) => ({ ...current, kind, type: "" }));
    setTypeChoice("");
    setOtherType("");
  };
  const resolvedType =
    typeChoice === "Other" ? otherType.trim() : typeChoice.trim();
  const kindType: WealthRecordType =
    f.kind === "liability"
      ? "LOAN_TAKEN"
      : f.kind === "cover"
        ? "INSURANCE"
        : "ASSET";
  const valueKey =
    f.kind === "liability"
      ? "principalAmount"
      : f.kind === "cover"
        ? "coverageAmount"
        : "value";
  const valid = f.name.trim().length > 0 && Boolean(resolvedType);
return { title, record, initialDocument, onClose, onSaved, onDeleted, documents, user, familyMembers, busy, setBusy, error, setError, fillNote, setFillNote, uploading, setUploading, f, setF, typeChoice, setTypeChoice, otherType, setOtherType, attachedDocumentIds, setAttachedDocumentIds, attachedDocuments, setAttachedDocuments, attachedDocumentList, linkedDocument, ownerOptions, set, setKind, resolvedType, kindType, valueKey, valid };
}
