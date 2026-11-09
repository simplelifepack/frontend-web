export type HealthTab =
  | "Overview"
  | "Readings"
  | "Timeline"
  | "Medicines"
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
