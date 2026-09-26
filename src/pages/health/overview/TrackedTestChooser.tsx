import { useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import type {
  HealthAvailableMetric,
  TrackedHealthMetric,
} from "@/lib/api.types";
import { btnGhost, btnPrimary } from "@/constants/theme";
import { metricIdentity } from "../healthUtils";

function TrackedTestChooser({
  available,
  tracked,
  onApply,
  onClose,
}: {
  available: HealthAvailableMetric[];
  tracked: TrackedHealthMetric[];
  onApply: (metrics: HealthAvailableMetric[]) => Promise<void>;
  onClose: () => void;
}) {
  const trackedKeys = useMemo(() => new Set(tracked.map(metricIdentity)), [tracked]);
  const [selected, setSelected] = useState(() => new Set(trackedKeys));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const toggle = (metric: HealthAvailableMetric) => {
    const key = metricIdentity(metric);
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
      await onApply(available.filter((metric) => selected.has(metricIdentity(metric))));
      onClose();
    } catch {
      setError("Unable to update tracked tests. Try again.");
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
            <h2>Choose tests</h2>
            <p>{selected.size} of {available.length} selected</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>
        <div className="lp-health-measurement-picker">
          {available.map((metric) => {
            const isSelected = selected.has(metricIdentity(metric));
            return (
              <button
                key={metricIdentity(metric)}
                type="button"
                className={isSelected ? "selected" : ""}
                onClick={() => toggle(metric)}
              >
                <span>
                  {isSelected ? <Check size={14} /> : <span className="lp-health-open-circle" />}
                  <span>
                    <b>{metric.displayName}</b>
                    <small>{metric.historicalReadingCount} readings</small>
                  </span>
                </span>
                <strong>
                  {metric.latestValue}
                  {metric.secondaryValue != null ? `/${metric.secondaryValue}` : ""} {metric.unit}
                </strong>
              </button>
            );
          })}
        </div>
        {error ? <div className="lp-health-form-error">{error}</div> : null}
        <footer>
          <button type="button" style={btnGhost} disabled={saving} onClick={onClose}>
            Cancel
          </button>
          <button type="button" style={btnPrimary} disabled={saving} onClick={save}>
            {saving ? "Saving..." : "Apply"}
          </button>
        </footer>
      </div>
    </div>
  );
}

export default TrackedTestChooser;
