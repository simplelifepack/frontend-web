import { Button, Card, SearchField } from "@/design-system";

import { useState } from "react";
import { FileText, X } from "lucide-react";

import type { HealthRecordDetail, TrackedHealthMetric } from "@/lib/api.types";
import {
  documentTypeLabels,
  filterMeasurements,
  formatDate,
} from "../healthUtils";
import HealthBlock from "../components/HealthBlock";
import MeasurementList from "./MeasurementList";

function RecordDetail({
  record,
  tracked,
  onClose,
  onViewOriginal,
  onToggleMetric,
}: {
  record: HealthRecordDetail;
  tracked: TrackedHealthMetric[];
  onClose?: () => void;
  onViewOriginal: () => void;
  onToggleMetric: (
    measurement: HealthRecordDetail["measurements"][number],
    tracked: boolean,
  ) => void;
}) {
  const [query, setQuery] = useState("");
  const isTracked = (measurement: HealthRecordDetail["measurements"][number]) =>
    tracked.some(
      (item) =>
        item.metricKey === measurement.metricKey &&
        (item.context ?? null) === (measurement.context ?? null) &&
        (item.bodySite ?? null) === (measurement.bodySite ?? null),
    );
  const trackedMeasurements = record.measurements.filter(isTracked);
  const visibleMeasurements = filterMeasurements(record.measurements, query);
  return (
    <Card>
      <div className="lp-health-record-detail-head">
        <div>
          <h3 className="lp-health-detail-title">
            {documentTypeLabels[record.type] ?? record.type}
          </h3>
          <p className="lp-health-detail-sub">
            {formatDate(record.documentDate)}
          </p>
        </div>
        <div className="lp-health-record-detail-actions">
          <Button size="sm" variant="secondary" type="button" onClick={onViewOriginal}>
            <FileText aria-hidden="true" focusable="false" size={15} /> View original document
          </Button>
          {onClose ? (
            <Button size="sm" iconOnly variant="tertiary"
              type="button"
              onClick={onClose}
              aria-label="Close report details"
            >
              <X aria-hidden="true" focusable="false" size="var(--icon-small)" />
            </Button>
          ) : null}
        </div>
      </div>
      <div className="lp-health-record-facts">
        <span>
          <small>Provider</small>
          <b>{record.provider ?? "Not found"}</b>
        </span>
        <span>
          <small>Doctor</small>
          <b>{record.doctor ?? "Not found"}</b>
        </span>
        <span>
          <small>Measurements</small>
          <b>{record.measurementCount}</b>
        </span>
        <span>
          <small>Tracked</small>
          <b>{trackedMeasurements.length}</b>
        </span>
        <span>
          <small>Follow-ups</small>
          <b>{record.followUpCount}</b>
        </span>
      </div>
      <MeasurementList
        title="Tracked measurements"
        measurements={trackedMeasurements}
        trackedFor={isTracked}
        onToggle={onToggleMetric}
        empty="No tracked measurements from this record yet."
      />
      <div className="lp-health-toolbar compact">
        <SearchField aria-label="Search measurements"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search measurements..." />
      </div>
      <MeasurementList
        title="All measurements"
        measurements={visibleMeasurements}
        trackedFor={isTracked}
        onToggle={onToggleMetric}
        empty="No measurements found."
      />
      {record.medications.length ? (
        <HealthBlock title="Medications">
          {record.medications.map((item) => (
            <div className="lp-health-record-row" key={item.id}>
              <span>
                <b>{item.name}</b>
                <small>
                  {[item.dose, item.frequency, item.duration, item.quantity]
                    .filter(Boolean)
                    .join(" · ")}
                </small>
              </span>
            </div>
          ))}
        </HealthBlock>
      ) : null}
    </Card>
  );
}

export default RecordDetail;
