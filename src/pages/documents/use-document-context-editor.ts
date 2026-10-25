import { useEffect, useState } from "react";
import type { DocumentRecord } from "@/lib/api";
import { useAppDispatch } from "@/store/hooks";
import {
  assignDocuments,
  deleteDocument,
  updateDocumentDetails,
} from "@/store/slices/documentsSlice";
import { fieldsObject } from "./document-utils";
import { confirmDeleteDocuments } from "./document-actions";

export function useDocumentContextEditor(
  doc: DocumentRecord,
  onClose: () => void,
) {
  const dispatch = useAppDispatch();
  const savedNotes =
    typeof fieldsObject(doc).documentNotes === "string"
      ? String(fieldsObject(doc).documentNotes)
      : "";
  const [notes, setNotes] = useState(savedNotes);
  const [busy, setBusy] = useState<
    "assign" | "expiry" | "notes" | "delete" | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setNotes(savedNotes);
  }, [doc.id, savedNotes]);
  const persistDetails = async (
    patch: { expiry?: string | null; notes?: string },
    kind: "expiry" | "notes",
  ) => {
    setBusy(kind);
    setError(null);
    try {
      await dispatch(updateDocumentDetails({ id: doc.id, ...patch })).unwrap();
    } catch {
      setError("Unable to save changes. Please try again.");
    } finally {
      setBusy(null);
    }
  };
  const assignPerson = async (assigneeId: string) => {
    setBusy("assign");
    setError(null);
    try {
      await dispatch(assignDocuments({ ids: [doc.id], assigneeId })).unwrap();
    } catch {
      setError("Unable to assign this document. Please try again.");
    } finally {
      setBusy(null);
    }
  };
  const removeDocument = async () => {
    if (!confirmDeleteDocuments(1)) return;
    setBusy("delete");
    setError(null);
    try {
      await dispatch(deleteDocument(doc.id)).unwrap();
      onClose();
    } catch {
      setError("Unable to delete this document. Please try again.");
    } finally {
      setBusy(null);
    }
  };
  return {
    savedNotes,
    notes,
    setNotes,
    busy,
    error,
    persistDetails,
    assignPerson,
    removeDocument,
  };
}
