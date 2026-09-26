import { Plus, Search } from "lucide-react";
import Pill from "@/components/Pill";
import Card from "@/components/Card";
import MeasurementChart from "../MeasurementChart";
import { btnPrimary } from "@/constants/theme";
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
        <label>
          <Search size={15} />
          <input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search measurements..."
          />
        </label>
        <button type="button" style={btnPrimary}>
          <Plus size={15} /> Track measurement
        </button>
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
        <div className="lp-health-search-results">
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
          <h3>{metric.displayName}</h3>
          {latest ? (
            <span>
              Latest · {valueWithUnit(latest)} · {formatDate(latest.measuredAt)}
            </span>
          ) : (
            <span>No measurements available yet.</span>
          )}
        </div>
        <button type="button" onClick={onStop}>
          Stop tracking
        </button>
      </div>
      {latest ? (
        <>
          <MiniChart measurements={metric.measurements} large />
          <div className="lp-health-history">
            {metric.measurements
              .slice()
              .reverse()
              .map((item) => (
                <div key={item.id}>
                  <span>{formatDate(item.measuredAt)}</span>
                  <b>{valueWithUnit(item)}</b>
                  <small>
                    {documentTypeLabels[item.sourceType] ?? item.sourceType}
                  </small>
                </div>
              ))}
          </div>
        </>
      ) : null}
    </Card>
  );
}

export default Trends;
