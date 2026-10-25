import {
  ModalBackdrop,
  DrawerBackdrop,
  ModalPanel,
  Heading,
  Text,
  Button,
} from "@/design-system";
import { X } from "lucide-react";
import type { DocumentRecord } from "@/lib/api";
import { fieldsObject, labelize } from "./document-utils";
import FilePreview from "./file-preview";

export default function DocumentPreviewDialog({
  doc,
  onClose,
}: {
  doc: DocumentRecord;
  onClose: () => void;
}) {
  const rawExtractedText =
    doc.rawText || String(fieldsObject(doc).rawExtractedText ?? "");
  return (
    <ModalBackdrop style={{ zIndex: "var(--layer-detailDialog)" }}>
      <DrawerBackdrop
        type="button"
        className="lp-document-preview-backdrop"
        aria-label="Close file preview"
        onClick={() => onClose()}
      />
      <ModalPanel
        onDismiss={() => onClose()}
        aria-label="Document preview"
        as="section"
        flush
        className="lp-document-preview-modal"
        role="dialog"
        aria-modal="true"
      >
        <header>
          <div>
            <Heading level={2} size="sm">
              {doc.displayName || labelize(doc.documentType)}
            </Heading>
            <Text as="p" size="sm">
              {doc.originalName}
            </Text>
          </div>
          <Button
            iconOnly
            variant="tertiary"
            size="sm"
            aria-label="Close file preview"
            type="button"
            onClick={() => onClose()}
          >
            <X aria-hidden="true" focusable="false" size="var(--icon-small)" />
          </Button>
        </header>
        <div className="lp-document-preview-content">
          <FilePreview doc={doc} rawExtractedText={rawExtractedText} />
        </div>
      </ModalPanel>
    </ModalBackdrop>
  );
}
