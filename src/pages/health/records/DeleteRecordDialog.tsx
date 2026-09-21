import { useState } from "react";
import { X } from "lucide-react";
import { btnGhost } from "@/constants/theme";

function DeleteRecordDialog({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);
  return (
    <div
      className="lp-modal-backdrop"
      style={{ zIndex: 90 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="lp-modal-panel lp-health-add-dialog"
        role="dialog"
        aria-modal="true"
      >
        <header className="lp-health-dialog-head">
          <h2>Delete health record?</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>
        <p>
          This will remove this record and the health data extracted from it.
        </p>
        <footer>
          <button
            type="button"
            style={btnGhost}
            disabled={deleting}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="lp-health-danger-button"
            disabled={deleting}
            onClick={async () => {
              setDeleting(true);
              await onConfirm();
            }}
          >
            {deleting ? "Deleting..." : "Delete record"}
          </button>
        </footer>
      </div>
    </div>
  );
}

export default DeleteRecordDialog;
