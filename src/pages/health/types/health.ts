export type HealthTab =
  | "Overview"
  | "Trends"
  | "Timeline"
  | "Medications"
  | "Records";
export type HealthDocumentType =
  | "lab_report"
  | "medical_report"
  | "prescription";

export const healthDocumentTypes: HealthDocumentType[] = [
  "lab_report",
  "medical_report",
  "prescription",
];
