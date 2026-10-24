import { Text, Button, Card, Stack, Grid, Row } from "@/design-system";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock } from "lucide-react";

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
  const visibleMetrics = showAll ? allMetrics.cards : allMetrics.trackedCards;
  const total = allMetrics.available.length || tracked.length;
  return (
    <Stack $gap="s16">
      {upcoming[0] ? (
        <Card>
          <div className="lp-health-event">
            <CalendarClock
              aria-hidden="true"
              focusable="false"
              size="var(--icon-regular)"
              color={T.action}
            />
            <div>
              <Text as="b" size="md" weight="semibold">
                {upcoming[0].title}
              </Text>
              <Text as="small" size="sm">
                {formatDate(upcoming[0].dueDate)} ·{" "}
                {relativeDate(upcoming[0].dueDate)}
              </Text>
            </div>
          </div>
        </Card>
      ) : null}
      {total ? (
        <>
          <Row $justify="space-between">
            <Text size="md" weight="semibold">
              Showing {visibleMetrics.length} of {total} tracked tests
            </Text>
            <Row>
              <Button
                size="sm"
                variant="secondary"
                type="button"
                onClick={() => setChoosing(true)}
              >
                Choose tests
              </Button>
              <Button
                size="sm"
                variant="secondary"
                type="button"
                onClick={() => setShowAll(true)}
              >
                Show all
              </Button>
            </Row>
          </Row>
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
      <Grid $align="start">
        <ReminderPanel reminders={upcoming} onAdd={onReminder} />
        <HealthReadiness
          member={overview?.member}
          records={records}
          onRecords={onEdit}
        />
      </Grid>
    </Stack>
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
  const cardsByKey = new Map<string, MetricCardMetric>();
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
    cardsByKey.set(key, {
      id: key,
      displayName: latest.displayName,
      measurements: sorted,
      latest,
    });
  });
  const trackedCards = tracked.map((metric) => {
    const matched = cardsByKey.get(metricIdentity(metric));
    return matched
      ? { ...matched, id: metric.id, displayName: metric.displayName }
      : metric;
  });
  return { available, cards: [...cardsByKey.values()], trackedCards };
}

export default Overview;
