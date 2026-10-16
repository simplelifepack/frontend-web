import { Text, Card } from "@/design-system";

import { Microscope } from "lucide-react";

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
    <div   className="lp-health-vitals">
      {tracked.map((metric) => {
        const status = metric.latest ? measurementStatus(metric.latest) : null;
        return (
          <Card key={metric.id}>
            <Text as="div" size="md" className="lp-health-vital-head">
              <span>{metric.displayName}</span>
              {status ? (
                <b className={`lp-health-metric-status ${status.tone}`}>
                  {status.label}
                </b>
              ) : null}
            </Text>
            {metric.latest ? (
              <>
                <Text as="div" size="lg" weight="semibold" className="lp-health-vital-value">
                  {metric.latest.value}
                  {metric.latest.secondaryValue != null
                    ? `/${metric.latest.secondaryValue}`
                    : ""}{" "}
                  <small>{metric.latest.unit}</small>
                </Text>
                <MiniChart measurements={metric.measurements} />
                <Text as="div" size="sm" className="lp-health-log">
                  <Microscope aria-hidden="true" focusable="false" size={12} />{" "}
                  {formatDate(metric.latest.measuredAt)} · From{" "}
                  {documentTypeLabels[metric.latest.sourceType] ??
                    metric.latest.sourceType}
                </Text>
                {metric.latest.referenceText ? (
                  <Text as="div" size="sm" className="lp-health-reference">
                    Report reference: {metric.latest.referenceText}
                  </Text>
                ) : null}
              </>
            ) : (
              <Text as="p" size="sm" className="lp-health-muted">No measurements available yet.</Text>
            )}
          </Card>
        );
      })}
    </div>
  );
}

export default MetricCards;
