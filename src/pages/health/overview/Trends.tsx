import { Text, Heading, SearchField, Button, Pill, Card } from "@/design-system";

import { Plus } from "lucide-react";

import MeasurementChart from "../MeasurementChart";

import type {
  HealthAvailableMetric,
  HealthOverview,
  TrackedHealthMetric,
} from "@/lib/api.types";
import { documentTypeLabels, formatDate, valueWithUnit } from "../healthUtils";
import HealthBlock from "../components/HealthBlock";
import EmptyTracked from "./EmptyTracked";
const MiniChart = MeasurementChart;

function Trends({
  tracked,
  available,
  search,
  onSearch,
  onTrack,
  onUntrack,
}: {
  tracked: HealthOverview["trackedMetrics"];
  available: HealthAvailableMetric[];
  search: string;
  onSearch: (value: string) => void;
  onTrack: (metric: HealthAvailableMetric) => void;
  onUntrack: (metric: TrackedHealthMetric) => void;
}) {
  return (
    <>
      <div className="lp-health-toolbar">
        <SearchField aria-label="Search measurements"
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search measurements..." />
        <Button variant="primary" type="button" >
          <Plus aria-hidden="true" focusable="false" size={15} /> Track measurement
        </Button>
      </div>
      {tracked.length ? (
        tracked.map((metric) => (
          <MetricDetail
            key={metric.id}
            metric={metric}
            onStop={() => onUntrack(metric)}
          />
        ))
      ) : (
        <EmptyTracked onTrack={() => undefined} />
      )}
      <HealthBlock title="Available from records">
        <div   className="lp-health-search-results">
          {available.map((metric) => (
            <button
              key={metric.metricKey}
              type="button"
              onClick={() => onTrack(metric)}
            >
              <span>
                <b>{metric.displayName}</b>
                <small>
                  Historical measurements available:{" "}
                  {metric.historicalReadingCount}
                </small>
              </span>
              <Pill tone={metric.isTracked ? "ready" : "flat"}>
                {metric.isTracked ? "tracked" : "track"}
              </Pill>
            </button>
          ))}
        </div>
      </HealthBlock>
    </>
  );
}

function MetricDetail({
  metric,
  onStop,
}: {
  metric: HealthOverview["trackedMetrics"][number];
  onStop: () => void;
}) {
  const latest = metric.latest;
  return (
    <Card className="lp-health-trend-card">
      <div className="lp-health-trend-head">
        <div>
          <Heading level={3} size="sm">{metric.displayName}</Heading>
          {latest ? (
            <Text size="sm">
              Latest · {valueWithUnit(latest)} · {formatDate(latest.measuredAt)}
            </Text>
          ) : (
            <Text size="sm">No measurements available yet.</Text>
          )}
        </div>
        <Button size="sm" variant="tertiary" type="button" onClick={onStop}>
          Stop tracking
        </Button>
      </div>
      {latest ? (
        <>
          <MiniChart measurements={metric.measurements} large />
          <div   className="lp-health-history">
            {metric.measurements
              .slice()
              .reverse()
              .map((item) => (
                <div key={item.id}>
                  <Text size="md">{formatDate(item.measuredAt)}</Text>
                  <Text as="b" size="md" weight="semibold">{valueWithUnit(item)}</Text>
                  <Text as="small" size="sm">
                    {documentTypeLabels[item.sourceType] ?? item.sourceType}
                  </Text>
                </div>
              ))}
          </div>
        </>
      ) : null}
    </Card>
  );
}

export default Trends;
