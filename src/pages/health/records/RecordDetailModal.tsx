import { useEffect } from "react";
import type { HealthRecordDetail, TrackedHealthMetric } from "@/lib/api.types";
import RecordDetail from "./RecordDetail";

function RecordDetailModal({
  record,
  tracked,
  onClose,
  onViewOriginal,
  onToggleMetric,
}: {
  record: HealthRecordDetail | null;
  tracked: TrackedHealthMetric[];
  onClose: () => void;
  onViewOriginal: (documentId: string) => void;
  onToggleMetric: (
    measurement: HealthRecordDetail["measurements"][number],
    tracked: boolean,
  ) => void;
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  return (
    <div
      className="lp-modal-backdrop"
      style={{ zIndex: 95 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="lp-modal-panel lp-health-record-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Health record details"
      >
        {record ? (
          <RecordDetail
            record={record}
            tracked={tracked}
            onClose={onClose}
            onViewOriginal={() => onViewOriginal(record.documentId)}
            onToggleMetric={onToggleMetric}
          />
        ) : (
          <p className="lp-health-muted">Loading health record...</p>
        )}
      </div>
    </div>
  );
}

export default RecordDetailModal;
