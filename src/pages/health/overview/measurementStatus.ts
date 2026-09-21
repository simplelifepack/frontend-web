import type { HealthMeasurement } from "@/lib/api.types";

export function measurementStatus(measurement: HealthMeasurement) {
  if (measurement.referenceMin == null && measurement.referenceMax == null)
    return null;
  return measurementInRange(measurement)
    ? { label: "in range", tone: "ready" }
    : { label: "watch", tone: "warn" };
}

export function measurementInRange(measurement: HealthMeasurement) {
  if (measurement.referenceMin == null && measurement.referenceMax == null)
    return false;
  return (
    (measurement.referenceMin == null ||
      measurement.value >= measurement.referenceMin) &&
    (measurement.referenceMax == null ||
      measurement.value <= measurement.referenceMax)
  );
}
