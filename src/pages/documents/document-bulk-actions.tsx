import { useState } from "react";
import { Download, Trash2 } from "lucide-react";

import { btnGhost, btnPrimary } from "@/constants/theme";
import type { DocumentRecord } from "@/lib/api";
import { useAppDispatch } from "@/store/hooks";
import { deleteDocuments } from "@/store/slices/documentsSlice";
import { confirmDeleteDocuments, downloadDocuments } from "./document-actions";

type Props = {
  documents: DocumentRecord[];
  onDeleted: () => void;
};

export default function DocumentBulkActions({ documents, onDeleted }: Props) {
  const dispatch = useAppDispatch();
  const [busy, setBusy] = useState<"download" | "delete" | null>(null);
  const count = documents.length;
  if (!count) return null;
  const runDownload = async () => {
    setBusy("download");
    try { await downloadDocuments(documents); } finally { setBusy(null); }
  };
  const runDelete = async () => {
    if (!confirmDeleteDocuments(count)) return;
    setBusy("delete");
    try {
      await dispatch(deleteDocuments(documents.map((document) => document.id))).unwrap();
      onDeleted();
    } finally { setBusy(null); }
  };
  return (
    <div className="lp-document-bulk-actions">
      <span>{count} selected</span>
      <button type="button" style={btnPrimary} disabled={Boolean(busy)} onClick={() => void runDownload()}>
        <Download size={15} /> {busy === "download" ? "Downloading..." : "Download"}
      </button>
      <button type="button" style={btnGhost} disabled={Boolean(busy)} onClick={() => void runDelete()}>
        <Trash2 size={15} /> {busy === "delete" ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
}
