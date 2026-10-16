import { Heading, Text, ModalBackdrop, ModalPanel, Button } from "@/design-system";

import { useState } from "react";
import { X } from "lucide-react";

function DeleteRecordDialog({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);
  return (
    <ModalBackdrop

      style={{ zIndex: "var(--layer-nestedDialog)" }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <ModalPanel onDismiss={onClose}
        className="lp-health-add-dialog"
        role="dialog"
        aria-modal="true"
      >
        <header className="lp-health-dialog-head">
          <Heading level={2} size="md">Delete health record?</Heading>
          <Button size="sm" iconOnly variant="tertiary" type="button" onClick={onClose} aria-label="Close">
            <X aria-hidden="true" focusable="false" size="var(--icon-regular)" />
          </Button>
        </header>
        <Text as="p" size="md">
          This will remove this record and the health data extracted from it.
        </Text>
        <footer>
          <Button variant="secondary"
            type="button"
            disabled={deleting}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button tone="danger" variant="primary"
            type="button"
            disabled={deleting}
            onClick={async () => {
              setDeleting(true);
              await onConfirm();
            }}
          >
            {deleting ? "Deleting..." : "Delete record"}
          </Button>
        </footer>
      </ModalPanel>
    </ModalBackdrop>
  );
}

export default DeleteRecordDialog;
