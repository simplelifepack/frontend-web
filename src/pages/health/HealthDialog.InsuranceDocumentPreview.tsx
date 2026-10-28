import { Text, Button } from "@/design-system";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { DocumentRecord } from "@/lib/api.types";


export function InsuranceDocumentPreview({ document }: { document: DocumentRecord }) {
  const pages = document.pages?.length
    ? document.pages
    : [{
      id: document.id,
      position: 1,
      label: "Page 1",
      sourceType: "upload",
      originalName: document.originalName,
      mimeType: document.mimeType,
      size: document.size,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    }];
  const [pageIndex, setPageIndex] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState("");
  const page = pages[Math.min(pageIndex, pages.length - 1)] ?? pages[0]!;
  const mimeType = page.mimeType.toLowerCase();

  useEffect(() => {
    setPageIndex((current) => Math.min(current, Math.max(0, pages.length - 1)));
  }, [pages.length]);

  useEffect(() => {
    if (document.source === "GOOGLE_DRIVE") return;
    if (!mimeType.startsWith("image/") && mimeType !== "application/pdf") return;
    let active = true;
    let objectUrl: string | null = null;
    setPreviewUrl(null);
    setPreviewError("");
    const load = page.id === document.id
      ? api.documents.preview(document.id)
      : api.documents.previewPage(document.id, page.id);
    void load.then(({ blob }) => {
      if (!active) return;
      objectUrl = URL.createObjectURL(blob);
      setPreviewUrl(objectUrl);
    }).catch((error) => {
      if (!active) return;
      setPreviewError(error instanceof Error ? error.message : "Preview unavailable.");
    });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [document.id, document.source, mimeType, page.id]);

  const canPreview = mimeType.startsWith("image/") || mimeType === "application/pdf";
  return (
    <section className="lp-insurance-document-stage">
      <div    className="lp-insurance-document-toolbar">
        <Text size="md">{pages.length > 1 ? `${page.label} of ${pages.length}` : "Document preview"}</Text>
        {pages.length > 1 ? (
          <div>
            <Button size="sm" variant="tertiary" type="button" disabled={pageIndex === 0} onClick={() => setPageIndex((index) => Math.max(0, index - 1))}>
              Previous
            </Button>
            <Button size="sm" variant="tertiary" type="button" disabled={pageIndex >= pages.length - 1} onClick={() => setPageIndex((index) => Math.min(pages.length - 1, index + 1))}>
              Next
            </Button>
          </div>
        ) : null}
      </div>
      <div   className="lp-insurance-document-preview">
        {document.source === "GOOGLE_DRIVE" ? (
          <Text as="p" size="md">This document remains in Google Drive. Open it from Documents to preview the original file.</Text>
        ) : previewError ? (
          <Text as="p" size="md">{previewError}</Text>
        ) : !canPreview ? (
          <Text as="p" size="md">Inline preview is not available for this file type. Open it from Documents to view the original file.</Text>
        ) : !previewUrl ? (
          <Text as="p" size="md">Loading preview...</Text>
        ) : mimeType.startsWith("image/") ? (
          <img src={previewUrl} alt={page.originalName} />
        ) : (
          <iframe src={previewUrl} title={page.originalName} />
        )}
      </div>
    </section>
  );
}
