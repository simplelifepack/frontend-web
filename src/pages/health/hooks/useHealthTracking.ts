import { api } from "@/lib/api";
import type {
  HealthAvailableMetric,
  HealthRecordDetail,
  TrackedHealthMetric,
} from "@/lib/api.types";
import type { useHealthData } from "./useHealthData";
import { metricIdentity } from "../healthUtils";

export function useHealthTracking(data: ReturnType<typeof useHealthData>) {
  const {
    selectedMemberId,
    tracked,
    selectedRecord,
    setSelectedRecord,
    setMessage,
    refreshHealth,
  } = data;
  const trackMetric = async (metric: {
    metricKey: string;
    displayName: string;
    context?: string | null;
    bodySite?: string | null;
  }) => {
    if (!selectedMemberId) return;
    try {
      await api.health.trackMetric(selectedMemberId, metric);
      await refreshHealth(selectedMemberId);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Metric could not be tracked.",
      );
    }
  };

  const refreshAfterTracking = async (recordId?: string) => {
    if (!selectedMemberId) return;
    await refreshHealth(selectedMemberId);
    if (recordId) setSelectedRecord(await api.health.record(recordId));
  };

  const trackMetrics = async (
    metrics: Array<{
      metricKey: string;
      displayName: string;
      context?: string | null;
      bodySite?: string | null;
    }>,
    recordId?: string,
  ) => {
    if (!selectedMemberId) return;
    try {
      await Promise.all(
        metrics.map((metric) =>
          api.health.trackMetric(selectedMemberId, metric),
        ),
      );
      await refreshAfterTracking(recordId);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Metrics could not be tracked.",
      );
      throw error;
    }
  };

  const applyTrackedMetrics = async (metrics: HealthAvailableMetric[]) => {
    if (!selectedMemberId) return;
    const selected = new Set(metrics.map(metricIdentity));
    try {
      await Promise.all([
        ...metrics
          .filter((metric) => !tracked.some((item) => metricIdentity(item) === metricIdentity(metric)))
          .map((metric) =>
            api.health.trackMetric(selectedMemberId, {
              metricKey: metric.metricKey,
              displayName: metric.displayName,
              context: metric.context,
              bodySite: metric.bodySite,
            }),
          ),
        ...tracked
          .filter((metric) => !selected.has(metricIdentity(metric)))
          .map((metric) => api.health.untrackMetric(selectedMemberId, metric.id)),
      ]);
      await refreshHealth(selectedMemberId);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Tracking preferences could not be updated.",
      );
      throw error;
    }
  };

  const toggleRecordMetric = async (
    measurement: HealthRecordDetail["measurements"][number],
    trackedNow: boolean,
  ) => {
    if (!selectedMemberId) return;
    try {
      if (trackedNow) {
        const trackedMetric = tracked.find(
          (item) =>
            item.metricKey === measurement.metricKey &&
            (item.context ?? null) === (measurement.context ?? null) &&
            (item.bodySite ?? null) === (measurement.bodySite ?? null),
        );
        if (trackedMetric)
          await api.health.untrackMetric(selectedMemberId, trackedMetric.id);
      } else {
        await api.health.trackMetric(selectedMemberId, {
          metricKey: measurement.metricKey,
          displayName: measurement.displayName,
          context: measurement.context,
          bodySite: measurement.bodySite,
        });
      }
      await refreshAfterTracking(selectedRecord?.id);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Tracking preference could not be updated.",
      );
    }
  };

  const untrackMetric = async (metric: TrackedHealthMetric) => {
    if (!selectedMemberId) return;
    try {
      await api.health.untrackMetric(selectedMemberId, metric.id);
      await refreshHealth(selectedMemberId);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Metric could not be stopped.",
      );
    }
  };

  return {
    applyTrackedMetrics,
    trackMetric,
    trackMetrics,
    toggleRecordMetric,
    untrackMetric,
  };
}
