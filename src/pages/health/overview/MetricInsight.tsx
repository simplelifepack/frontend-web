import { ChevronDown, CircleAlert } from "lucide-react";
import type { HealthMeasurement, HealthOverview } from "@/lib/api.types";
import { T } from "@/constants/theme";
import { measurementInRange } from "./measurementStatus";

function MetricInsight({
  tracked,
}: {
  tracked: HealthOverview["trackedMetrics"];
}) {
  const withRanges = tracked.filter(
    (metric): metric is typeof metric & { latest: HealthMeasurement } =>
      Boolean(
        metric.latest &&
        (metric.latest.referenceMin != null ||
          metric.latest.referenceMax != null),
      ),
  );
  const review = withRanges
    .filter((metric) => !measurementInRange(metric.latest))
    .map((metric) => metric.displayName);
  const inRange = withRanges
    .filter((metric) => measurementInRange(metric.latest))
    .map((metric) => metric.displayName);
  const parts = [
    review.length ? `${review.join(", ")} to review` : null,
    inRange.length ? `${inRange.join(", ")} in range` : null,
  ].filter(Boolean);
  return parts.length ? (
    <div className="lp-health-insight lp-health-metric-insight">
      <span>
        <CircleAlert size={16} color={T.gold} /> {parts.join(" · ")}
      </span>
      <ChevronDown size={16} />
    </div>
  ) : null;
}

export default MetricInsight;
