import { Download, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Card from "@/components/Card";
import Pill from "@/components/Pill";
import { btnGhost, btnPrimary, T } from "@/constants/theme";
import type { DocumentRecord } from "@/lib/api";
import { useAppDispatch } from "@/store/hooks";
import { deleteDocument } from "@/store/slices/documentsSlice";
import {
  documentTitle,
  fieldsObject,
  labelize,
  reviewFields,
  safeCategory,
  sourceLabel,
} from "./document-utils";
import { confirmDeleteDocuments, downloadDocuments } from "./document-actions";
import FilePreview from "./file-preview";

export default function DocumentDetail({ doc }: { doc: DocumentRecord }) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [busy, setBusy] = useState<"download" | "delete" | null>(null);
  const category = safeCategory(doc.category);
  const fields = fieldsObject(doc);
  const rawExtractedText =
    doc.rawText ||
    (typeof fields.rawExtractedText === "string" ? fields.rawExtractedText : "");
  const evidence = Array.isArray(fields.evidence)
    ? (fields.evidence as Array<{ label?: string; text?: string; points?: number }>)
    : [];
  const warnings = Array.isArray(fields.warnings)
    ? (fields.warnings as Array<{ code?: string; message?: string }>)
    : [];
  const approvedFields = reviewFields(doc);
  const downloadDocument = async () => {
    setBusy("download");
    try { await downloadDocuments([doc]); } finally { setBusy(null); }
  };
  const removeDocument = async () => {
    if (!confirmDeleteDocuments(1)) return;
    setBusy("delete");
    try {
      await dispatch(deleteDocument(doc.id)).unwrap();
      navigate("/documents", { replace: true });
    } finally { setBusy(null); }
  };

  return (
    <div className="lp-route lp-document-detail-route" style={{ display: "grid", gap: 14 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "center",
        }}
      >
        <button
          type="button"
          onClick={() => navigate("/documents")}
          style={{ ...btnGhost, padding: "8px 12px" }}
        >
          Documents
        </button>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button type="button" disabled={Boolean(busy)} onClick={() => void downloadDocument()} style={{ ...btnPrimary, textDecoration: "none" }}>
            <Download size={15} /> {busy === "download" ? "Downloading..." : "Download"}
          </button>
          <button type="button" disabled={Boolean(busy)} onClick={() => void removeDocument()} style={btnGhost}>
            <Trash2 size={15} /> {busy === "delete" ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      <Card>
        <div style={{ color: T.white, fontSize: 24, fontWeight: 800 }}>
          {documentTitle(doc)}
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
          <Pill tone="flat">{labelize(category)}</Pill>
          <Pill tone="flat">{labelize(doc.documentType)}</Pill>
          <Pill tone="flat">{sourceLabel(doc)}</Pill>
        </div>
        <div style={{ color: T.muted, fontSize: 13, marginTop: 12 }}>
          {doc.source === "MANUAL_UPLOAD" ? "Uploaded" : "Indexed"} {new Date(doc.createdAt).toLocaleString()} . {doc.originalName}
        </div>
      </Card>

      <FilePreview doc={doc} rawExtractedText={rawExtractedText} />

      <Card>
        <div style={{ color: T.white, fontWeight: 800, marginBottom: 12 }}>
          Review fields
        </div>
        {approvedFields.length ? (
          <div style={{ display: "grid", gap: 9 }}>
            {approvedFields.map((field, index) => (
              <div
                key={field.id ?? `${field.key}-${index}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "180px 1fr",
                  gap: 12,
                  fontSize: 13,
                }}
              >
                <div style={{ color: T.muted }}>{field.label}</div>
                <div style={{ color: T.white, fontWeight: field.important ? 700 : 500 }}>
                  {field.value}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: T.muted, fontSize: 13 }}>
            No reviewed fields saved for this document.
          </div>
        )}
      </Card>

      <details style={{ color: T.text }}>
        <summary style={{ cursor: "pointer", color: T.muted, fontWeight: 700 }}>
          Raw extracted text
        </summary>
        <pre
          style={{
            whiteSpace: "pre-wrap",
            color: T.text,
            background: T.raised,
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            padding: 12,
            fontSize: 12,
          }}
        >
          {rawExtractedText || "No raw text saved."}
        </pre>
      </details>

      <details style={{ color: T.text }}>
        <summary style={{ cursor: "pointer", color: T.muted, fontWeight: 700 }}>
          Evidence and warnings
        </summary>
        <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
          {warnings.map((warning, index) => (
            <div key={`${warning.code}-${index}`} style={{ color: T.coral, fontSize: 13 }}>
              <b>{warning.code}</b> - {warning.message}
            </div>
          ))}
          {evidence.map((item, index) => (
            <div key={`${item.label}-${index}`} style={{ color: T.text, fontSize: 13 }}>
              <b>{item.label}</b> ({item.points}) - {item.text}
            </div>
          ))}
          {!warnings.length && !evidence.length ? (
            <div style={{ color: T.muted, fontSize: 13 }}>
              No evidence or warnings saved.
            </div>
          ) : null}
        </div>
      </details>

      <button type="button" style={{ ...btnGhost, justifySelf: "start" }}>
        Edit metadata
      </button>
    </div>
  );
}
