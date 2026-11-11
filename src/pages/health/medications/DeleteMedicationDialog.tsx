import { Button, Heading, ModalBackdrop, ModalPanel, Text } from "@/design-system";

export default function DeleteMedicationDialog({
  deleting,
  medicationName,
  onClose,
  onConfirm,
}: {
  deleting: boolean;
  medicationName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  return (
    <ModalBackdrop  style={{ zIndex: "var(--layer-nestedDialog)" }}>
      <ModalPanel onDismiss={onClose} className="lp-health-add-dialog" role="dialog" aria-modal="true" aria-label="Delete medication">
        <header className="lp-health-dialog-head">
          <div>
            <Heading level={2} size="md">Delete medication?</Heading>
            <Text as="p" size="md">{medicationName} will be permanently removed from this Health profile.</Text>
          </div>
        </header>
        <footer>
          <Button variant="secondary" type="button" disabled={deleting} onClick={onClose}>
            Cancel
          </Button>
          <Button tone="danger" variant="primary" type="button" disabled={deleting} onClick={() => void onConfirm()}>
            {deleting ? "Deleting..." : "Delete medication"}
          </Button>
        </footer>
      </ModalPanel>
    </ModalBackdrop>
  );
}
