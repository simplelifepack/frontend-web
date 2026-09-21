import type {
  HealthMemberResolution,
  HealthProcessResponse,
  HealthRecordDetail,
} from "@/lib/api.types";

export const documentTypeLabels: Record<string, string> = {
  lab_report: "Lab Report",
  medical_report: "Medical Report",
  prescription: "Prescription",
};

export function valueWithUnit(measurement: {
  value: number;
  secondaryValue?: number | null;
  unit: string;
}) {
  return `${measurement.value}${measurement.secondaryValue ? `/${measurement.secondaryValue}` : ""} ${measurement.unit}`;
}

export function metricIdentity(metric: {
  metricKey: string;
  context?: string | null;
  bodySite?: string | null;
}) {
  return [metric.metricKey, metric.context ?? "", metric.bodySite ?? ""].join(
    "|",
  );
}

export function uniqueMeasurements(
  measurements: HealthRecordDetail["measurements"],
) {
  const seen = new Set<string>();
  return measurements.filter((measurement) => {
    const key = metricIdentity(measurement);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function filterMeasurements(
  measurements: HealthRecordDetail["measurements"],
  query: string,
) {
  const q = query.trim().toLowerCase();
  if (!q) return measurements;
  return measurements.filter((measurement) =>
    [
      measurement.displayName,
      measurement.originalName,
      measurement.metricKey,
      ...(measurement.aliases ?? []),
    ].some((value) => value.toLowerCase().includes(q)),
  );
}

export function isSupportedHealthFile(file: File) {
  return file.type === "application/pdf" || file.type.startsWith("image/");
}

export function isMemberResolution(
  response: HealthProcessResponse,
): response is HealthMemberResolution {
  return response.processingStatus === "awaiting_profile_match";
}

export function healthMemberResolutionMessage(
  resolution: Extract<
    HealthProcessResponse,
    { processingStatus: "awaiting_profile_match" }
  >,
) {
  if (resolution.memberMatch.status === "ambiguous")
    return "We found more than one matching profile. Choose the correct profile to continue.";
  if (resolution.patient?.name)
    return `No Health profile found for ${resolution.patient.name}. Choose a profile to continue.`;
  return "We couldn't identify who this health record belongs to. Choose a profile to continue.";
}

export function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "M"
  );
}

export function isoDateInput(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function validateDateOfBirth(value: string) {
  if (!value) return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return "Enter a valid date of birth.";
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(year!, month! - 1, day!);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month! - 1 ||
    date.getDate() !== day
  )
    return "Enter a valid date of birth.";
  const today = new Date();
  const todayDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const minimum = new Date(todayDate);
  minimum.setFullYear(minimum.getFullYear() - 120);
  if (date > todayDate) return "Date of birth cannot be in the future.";
  if (date < minimum) return "Date of birth must be within the last 120 years.";
  return null;
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "No date";
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? "No date"
    : new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
}

export function formatMonthYear(value: string | null | undefined) {
  if (!value) return "Date unavailable";
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : new Intl.DateTimeFormat("en", { month: "long", year: "numeric" })
        .format(date)
        .toUpperCase();
}

export function relativeDate(value: string | null | undefined) {
  if (!value) return "date unavailable";
  const days = Math.ceil(
    (new Date(`${value.slice(0, 10)}T00:00:00`).getTime() - Date.now()) /
      86_400_000,
  );
  if (days < 0) return "past due";
  if (days === 0) return "today";
  return days < 45 ? `in ${days} days` : `in ${Math.round(days / 30)} months`;
}
