import { Eye, FileText, Trash2 } from "lucide-react";
import Card from "@/components/Card";
import type { HealthRecord } from "@/lib/api.types";
import { documentTypeLabels, formatDate } from "../healthUtils";

function Records({
  records,
  selectedRecordId,
  onAdd,
  onSelect,
  onDelete,
}: {
  records: HealthRecord[];
  selectedRecordId: string | null;
  onAdd: () => void;
  onSelect: (id: string) => void;
  onDelete: (record: HealthRecord) => void;
}) {
  return (
    <div className="lp-two-col lp-health-records-view">
      <Card>
        <div className="lp-health-card-title">
          <FileText size={17} /> Records{" "}
          <button type="button" onClick={onAdd}>
            + Add health record
          </button>
        </div>
        <div className="lp-health-record-list">
          {records.map((record) => (
            <RecordRow
              key={record.id}
              record={record}
              active={record.id === selectedRecordId}
              onView={() => onSelect(record.id)}
              onDelete={() => onDelete(record)}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}

function RecordRow({
  record,
  active,
  onView,
  onDelete,
}: {
  record: HealthRecord;
  active?: boolean;
  onView?: () => void;
  onDelete?: () => void;
}) {
  const count = record.measurementCount;
  return (
    <div
      className={
        active ? "lp-health-record-row active" : "lp-health-record-row"
      }
    >
      <span>
        <b>{documentTypeLabels[record.type] ?? record.type}</b>
        <small>
          {formatDate(record.documentDate)} ·{" "}
          {record.provider ?? record.doctor ?? record.processingStatus}
        </small>
        <small>{record.trackedMeasurementCount} tracked</small>
      </span>
      <strong>
        {count
          ? `${count} measurements`
          : record.medicationCount
            ? `${record.medicationCount} medications`
            : `${record.followUpCount} follow-ups`}
      </strong>
      {onView && onDelete ? (
        <div className="lp-health-record-actions">
          <button type="button" onClick={onView}>
            <Eye size={14} /> View
          </button>
          <button type="button" className="danger" onClick={onDelete}>
            <Trash2 size={14} /> Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default Records;
