import { Check } from "lucide-react";
import type { HealthRecordDetail } from "@/lib/api.types";
import { valueWithUnit } from "../healthUtils";

function MeasurementList({
  title,
  measurements,
  trackedFor,
  onToggle,
  empty,
}: {
  title: string;
  measurements: HealthRecordDetail["measurements"];
  trackedFor: (
    measurement: HealthRecordDetail["measurements"][number],
  ) => boolean;
  onToggle: (
    measurement: HealthRecordDetail["measurements"][number],
    tracked: boolean,
  ) => void;
  empty: string;
}) {
  return (
    <div className="lp-health-measurements">
      <h4>{title}</h4>
      {measurements.length ? (
        measurements.map((item) => (
          <MeasurementRow
            key={item.id}
            measurement={item}
            tracked={trackedFor(item)}
            onToggle={onToggle}
          />
        ))
      ) : (
        <p className="lp-health-muted">{empty}</p>
      )}
    </div>
  );
}

function MeasurementRow({
  measurement,
  tracked,
  onToggle,
}: {
  measurement: HealthRecordDetail["measurements"][number];
  tracked: boolean;
  onToggle: (
    measurement: HealthRecordDetail["measurements"][number],
    tracked: boolean,
  ) => void;
}) {
  return (
    <button type="button" onClick={() => onToggle(measurement, tracked)}>
      <span>
        {tracked ? (
          <Check size={14} />
        ) : (
          <span className="lp-health-open-circle" />
        )}
        <span>
          <b>{measurement.displayName}</b>
          <small>{measurement.originalName}</small>
        </span>
      </span>
      <strong>{valueWithUnit(measurement)}</strong>
    </button>
  );
}

export default MeasurementList;
