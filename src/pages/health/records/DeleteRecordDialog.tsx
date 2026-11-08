import { Heading, Text, ModalBackdrop, ModalPanel, Button } from "@/design-system";

import { useState } from "react";
import { X } from "lucide-react";

function DeleteRecordDialog({
  profileName,
  onClose,
  onConfirm,
}: {
  profileName?: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const dismiss = () => { if (!deleting) onClose(); };
  return (
    <ModalBackdrop

      style={{ zIndex: "var(--layer-nestedDialog)" }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) dismiss();
      }}
    >
      <ModalPanel onDismiss={dismiss}
        className="lp-health-add-dialog"
        role="dialog"
        aria-modal="true"
      >
        <header className="lp-health-dialog-head">
          <Heading level={2} size="md">{profileName ? "Delete health profile?" : "Delete health record?"}</Heading>
          <Button size="sm" iconOnly variant="tertiary" type="button" onClick={dismiss} aria-label="Close">
            <X aria-hidden="true" focusable="false" size="var(--icon-regular)" />
          </Button>
        </header>
        <Text as="p" size="md">
          {profileName
            ? `This deletes ${profileName}’s profile and its health data. Original uploads stay in Documents.`
            : "This will remove this record and the health data extracted from it."}
        </Text>
        {error ? <Text as="p" tone="danger" role="alert">{error}</Text> : null}
        <footer>
          <Button variant="secondary"
            type="button"
            disabled={deleting}
            onClick={dismiss}
          >
            Cancel
          </Button>
          <Button tone="danger" variant="primary"
            type="button"
            disabled={deleting}
            onClick={async () => {
              setDeleting(true);
              setError("");
              try {
                await onConfirm();
              } catch (error) {
                setError(error instanceof Error ? error.message : "Unable to delete. Try again.");
                setDeleting(false);
              }
            }}
          >
            {deleting ? "Deleting..." : profileName ? "Delete profile" : "Delete record"}
          </Button>
        </footer>
      </ModalPanel>
    </ModalBackdrop>
  );
}

export default DeleteRecordDialog;
