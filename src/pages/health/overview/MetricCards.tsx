import { Microscope } from "lucide-react";
import Card from "@/components/Card";
import type { HealthOverview } from "@/lib/api.types";
import MeasurementChart from "../MeasurementChart";
import { documentTypeLabels, formatDate } from "../healthUtils";
import { measurementStatus } from "./measurementStatus";
const MiniChart = MeasurementChart;

export type MetricCardMetric = Pick<
  HealthOverview["trackedMetrics"][number],
  "id" | "displayName" | "measurements" | "latest"
>;

function MetricCards({
  tracked,
}: {
  tracked: MetricCardMetric[];
}) {
  return (
    <div className="lp-health-vitals">
      {tracked.map((metric) => {
        const status = metric.latest ? measurementStatus(metric.latest) : null;
        return (
          <Card key={metric.id}>
            <div className="lp-health-vital-head">
              <span>{metric.displayName}</span>
              {status ? (
                <b className={`lp-health-metric-status ${status.tone}`}>
                  {status.label}
                </b>
              ) : null}
            </div>
            {metric.latest ? (
              <>
                <div className="lp-health-vital-value">
                  {metric.latest.value}
                  {metric.latest.secondaryValue != null
                    ? `/${metric.latest.secondaryValue}`
                    : ""}{" "}
                  <small>{metric.latest.unit}</small>
                </div>
                <MiniChart measurements={metric.measurements} />
                <div className="lp-health-log">
                  <Microscope size={12} />{" "}
                  {formatDate(metric.latest.measuredAt)} · From{" "}
                  {documentTypeLabels[metric.latest.sourceType] ??
                    metric.latest.sourceType}
                </div>
                {metric.latest.referenceText ? (
                  <div className="lp-health-reference">
                    Report reference: {metric.latest.referenceText}
                  </div>
                ) : null}
              </>
            ) : (
              <p className="lp-health-muted">No measurements available yet.</p>
            )}
          </Card>
        );
      })}
    </div>
  );
}

export default MetricCards;
