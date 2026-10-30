import { Text, Button, SelectMenu } from "@/design-system";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { api, type DocumentRecord } from "@/lib/api";
import { useAppDispatch } from "@/store/hooks";
import {
  assignDocuments,
  deleteDocuments,
} from "@/store/slices/documentsSlice";
import { confirmDeleteDocuments } from "./document-actions";

type Props = {
  documents: DocumentRecord[];
  onDeleted: () => void;
  onClear: () => void;
};

export default function DocumentBulkActions({
  documents,
  onDeleted,
  onClear,
}: Props) {
  const dispatch = useAppDispatch();
  const [busy, setBusy] = useState<"assign" | "delete" | null>(null);
  const [people, setPeople] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingPeople, setLoadingPeople] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const count = documents.length;
  const hasSelection = count > 0;
  useEffect(() => {
    if (!hasSelection) return;
    let cancelled = false;
    setLoadingPeople(true);
    setError(null);
    api.documents
      .assignmentOptions()
      .then((options) => {
        if (!cancelled) setPeople(options);
      })
      .catch(() => {
        if (!cancelled) {
          setPeople([]);
          setError("Unable to load people. Try again.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingPeople(false);
      });
    return () => {
      cancelled = true;
    };
  }, [hasSelection, retry]);
  if (!count) return null;
  const runAssign = async (assigneeId: string) => {
    setBusy("assign");
    setError(null);
    try {
      await dispatch(
        assignDocuments({
          ids: documents.map((document) => document.id),
          assigneeId,
        }),
      ).unwrap();
      toast.success(
        `${count} ${count === 1 ? "document" : "documents"} assigned to ${people.find((person) => person.id === assigneeId)?.name ?? "selected person"}`,
      );
      onClear();
    } catch {
      setError(
        "Unable to assign documents. Your selection has been kept. Try again.",
      );
    } finally {
      setBusy(null);
    }
  };
  const runDelete = async () => {
    if (!confirmDeleteDocuments(count)) return;
    setBusy("delete");
    try {
      await dispatch(
        deleteDocuments(documents.map((document) => document.id)),
      ).unwrap();
      onDeleted();
    } catch {
      setError("Unable to delete documents. Try again.");
    } finally {
      setBusy(null);
    }
  };
  return (
    <div
      className="lp-document-bulk-actions documents-selection-bar"
      role="region"
      aria-label="Selected documents"
    >
      <Text size="sm" weight="semibold" aria-live="polite">
        {count} selected
      </Text>
      <div className="documents-assign">
        <SelectMenu
          aria-label="Assign selected documents"
          value=""
          placeholder={
            busy === "assign" ? "Assigning…" : loadingPeople ? "Loading…" : "Assign to…"
          }
          disabled={Boolean(busy) || loadingPeople || !people.length}
          onValueChange={(assigneeId) => void runAssign(assigneeId)}
          options={people.map((person) => ({
            value: person.id,
            label: person.name,
          }))}
        />
      </div>
      <Button
        className="documents-selection-delete"
        tone="danger"
        loading={busy === "delete"}
        variant="secondary"
        type="button"
        disabled={Boolean(busy)}
        onClick={() => void runDelete()}
      >
        <Trash2 aria-hidden="true" focusable="false" size={13} />{" "}
        {busy === "delete" ? "Deleting..." : "Delete"}
      </Button>
      <Button
        className="documents-selection-clear"
        variant="secondary"
        type="button"
        disabled={Boolean(busy)}
        onClick={onClear}
      >
        Clear
      </Button>
      {error && (
        <div className="documents-assignment-error" role="alert">
          <Text tone="danger">{error}</Text>
          {!people.length && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setRetry((value) => value + 1)}
            >
              Retry
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
