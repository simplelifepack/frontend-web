import { Heading, Text, Button, Card, SearchField, Choice, ChoiceGroup, Stack, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/design-system";
import { useState } from "react";

import {
  FileText,
  FlaskConical,
  Eye,
  Pill,
  Stethoscope,
  Trash2,
  Upload,
} from "lucide-react";

import type { HealthMeasurement, HealthRecord } from "@/lib/api.types";
import { documentTypeLabels, formatDate } from "../healthUtils";

function Records({
  records,
  measurements,
  aiProcessingEnabled,
  selectedRecordId,
  onAdd,
  onSelect,
  onViewOriginal,
  onDelete,
}: {
  records: HealthRecord[];
  measurements: HealthMeasurement[];
  aiProcessingEnabled: boolean;
  selectedRecordId: string | null;
  onAdd: () => void;
  onSelect: (id: string) => void;
  onViewOriginal: (documentId: string) => void;
  onDelete: (record: HealthRecord) => void;
}) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const types = [...new Set(records.map((record) => record.type))];
  const search = query.trim().toLowerCase();
  const matchingRecordIds = new Set(
    measurements
      .filter((item) => search && [item.displayName, item.originalName].some((name) => name?.toLowerCase().includes(search)))
      .map((item) => item.recordId),
  );
  const visible = records.filter((record) =>
    (!type || record.type === type) &&
    (!search || matchingRecordIds.has(record.id) || [record.doctor, record.provider, documentTypeLabels[record.type]]
      .some((value) => value?.toLowerCase().includes(search)))
  );
  const byMonth = new Map<string, HealthRecord[]>();
  for (const record of visible) {
    const month = record.documentDate?.slice(0, 7) ?? "";
    const entries = byMonth.get(month);
    if (entries) entries.push(record);
    else byMonth.set(month, [record]);
  }

  return (
    <div className="lp-two-col lp-health-records-view">
      <Card className="lp-health-records-card">
        <Stack $gap="s16">
          <div className="lp-health-records-head">
            <Heading level={2} size="sm">
              <Stethoscope aria-hidden="true" focusable="false" size="var(--icon-regular)" /> Records
            </Heading>
            <Button variant="primary" type="button" onClick={onAdd}>
              <Upload aria-hidden="true" focusable="false" size="var(--icon-regular)" /> Upload medical record
            </Button>
          </div>
          {!aiProcessingEnabled && (
            <Text as="p" size="md" className="lp-health-records-copy">
              Document reading is off. Details are entered by hand.
            </Text>
          )}
          <SearchField aria-label="Search records" placeholder="Search doctor, hospital, lab or test" value={query} onChange={(event) => setQuery(event.target.value)} />
          <ChoiceGroup aria-label="Record types">
            <Choice type="button" appearance="filter" aria-pressed={!type} onClick={() => setType("")}>All</Choice>
            {types.map((value) => (
              <Choice key={value} type="button" appearance="filter" aria-pressed={type === value} onClick={() => setType(value)}>
                {documentTypeLabels[value] ?? value}
              </Choice>
            ))}
          </ChoiceGroup>
          {!visible.length && (
            <>
              <Text as="p" size="md">{records.length ? "No records match." : "No records yet."}</Text>
              {search && <Button type="button" variant="tertiary" onClick={() => setQuery("")}>Clear search</Button>}
            </>
          )}
          {[...byMonth].sort(([a], [b]) => b.localeCompare(a)).map(([month, entries]) => (
            <section key={month}>
              <Heading level={3} size="sm">
                {month ? new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${month}-01T00:00:00Z`)) : "Date not added"}
              </Heading>
              <div className="lp-health-record-list" role="list">
                {entries.map((record) => (
                  <RecordRow
                    key={record.id}
                    record={record}
                    active={record.id === selectedRecordId}
                    onView={() => onSelect(record.id)}
                    onViewOriginal={() => onViewOriginal(record.documentId)}
                    onDelete={() => onDelete(record)}
                  />
                ))}
              </div>
            </section>
          ))}
        </Stack>
      </Card>
    </div>
  );
}

function RecordRow({
  record,
  active,
  onView,
  onViewOriginal,
  onDelete,
}: {
  record: HealthRecord;
  active?: boolean;
  onView: () => void;
  onViewOriginal: () => void;
  onDelete: () => void;
}) {
  const label = documentTypeLabels[record.type] ?? record.type;
  const Icon =
    record.type === "lab_report"
      ? FlaskConical
      : record.type === "prescription"
        ? Pill
        : FileText;
  const title = [label, record.provider || record.doctor].filter(Boolean).join(" · ");
  const subtitle = [formatDate(record.documentDate), record.provider && record.doctor !== record.provider ? record.doctor : null]
    .filter(Boolean).join(" · ");
  const status =
    record.processingStatus === "pending" || record.processingStatus === "processing" ? "Reading" :
    record.processingStatus === "failed" || record.processingStatus === "handwritten_unreadable" ? "Couldn’t read" :
    record.processingStatus === "awaiting_profile_match" || !record.documentDate ? "Needs a check" :
    null;
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
      <button type="button" className="lp-health-record-main" aria-label={`Open ${title}`} onClick={onView}>
        <Text as="b" size="md" weight="semibold">{title}</Text>
        <Text as="small" size="sm">{subtitle}</Text>
        {status && <Text as="small" size="sm">{status}</Text>}
      </button>
        <div className="lp-health-record-actions">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" iconOnly variant="tertiary"
                    type="button"
                    aria-label="View original document"
                    onClick={onViewOriginal}
                  >
                    <Eye aria-hidden="true" focusable="false" size="var(--icon-regular)" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View original document</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button size="sm" tone="danger" iconOnly variant="tertiary"
              type="button"
              aria-label={`Delete ${title}`}
              onClick={onDelete}
            >
              <Trash2 aria-hidden="true" focusable="false" size="var(--icon-regular)" />
            </Button>
        </div>
    </div>
  );
}

export default Records;
