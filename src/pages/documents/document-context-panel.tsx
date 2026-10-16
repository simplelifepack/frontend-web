import { ModalBackdrop, Text, Heading, DrawerPortal, DrawerBackdrop, ModalPanel, DrawerPanel, Button } from "@/design-system";

import { Clock, Download, FileText, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

import { T } from "@/constants/theme";
import { daysUntil } from "@/data/demoData";
import type { DocumentRecord } from "@/lib/api";
import { useAppDispatch } from "@/store/hooks";
import { deleteDocument } from "@/store/slices/documentsSlice";
import {
  categories,
  expiryValue,
  fieldsObject,
  labelize,
  reviewFields,
  safeCategory,
  sourceLabel,
} from "./document-utils";
import { confirmDeleteDocuments, downloadDocuments } from "./document-actions";
import FilePreview from "./file-preview";

type Props = {
  doc: DocumentRecord;
  loading?: boolean;
  onClose: () => void;
};

export default function DocumentContextPanel({ doc, loading = false, onClose }: Props) {
  const dispatch = useAppDispatch();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [busy, setBusy] = useState<"download" | "delete" | null>(null);
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

  const downloadDocument = async () => {
    setBusy("download");
    try { await downloadDocuments([doc]); } finally { setBusy(null); }
  };
  const removeDocument = async () => {
    if (!confirmDeleteDocuments(1)) return;
    setBusy("delete");
    try {
      await dispatch(deleteDocument(doc.id)).unwrap();
      onClose();
    } finally { setBusy(null); }
  };

  const fact = (label: string, value: string) => (
    <div className="lp-document-drawer-fact">
      <Text size="md">{label}</Text>
      <Text as="strong" size="md" weight="semibold">{value}</Text>
    </div>
  );

  return (
    <DrawerPortal>
      <DrawerBackdrop
        type="button"
        className="lp-document-drawer-backdrop"
        aria-label="Close document panel"
        onClick={onClose}
      />
      <DrawerPanel onDismiss={onClose} className="lp-document-drawer" aria-label={`${labelize(doc.documentType)} details`}>
        <header className="lp-document-drawer-header">
          <span
            className="lp-document-drawer-icon"
            style={{ background: `color-mix(in srgb, ${categoryMeta.accent} 13.33%, transparent)`, color: categoryMeta.accent }}
          >
            <CategoryIcon aria-hidden="true" focusable="false" size="var(--icon-regular)" strokeWidth={1.9} />
          </span>
          <div>
            <Heading level={2} size="sm">{doc.displayName || labelize(doc.documentType)}</Heading>
            <Text as="p" size="sm">{doc.originalName}</Text>
          </div>
          <Button iconOnly variant="tertiary" size="sm" type="button" aria-label="Close document panel" onClick={onClose} >
            <X aria-hidden="true" focusable="false" size="var(--icon-small)" />
          </Button>
        </header>

        <div className="lp-document-drawer-body">
          {expiryDays !== null ? (
            <div
              className="lp-document-drawer-expiry"
              data-state={expiryDays < 0 ? "expired" : expiryDays < 60 ? "soon" : "valid"}
            >
              <Clock aria-hidden="true" focusable="false" size={15} />
              <Text size="md">
                {expiryDays < 0
                  ? `Expired ${Math.abs(expiryDays)} days ago`
                  : `Valid · expires in ${expiryDays} days`}
              </Text>
            </div>
          ) : null}

          <Text size="sm" weight="semibold" className="lp-document-drawer-label">Details</Text>
          <Text as="div" size="md">
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
          </Text>

          <Text size="sm" weight="semibold" className="lp-document-drawer-label">Review fields</Text>
          {loading ? (
            <Text as="p" size="md" className="lp-document-drawer-empty">Loading document details...</Text>
          ) : null}
          {!loading && approvedFields.length ? (
            <Text as="div" size="md">
              {approvedFields.map((field, index) => (
                <div className="lp-document-drawer-fact" key={field.id ?? `${field.key}-${index}`}>
                  <span>{field.label}</span>
                  <strong>{field.value}</strong>
                </div>
              ))}
            </Text>
          ) : !loading ? (
            <Text as="p" size="md" className="lp-document-drawer-empty">No reviewed fields saved for this document.</Text>
          ) : null}

        </div>

        <footer className="lp-document-drawer-footer">
          <Button variant="primary"
            type="button"
            disabled={loading}
            onClick={() => setPreviewOpen((current) => !current)}
            style={{ flex: 1 }}
          >
            <FileText aria-hidden="true" focusable="false" size={15} />
            Preview
          </Button>
          <Button variant="secondary" type="button" disabled={loading || Boolean(busy)} onClick={() => void downloadDocument()} >
            <Download aria-hidden="true" focusable="false" size={15} /> Download
          </Button>
          <Button tone="danger" variant="secondary" type="button" disabled={loading || Boolean(busy)} onClick={() => void removeDocument()} >
            <Trash2 aria-hidden="true" focusable="false" size={15} /> Delete
          </Button>
        </footer>
      </DrawerPanel>
      {previewOpen ? (
        <>
          <ModalBackdrop style={{ zIndex: "var(--layer-detailDialog)" }}>
<DrawerBackdrop
            type="button"
            className="lp-document-preview-backdrop"
            aria-label="Close file preview"
            onClick={() => setPreviewOpen(false)}
          />
          <ModalPanel onDismiss={() => setPreviewOpen(false)} aria-label="Document preview" as="section" flush className="lp-document-preview-modal" role="dialog" aria-modal="true">
            <header>
              <div>
                <Heading level={2} size="sm">{doc.displayName || labelize(doc.documentType)}</Heading>
                <Text as="p" size="sm">{doc.originalName}</Text>
              </div>
              <Button iconOnly variant="tertiary" size="sm" aria-label="Close file preview"
                type="button"
                onClick={() => setPreviewOpen(false)}
              >
                <X aria-hidden="true" focusable="false" size="var(--icon-small)" />
              </Button>
            </header>
            <div className="lp-document-preview-content">
              <FilePreview doc={doc} rawExtractedText={rawExtractedText} />
            </div>
          </ModalPanel>
</ModalBackdrop>
        </>
      ) : null}
    </DrawerPortal>
  );
}
