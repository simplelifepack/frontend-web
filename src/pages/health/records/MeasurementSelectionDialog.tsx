import { useState } from "react";
import { Check, Search, X } from "lucide-react";
import type { HealthRecordDetail, TrackedHealthMetric } from "@/lib/api.types";
import { btnGhost, btnGold } from "@/constants/theme";
import {
  filterMeasurements,
  metricIdentity,
  uniqueMeasurements,
  valueWithUnit,
} from "../healthUtils";

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
      await onSave(
        measurements
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
          })),
      );
    } catch {
      setError("Unable to save tracking preferences. Try again.");
      setSaving(false);
    }
  };
  return (
    <div className="lp-modal-backdrop" style={{ zIndex: 90 }}>
      <div
        className="lp-modal-panel lp-health-add-dialog lp-health-measurement-dialog"
        role="dialog"
        aria-modal="true"
      >
        <header className="lp-health-dialog-head">
          <div>
            <h2>Report processed</h2>
            <p>{record.measurementCount} measurements found</p>
          </div>
          <button type="button" onClick={onSkip} aria-label="Close">
            <X size={18} />
          </button>
        </header>
        <h3>Choose what you want to track</h3>
        <div className="lp-health-toolbar compact">
          <label>
            <Search size={15} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search measurements..."
            />
          </label>
        </div>
        <div className="lp-health-measurement-picker">
          <h4>Selected</h4>
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
            <p className="lp-health-muted">No measurements selected.</p>
          )}
          <h4>All measurements</h4>
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
        {error ? <div className="lp-health-form-error">{error}</div> : null}
        <footer>
          <button
            type="button"
            style={btnGhost}
            disabled={saving}
            onClick={onSkip}
          >
            Skip for now
          </button>
          <button
            type="button"
            style={btnGold}
            disabled={saving}
            onClick={save}
          >
            {saving ? "Saving..." : "Save tracking"}
          </button>
        </footer>
      </div>
    </div>
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
          <Check size={14} />
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
