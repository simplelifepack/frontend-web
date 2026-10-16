import { Heading, Text, ModalBackdrop, ModalPanel, Button } from "@/design-system";

import { useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import type {
  HealthAvailableMetric,
  TrackedHealthMetric,
} from "@/lib/api.types";

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
    <ModalBackdrop  style={{ zIndex: "var(--layer-nestedDialog)" }}>
      <ModalPanel onDismiss={onClose}
        className="lp-health-add-dialog lp-health-measurement-dialog"
        role="dialog"
        aria-modal="true"
      >
        <header className="lp-health-dialog-head">
          <div>
            <Heading level={2} size="md">Choose tests</Heading>
            <Text as="p" size="md">{selected.size} of {available.length} selected</Text>
          </div>
          <Button size="sm" iconOnly variant="tertiary" type="button" onClick={onClose} aria-label="Close">
            <X aria-hidden="true" focusable="false" size="var(--icon-regular)" />
          </Button>
        </header>
        <div   className="lp-health-measurement-picker">
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
                  {isSelected ? <Check aria-hidden="true" focusable="false" size={14} /> : <span className="lp-health-open-circle" />}
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
        {error ? <Text as="div" size="sm" weight="semibold" className="lp-health-form-error" tone="danger" role="alert">{error}</Text> : null}
        <footer>
          <Button variant="secondary" type="button" disabled={saving} onClick={onClose}>
            Cancel
          </Button>
          <Button loading={saving} variant="primary" type="button" disabled={saving} onClick={save}>
            {saving ? "Saving..." : "Apply"}
          </Button>
        </footer>
      </ModalPanel>
    </ModalBackdrop>
  );
}

export default TrackedTestChooser;
