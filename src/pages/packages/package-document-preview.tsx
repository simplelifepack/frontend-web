import { X } from "lucide-react";

import { btnGhost } from "@/constants/theme";
import type { DocumentRecord } from "@/lib/api";
import { fieldsObject, labelize } from "../documents/document-utils";
import FilePreview from "../documents/file-preview";

type PackageDocumentPreviewProps = {
  document: DocumentRecord;
  onClose: () => void;
};

export default function PackageDocumentPreview({ document, onClose }: PackageDocumentPreviewProps) {
  const fields = fieldsObject(document);
  const rawText = document.rawText || (typeof fields.rawExtractedText === "string" ? fields.rawExtractedText : "");

  return (
    <>
      <button
        type="button"
        className="lp-document-preview-backdrop"
        aria-label="Close file preview"
        onClick={onClose}
      />
      <section className="lp-document-preview-modal" role="dialog" aria-modal="true">
        <header>
          <div>
            <h2>{document.displayName || labelize(document.documentType)}</h2>
            <p>{document.originalName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ ...btnGhost, padding: 8 }}
            aria-label="Close preview"
          >
            <X size={16} />
          </button>
        </header>
        <div className="lp-document-preview-content">
          <FilePreview doc={document} rawExtractedText={rawText} />
        </div>
      </section>
    </>
  );
}
