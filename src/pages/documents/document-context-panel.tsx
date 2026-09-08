import { Clock, Download, ExternalLink, FileText, X } from "lucide-react";
import { useEffect, useState } from "react";

import { btnGhost, btnGold, T } from "@/constants/theme";
import { daysUntil } from "@/data/demoData";
import { api, type DocumentRecord } from "@/lib/api";
import {
  categories,
  expiryValue,
  fieldsObject,
  labelize,
  reviewFields,
  safeCategory,
  sourceLabel,
} from "./document-utils";
import FilePreview from "./file-preview";

type Props = {
  doc: DocumentRecord;
  onClose: () => void;
};

export default function DocumentContextPanel({ doc, onClose }: Props) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const category = safeCategory(doc.category);
  const categoryMeta =
    categories.find((item) => item.key === category) ?? categories[categories.length - 1];
  const CategoryIcon = categoryMeta.icon;
  const fields = fieldsObject(doc);
  const approvedFields = reviewFields(doc);
  const expiry = expiryValue(doc);
  const expiryDays =
    expiry && /^\d{4}-\d{2}-\d{2}$/.test(expiry) ? daysUntil(expiry) : null;
  const rawExtractedText =
    doc.rawText ||
    (typeof fields.rawExtractedText === "string" ? fields.rawExtractedText : "");

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (previewOpen) setPreviewOpen(false);
      else onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose, previewOpen]);

  const openDocument = async () => {
    if (doc.source === "GOOGLE_DRIVE" && doc.openUrl) {
      window.open(doc.openUrl, "_blank", "noopener,noreferrer");
      return;
    }
    const { blob, fileName } = await api.documents.download(doc.id);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
  };

  const fact = (label: string, value: string) => (
    <div className="lp-document-drawer-fact">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );

  return (
    <>
      <button
        type="button"
        className="lp-document-drawer-backdrop"
        aria-label="Close document panel"
        onClick={onClose}
      />
      <aside className="lp-document-drawer" aria-label={`${labelize(doc.documentType)} details`}>
        <header className="lp-document-drawer-header">
          <span
            className="lp-document-drawer-icon"
            style={{ background: `${categoryMeta.accent}22`, color: categoryMeta.accent }}
          >
            <CategoryIcon size={18} strokeWidth={1.9} />
          </span>
          <div>
            <h2>{doc.displayName || labelize(doc.documentType)}</h2>
            <p>{doc.originalName}</p>
          </div>
          <button type="button" onClick={onClose} style={{ ...btnGhost, padding: 8 }}>
            <X size={16} />
          </button>
        </header>

        <div className="lp-document-drawer-body">
          {expiryDays !== null ? (
            <div
              className="lp-document-drawer-expiry"
              data-state={expiryDays < 0 ? "expired" : expiryDays < 60 ? "soon" : "valid"}
            >
              <Clock size={15} />
              <span>
                {expiryDays < 0
                  ? `Expired ${Math.abs(expiryDays)} days ago`
                  : `Valid · expires in ${expiryDays} days`}
              </span>
            </div>
          ) : null}

          <span className="lp-document-drawer-label">Details</span>
          <div>
            {fact("Category", labelize(category))}
            {fact("Source", sourceLabel(doc))}
            {fact(
              doc.source === "MANUAL_UPLOAD" ? "Uploaded" : "Indexed",
              new Date(doc.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
            )}
            {fact("Size", `${Math.max(1, Math.round(doc.size / 1024)).toLocaleString()} KB`)}
          </div>

          <span className="lp-document-drawer-label">Review fields</span>
          {approvedFields.length ? (
            <div>
              {approvedFields.map((field, index) => (
                <div className="lp-document-drawer-fact" key={field.id ?? `${field.key}-${index}`}>
                  <span>{field.label}</span>
                  <strong>{field.value}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="lp-document-drawer-empty">No reviewed fields saved for this document.</p>
          )}

        </div>

        <footer className="lp-document-drawer-footer">
          <button
            type="button"
            onClick={() => setPreviewOpen((current) => !current)}
            style={{ ...btnGold, flex: 1, justifyContent: "center" }}
          >
            <FileText size={15} />
            Preview
          </button>
          <button type="button" onClick={() => void openDocument()} style={btnGhost}>
            {doc.source === "GOOGLE_DRIVE" ? <ExternalLink size={15} /> : <Download size={15} />}
          </button>
        </footer>
      </aside>
      {previewOpen ? (
        <>
          <button
            type="button"
            className="lp-document-preview-backdrop"
            aria-label="Close file preview"
            onClick={() => setPreviewOpen(false)}
          />
          <section className="lp-document-preview-modal" role="dialog" aria-modal="true">
            <header>
              <div>
                <h2>{doc.displayName || labelize(doc.documentType)}</h2>
                <p>{doc.originalName}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                style={{ ...btnGhost, padding: 8 }}
              >
                <X size={16} />
              </button>
            </header>
            <div className="lp-document-preview-content">
              <FilePreview doc={doc} rawExtractedText={rawExtractedText} />
            </div>
          </section>
        </>
      ) : null}
    </>
  );
}
