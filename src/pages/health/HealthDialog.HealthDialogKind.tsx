import type { DocumentRecord, HealthRecord } from "@/lib/api.types";


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

export type ReminderType = "appointment" | "medicine" | "refill" | "other";

export type ReminderFrequency = "once" | "daily" | "weekly" | "monthly";


export const reminderTypeOptions: Array<{ value: ReminderType; label: string }> = [
  { value: "appointment", label: "Appointment" },
  { value: "medicine", label: "Take a medicine" },
  { value: "refill", label: "Refill" },
  { value: "other", label: "Something else" },
];

export const reminderFrequencyOptions: Array<{ value: ReminderFrequency; label: string }> = [
  { value: "once", label: "Once" },
  { value: "daily", label: "Every day" },
  { value: "weekly", label: "Every week" },
  { value: "monthly", label: "Every month" },
];
