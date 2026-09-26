import { useEffect, useMemo, useState } from "react";
import { CalendarClock } from "lucide-react";
import Card from "@/components/Card";
import type {
  HealthAvailableMetric,
  HealthMeasurement,
  HealthOverview,
  HealthRecord,
} from "@/lib/api.types";
import { T } from "@/constants/theme";
import { formatDate, metricIdentity, relativeDate } from "../healthUtils";
import MetricCards, { type MetricCardMetric } from "./MetricCards";
import ReminderPanel from "./ReminderPanel";
import HealthReadiness from "./HealthReadiness";
import EmptyTracked from "./EmptyTracked";
import TrackedTestChooser from "./TrackedTestChooser";

function Overview({
  overview,
  records,
  onTrack,
  onReminder,
  onEdit,
  measurements,
  onApplyTracked,
}: {
  onReminder: () => void;
  onEdit: () => void;
  overview: HealthOverview | null;
  records: HealthRecord[];
  measurements: HealthMeasurement[];
  onTrack: () => void;
  onApplyTracked: (metrics: HealthAvailableMetric[]) => Promise<void>;
}) {
  const upcoming = overview?.upcoming ?? [];
  const [showAll, setShowAll] = useState(false);
  const [choosing, setChoosing] = useState(false);
  const allMetrics = useMemo(
    () => buildMetrics(measurements, overview?.trackedMetrics ?? []),
    [measurements, overview?.trackedMetrics],
  );
  useEffect(() => {
    setShowAll(false);
    setChoosing(false);
  }, [overview?.member.id]);
  const tracked = overview?.trackedMetrics ?? [];
  const visibleMetrics = showAll ? allMetrics.cards : tracked;
  const total = allMetrics.available.length || tracked.length;
  return (
    <>
      {upcoming[0] ? (
        <Card style={{ marginBottom: 16, padding: "13px 16px" }}>
          <div className="lp-health-event">
            <CalendarClock size={18} color={T.action} />
            <div>
              <b>{upcoming[0].title}</b>
              <small>
                {formatDate(upcoming[0].dueDate)} ·{" "}
                {relativeDate(upcoming[0].dueDate)}
              </small>
            </div>
          </div>
        </Card>
      ) : null}
      {total ? (
        <>
          <div className="lp-health-tracked-bar">
            <span>
              Showing {visibleMetrics.length} of {total} tracked tests
            </span>
            <div>
              <button type="button" onClick={() => setChoosing(true)}>
                Choose tests
              </button>
              <button type="button" onClick={() => setShowAll(true)}>
                Show all
              </button>
            </div>
          </div>
          <MetricCards tracked={visibleMetrics} />
        </>
      ) : (
        <EmptyTracked onTrack={onTrack} />
      )}
      {choosing ? (
        <TrackedTestChooser
          available={allMetrics.available}
          tracked={tracked}
          onApply={async (metrics) => {
            await onApplyTracked(metrics);
            setShowAll(false);
          }}
          onClose={() => setChoosing(false)}
        />
      ) : null}
      <div className="lp-two-col lp-health-overview-bottom">
        <ReminderPanel reminders={upcoming} onAdd={onReminder} />
        <HealthReadiness
          member={overview?.member}
          records={records}
          onRecords={onEdit}
        />
      </div>
    </>
  );
}

function buildMetrics(
  measurements: HealthMeasurement[],
  tracked: HealthOverview["trackedMetrics"],
) {
  const trackedKeys = new Set(tracked.map(metricIdentity));
  const grouped = new Map<string, HealthMeasurement[]>();
  measurements.forEach((item) => {
    const key = metricIdentity(item);
    grouped.set(key, [...(grouped.get(key) ?? []), item]);
  });
  const available: HealthAvailableMetric[] = [];
  const cards: MetricCardMetric[] = [];
  grouped.forEach((items, key) => {
    const sorted = [...items].sort((a, b) =>
      (a.measuredAt ?? "").localeCompare(b.measuredAt ?? ""),
    );
    const latest = sorted[sorted.length - 1]!;
    available.push({
      metricKey: latest.metricKey,
      displayName: latest.displayName,
      context: latest.context,
      bodySite: latest.bodySite,
      historicalReadingCount: sorted.length,
      isTracked: trackedKeys.has(key),
      latestValue: latest.value,
      secondaryValue: latest.secondaryValue,
      unit: latest.unit,
    });
    cards.push({ id: key, displayName: latest.displayName, measurements: sorted, latest });
  });
  return { available, cards };
}

export default Overview;
