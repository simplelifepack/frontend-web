import { Text } from "@/design-system";
import { type DocumentRecord } from "@/lib/api";
import type { HealthMeasurement } from "@/lib/api.types";
import { formatDate } from "../healthUtils";


export function DocumentMeta({ rows }: { rows: Array<[string, string]> }) {
  return (
    <dl className="lp-health-document-meta">
      {rows.map(([label, value]) => (
        <div key={label}>
          <Text as="dt" size="sm" weight="medium">{label}</Text>
          <Text as="dd" size="md" weight="semibold">{cleanValue(value)}</Text>
        </div>
      ))}
    </dl>
  );
}


export function referenceText(measurement: HealthMeasurement) {
  if (measurement.referenceText) return measurement.referenceText;
  if (
    typeof measurement.referenceMin === "number" &&
    typeof measurement.referenceMax === "number"
  )
    return `${measurement.referenceMin}–${measurement.referenceMax}`;
  if (typeof measurement.referenceMin === "number")
    return `> ${measurement.referenceMin}`;
  if (typeof measurement.referenceMax === "number")
    return `< ${measurement.referenceMax}`;
  return "—";
}


export function documentDate(value: string | null | undefined) {
  return value ? formatDate(value) : "—";
}


export function reportIdentifier(documentRecord: DocumentRecord | null) {
  return firstPresent(
    documentRecord?.uniqueIdentifier,
    documentRecord?.displayName,
    documentRecord?.title,
  );
}


export function cleanValue(value: string | null | undefined) {
  const text = value?.trim();
  return text || "—";
}


export function firstPresent(...values: Array<string | null | undefined>) {
  return values.map((value) => value?.trim()).find(Boolean) || "—";
}


export function sourceCopy(source: DocumentRecord["source"]) {
  if (source === "GMAIL") return "Gmail";
  if (source === "GOOGLE_DRIVE") return "Google Drive";
  return "Upload";
}
