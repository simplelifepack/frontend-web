import type { DocumentRecord, HealthRecord, HealthReminderType, HealthReminderFrequency } from "@/lib/api.types";


export type HealthDialogKind =
  | "reminder"
  | "profile"
  | "emergency"
  | "insurance"
  | "visit"
  | "reading";

export type VisitContext = {
  id: string;
  label: string;
  kind: "doctor" | "provider" | "recent";
  recordIds: string[];
};

export type VisitDocument = { record: HealthRecord; document?: DocumentRecord };

export type ReminderType = HealthReminderType;

export type ReminderFrequency = HealthReminderFrequency;


export const reminderTypeOptions: Array<{ value: ReminderType; label: string }> = [
  { value: "appointment", label: "Appointment" },
  { value: "medicine", label: "Take a medicine" },
  { value: "refill", label: "Refill" },
  { value: "reading", label: "Take a reading" },
  { value: "vaccination", label: "Vaccination" },
  { value: "test", label: "Test" },
  { value: "other", label: "Something else" },
];

export const reminderFrequencyOptions: Array<{ value: ReminderFrequency; label: string }> = [
  { value: "once", label: "Once" },
  { value: "daily", label: "Every day" },
  { value: "weekly", label: "Every week" },
  { value: "monthly", label: "Every month" },
];
