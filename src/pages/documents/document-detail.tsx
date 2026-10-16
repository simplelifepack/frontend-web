import { Text, Button, Card, Pill } from "@/design-system";

import { Download, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { T } from "@/constants/theme";
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
    <div className="lp-route lp-document-detail-route" style={{ display: "grid", gap: "var(--space-s14)" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "var(--space-s12)",
          alignItems: "center",
        }}
      >
        <Button variant="secondary" size="sm"
          type="button"
          onClick={() => navigate("/documents")}
        >
          Documents
        </Button>
        <div style={{ display: "flex", gap: "var(--space-s8)", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <Button loading={Boolean(busy)} variant="primary" type="button" disabled={Boolean(busy)} onClick={() => void downloadDocument()} >
            <Download aria-hidden="true" focusable="false" size={15} /> {busy === "download" ? "Downloading..." : "Download"}
          </Button>
          <Button tone="danger" loading={Boolean(busy)} variant="secondary" type="button" disabled={Boolean(busy)} onClick={() => void removeDocument()} >
            <Trash2 aria-hidden="true" focusable="false" size={15} /> {busy === "delete" ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      <Card>
        <Text as="div" size="lg" weight="semibold" style={{ color: T.white }}>
          {documentTitle(doc)}
        </Text>
        <div style={{ display: "flex", gap: "var(--space-s10)", flexWrap: "wrap", marginTop: "var(--space-s12)" }}>
          <Pill tone="flat">{labelize(category)}</Pill>
          <Pill tone="flat">{labelize(doc.documentType)}</Pill>
          <Pill tone="flat">{sourceLabel(doc)}</Pill>
          <Pill tone="flat">{doc.pages?.length ? `${doc.pages.length} page${doc.pages.length === 1 ? "" : "s"}` : "1 page"}</Pill>
        </div>
        <Text as="div" size="md" tone="muted" style={{ color: T.muted, marginTop: "var(--space-s12)" }}>
          {doc.source === "MANUAL_UPLOAD" ? "Uploaded" : "Indexed"} {new Date(doc.createdAt).toLocaleString()} . {doc.originalName}
        </Text>
      </Card>

      <FilePreview doc={doc} rawExtractedText={rawExtractedText} />

      <Card>
        <Text as="div" size="md" weight="semibold" style={{ color: T.white, marginBottom: "var(--space-s12)" }}>
          Review fields
        </Text>
        {approvedFields.length ? (
          <div   style={{ display: "grid", gap: 9 }}>
            {approvedFields.map((field, index) => (
              <div
                key={field.id ?? `${field.key}-${index}`}
                style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "var(--space-s12)", fontSize: "var(--text-md)" }}
              >
                <Text as="div" size="md" tone="muted" style={{ color: T.muted }}>{field.label}</Text>
                <Text as="div" size="md" style={{ color: T.white }}>
                  {field.value}
                </Text>
              </div>
            ))}
          </div>
        ) : (
          <Text as="div" size="md" tone="muted" style={{ color: T.muted }}>
            No reviewed fields saved for this document.
          </Text>
        )}
      </Card>

      <details style={{ color: T.text }}>
        <summary style={{ cursor: "pointer", color: T.muted, fontWeight: "var(--weight-bold)" }}>
          Raw extracted text
        </summary>
        <Text as="pre" size="sm"
          style={{ whiteSpace: "pre-wrap", color: T.text, background: T.raised, border: `1px solid ${T.border}`, borderRadius: "var(--radius-s10)", padding: "var(--space-s12)" }}
        >
          {rawExtractedText || "No raw text saved."}
        </Text>
      </details>

      <details style={{ color: T.text }}>
        <summary style={{ cursor: "pointer", color: T.muted, fontWeight: "var(--weight-bold)" }}>
          Evidence and warnings
        </summary>
        <div   style={{ display: "grid", gap: "var(--space-s8)", marginTop: "var(--space-s10)" }}>
          {warnings.map((warning, index) => (
            <Text as="div" size="md" tone="danger" key={`${warning.code}-${index}`} style={{ color: T.coral }}>
              <b>{warning.code}</b> - {warning.message}
            </Text>
          ))}
          {evidence.map((item, index) => (
            <Text as="div" size="md" key={`${item.label}-${index}`} style={{ color: T.text }}>
              <b>{item.label}</b> ({item.points}) - {item.text}
            </Text>
          ))}
          {!warnings.length && !evidence.length ? (
            <Text as="div" size="md" tone="muted" style={{ color: T.muted }}>
              No evidence or warnings saved.
            </Text>
          ) : null}
        </div>
      </details>

      <Button variant="secondary" type="button" style={{ justifySelf: "start" }}>
        Edit metadata
      </Button>
    </div>
  );
}
