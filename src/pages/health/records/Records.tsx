import { Heading, Text, Button, Card } from "@/design-system";

import {
  FileText,
  FlaskConical,
  Pencil,
  Pill,
  Stethoscope,
  Trash2,
  Upload,
} from "lucide-react";

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
          <Heading level={2} size="sm">
            <Stethoscope aria-hidden="true" focusable="false" size="var(--icon-regular)" /> Records
          </Heading>
          <Button variant="primary" type="button" onClick={onAdd}>
            <Upload aria-hidden="true" focusable="false" size="var(--icon-regular)" /> Upload medical record
          </Button>
        </div>
        <Text as="p" size="md" weight="medium" className="lp-health-records-copy">
          Upload anything. Readines reads the record on your device to file it,
          pull out the values and the ranges printed beside them, and note the
          doctor, hospital, and specialisation so a visit kit can be assembled.
          It records what the document says and never adds an opinion. A copy
          lands in Documents too.
        </Text>
        <Text as="div" size="md" className="lp-health-record-list" role="list">
          {records.map((record) => (
            <RecordRow
              key={record.id}
              record={record}
              active={record.id === selectedRecordId}
              onView={() => onSelect(record.id)}
              onDelete={() => onDelete(record)}
            />
          ))}
        </Text>
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
        <Icon aria-hidden="true" focusable="false" size="var(--icon-regular)" />
      </span>
      <span className="lp-health-record-main">
        <Text as="b" size="md" weight="semibold">{label}</Text>
        <Text as="small" size="sm">
          {label} · {formatDate(record.documentDate)}
        </Text>
        <small>
          <Text as="strong" size="md" weight="semibold">Read on {formatDate(readDate)}</Text>
          {source ? ` · ${source}` : ` · ${record.processingStatus}`}
        </small>
      </span>
      {onView || onDelete ? (
        <Text size="md" className="lp-health-record-actions">
          {onView ? (
            <Button size="sm" iconOnly variant="tertiary"
              type="button"
              aria-label={`Correct what was read for ${label}`}
              onClick={onView}
            >
              <Pencil aria-hidden="true" focusable="false" size="var(--icon-regular)" />
            </Button>
          ) : null}
          {onDelete ? (
            <Button size="sm" tone="danger" iconOnly variant="tertiary"
              type="button"
              aria-label={`Delete ${label}`}
              onClick={onDelete}
            >
              <Trash2 aria-hidden="true" focusable="false" size="var(--icon-regular)" />
            </Button>
          ) : null}
        </Text>
      ) : null}
    </div>
  );
}

export default Records;
