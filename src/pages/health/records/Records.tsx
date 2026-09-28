import {
  FileText,
  FlaskConical,
  Pencil,
  Pill,
  Stethoscope,
  Trash2,
  Upload,
} from "lucide-react";
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
      <Card className="lp-health-records-card">
        <div className="lp-health-records-head">
          <h2>
            <Stethoscope size={18} /> Records
          </h2>
          <button type="button" onClick={onAdd}>
            <Upload size={18} /> Upload medical record
          </button>
        </div>
        <p className="lp-health-records-copy">
          Upload anything. ReadiNes reads the record on your device to file it,
          pull out the values and the ranges printed beside them, and note the
          doctor, hospital, and specialisation so a visit kit can be assembled.
          It records what the document says and never adds an opinion. A copy
          lands in Documents too.
        </p>
        <div className="lp-health-record-list" role="list">
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
  const label = documentTypeLabels[record.type] ?? record.type;
  const Icon =
    record.type === "lab_report"
      ? FlaskConical
      : record.type === "prescription"
        ? Pill
        : FileText;
  const readDate =
    record.processedAt ?? record.documentDate ?? record.createdAt ?? null;
  const source = [record.doctor, record.provider].filter(Boolean).join(" · ");
  return (
    <div
      className={
        active ? "lp-health-record-row active" : "lp-health-record-row"
      }
      role="listitem"
    >
      <span className={`lp-health-record-dot ${record.type}`} />
      <span className={`lp-health-record-type ${record.type}`}>
        <Icon size={18} />
      </span>
      <span className="lp-health-record-main">
        <b>{label}</b>
        <small>
          {label} · {formatDate(record.documentDate)}
        </small>
        <small>
          <strong>Read on {formatDate(readDate)}</strong>
          {source ? ` · ${source}` : ` · ${record.processingStatus}`}
        </small>
      </span>
      {onView || onDelete ? (
        <span className="lp-health-record-actions">
          {onView ? (
            <button
              type="button"
              className="lp-health-record-edit"
              aria-label={`Correct what was read for ${label}`}
              onClick={onView}
            >
              <Pencil size={18} />
            </button>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              className="lp-health-record-delete"
              aria-label={`Delete ${label}`}
              onClick={onDelete}
            >
              <Trash2 size={18} />
            </button>
          ) : null}
        </span>
      ) : null}
    </div>
  );
}

export default Records;
