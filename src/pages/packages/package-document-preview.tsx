import {
  Heading,
  Text,
  ModalBackdrop,
  DrawerBackdrop,
  ModalPanel,
  Button,
} from "@/design-system";

import { X } from "lucide-react";

import type { DocumentRecord } from "@/lib/api";
import { fieldsObject, labelize } from "../documents/document-utils";
import FilePreview from "../documents/file-preview";

type PackageDocumentPreviewProps = {
  document: DocumentRecord;
  onClose: () => void;
};

export default function PackageDocumentPreview({
  document,
  onClose,
}: PackageDocumentPreviewProps) {
  const fields = fieldsObject(document);
  const rawText =
    document.rawText ||
    (typeof fields.rawExtractedText === "string"
      ? fields.rawExtractedText
      : "");

  return (
    <>
      <ModalBackdrop style={{ zIndex: "var(--layer-detailDialog)" }}>
        <DrawerBackdrop
          type="button"
          className="lp-document-preview-backdrop"
          aria-label="Close file preview"
          onClick={onClose}
        />
        <ModalPanel
          onDismiss={onClose}
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
                {document.displayName || labelize(document.documentType)}
              </Heading>
              <Text as="p" size="sm">
                {document.originalName}
              </Text>
            </div>
            <Button
              iconOnly
              variant="tertiary"
              size="sm"
              type="button"
              onClick={onClose}
              aria-label="Close preview"
            >
              <X
                aria-hidden="true"
                focusable="false"
                size="var(--icon-small)"
              />
            </Button>
          </header>
          <div className="lp-document-preview-content">
            <FilePreview doc={document} rawExtractedText={rawText} />
          </div>
        </ModalPanel>
      </ModalBackdrop>
    </>
  );
}
