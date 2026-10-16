import { Heading, Text, ModalBackdrop, ModalPanel, Select, SearchField, Button } from "@/design-system";

import { useState } from "react";
import { Check, X } from "lucide-react";
import type { HealthRecordDetail, TrackedHealthMetric } from "@/lib/api.types";

import {
  documentTypeLabels,
  filterMeasurements,
  metricIdentity,
  uniqueMeasurements,
  valueWithUnit,
} from "../healthUtils";
import { healthDocumentTypes, type HealthDocumentType } from "../types/health";

function MeasurementSelectionDialog({
  record,
  tracked,
  onSkip,
  onSave,
}: {
  record: HealthRecordDetail;
  tracked: TrackedHealthMetric[];
  onSkip: () => Promise<void>;
  onSave: (
    metrics: Array<{
      metricKey: string;
      displayName: string;
      context?: string | null;
      bodySite?: string | null;
    }>,
    documentType: HealthDocumentType,
  ) => Promise<void>;
}) {
  const alreadyTracked = new Set(tracked.map(metricIdentity));
  const measurements = uniqueMeasurements(record.measurements);
  const [selected, setSelected] = useState(
    () =>
      new Set(
        measurements
          .filter((item) => alreadyTracked.has(metricIdentity(item)))
          .map(metricIdentity),
      ),
  );
  const [query, setQuery] = useState("");
  const [documentType, setDocumentType] = useState<HealthDocumentType>(
    record.type,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const visible = filterMeasurements(measurements, query);
  const selectedMeasurements = visible.filter((item) =>
    selected.has(metricIdentity(item)),
  );
  const unselectedMeasurements = visible.filter(
    (item) => !selected.has(metricIdentity(item)),
  );
  const toggle = (measurement: HealthRecordDetail["measurements"][number]) => {
    const key = metricIdentity(measurement);
    if (alreadyTracked.has(key)) return;
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };
  const save = async () => {
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      const metrics = measurements
          .filter(
            (item) =>
              selected.has(metricIdentity(item)) &&
              !alreadyTracked.has(metricIdentity(item)),
          )
          .map((item) => ({
            metricKey: item.metricKey,
            displayName: item.displayName,
            context: item.context,
            bodySite: item.bodySite,
          }));
      await onSave(metrics, documentType);
    } catch {
      setError("Unable to save tracking preferences. Try again.");
      setSaving(false);
    }
  };
  return (
    <ModalBackdrop  style={{ zIndex: "var(--layer-nestedDialog)" }}>
      <ModalPanel
        className="lp-health-add-dialog lp-health-measurement-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Choose measurements to track"
      >
        <header className="lp-health-dialog-head">
          <div>
            <Heading level={2} size="md">Report processed</Heading>
            <Text as="p" size="md">{record.measurementCount} measurements found</Text>
          </div>
          <Button size="sm" iconOnly variant="tertiary" type="button" onClick={onSkip} aria-label="Close">
            <X aria-hidden="true" focusable="false" size="var(--icon-regular)" />
          </Button>
        </header>
        <Heading level={3} size="sm">Correct details</Heading>
        <Text as="label" size="md" className="lp-health-document-type lp-health-correct-type">
          <span>Document type</span>
          <Select
            value={documentType}
            onChange={(event) =>
              setDocumentType(event.target.value as HealthDocumentType)
            }
          >
            {healthDocumentTypes.map((type) => (
              <option key={type} value={type}>
                {documentTypeLabels[type] ?? type}
              </option>
            ))}
          </Select>
        </Text>
        <Heading level={3} size="sm">Choose what you want to track</Heading>
        <div className="lp-health-toolbar compact">
          <SearchField aria-label="Search measurements"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search measurements..." />
        </div>
        <div className="lp-health-measurement-picker">
          <Heading level={4} size="sm">Selected</Heading>
          {selectedMeasurements.length ? (
            selectedMeasurements.map((item) => (
              <MeasurementChoice
                key={item.id}
                measurement={item}
                selected
                alreadyTracked={alreadyTracked.has(metricIdentity(item))}
                onToggle={() => toggle(item)}
              />
            ))
          ) : (
            <Text as="p" size="sm" className="lp-health-muted">No measurements selected.</Text>
          )}
          <Heading level={4} size="sm">All measurements</Heading>
          {unselectedMeasurements.map((item) => (
            <MeasurementChoice
              key={item.id}
              measurement={item}
              selected={false}
              alreadyTracked={false}
              onToggle={() => toggle(item)}
            />
          ))}
        </div>
        {error ? <Text as="div" size="sm" weight="semibold" className="lp-health-form-error" tone="danger" role="alert">{error}</Text> : null}
        <footer>
          <Button variant="secondary"
            type="button"
            disabled={saving}
            onClick={onSkip}
          >
            Skip for now
          </Button>
          <Button loading={saving} variant="primary"
            type="button"
            disabled={saving}
            onClick={save}
          >
            {saving ? "Saving..." : "Save tracking"}
          </Button>
        </footer>
      </ModalPanel>
    </ModalBackdrop>
  );
}

function MeasurementChoice({
  measurement,
  selected,
  alreadyTracked,
  onToggle,
}: {
  measurement: HealthRecordDetail["measurements"][number];
  selected: boolean;
  alreadyTracked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={alreadyTracked}
      className={selected ? "selected" : ""}
    >
      <span>
        {selected ? (
          <Check aria-hidden="true" focusable="false" size={14} />
        ) : (
          <span className="lp-health-open-circle" />
        )}
        <span>
          <b>{measurement.displayName}</b>
          <small>
            {alreadyTracked ? "Already tracking" : measurement.originalName}
          </small>
        </span>
      </span>
      <strong>{valueWithUnit(measurement)}</strong>
    </button>
  );
}

export default MeasurementSelectionDialog;
