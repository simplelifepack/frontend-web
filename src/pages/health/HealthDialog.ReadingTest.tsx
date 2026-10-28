import type { HealthMeasurement } from "@/lib/api.types";


export type ReadingTest = {
  key: string;
  label: string;
  unit: string;
  context?: string | null;
  bodySite?: string | null;
};


export function todayInputDate() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}


export function metricKeyFromName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}


export function readingTestKey(measurement: HealthMeasurement) {
  return [
    measurement.metricKey,
    measurement.context ?? "",
    measurement.bodySite ?? "",
  ].join("|");
}


export function buildReadingTests(measurements: HealthMeasurement[]) {
  const byKey = new Map<string, ReadingTest>();
  measurements
    .slice()
    .sort((a, b) => (a.measuredAt ?? "").localeCompare(b.measuredAt ?? ""))
    .forEach((measurement) => {
      const key = readingTestKey(measurement);
      byKey.set(key, {
        key,
        label: measurement.displayName,
        unit: measurement.unit,
        context: measurement.context,
        bodySite: measurement.bodySite,
      });
    });
  return [...byKey.values()].sort((a, b) => a.label.localeCompare(b.label));
}
