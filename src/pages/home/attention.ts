import { A, T } from "@/constants/theme";
import type { DocumentRecord, HealthHomeReminder, HealthTimelineEvent, WealthRecord } from "@/lib/api";
import { documentTitle, expiryValue, safeCategory } from "@/pages/documents/document-utils";
import { recordSubtitle } from "@/pages/wealth/wealth-view";

export type HomeAttentionItem = {
  id: string;
  module: "Documents" | "Health" | "Wealth";
  label: string;
  detail: string;
  tone: string;
  route: string;
};

export type HealthMedicationAttention = HealthTimelineEvent & {
  memberId: string;
  memberName: string;
};

const attentionWindowDays = 60;
const dateFields = ["dateOfExpiry", "validTill", "validUpto", "tripEndDate", "maturityDate", "dueDate", "renewalDate", "policyEndDate"];

export function daysUntil(value: string) {
  return Math.ceil((new Date(value).getTime() - Date.now()) / 86_400_000);
}

function validDaysUntil(value: string) {
  const days = daysUntil(value);
  return Number.isFinite(days) ? days : null;
}

export function reminderWhen(value: string | null) {
  if (!value) return "upcoming";
  const days = daysUntil(value);
  if (days <= 0) return days < 0 ? `${Math.abs(days)}d overdue` : "today";
  return `in ${days} day${days === 1 ? "" : "s"}`;
}

export function documentAttention(documents: DocumentRecord[]): HomeAttentionItem[] {
  const expiring = documents.flatMap((document) => {
    const expiry = expiryValue(document);
    if (!expiry) return [];
    const days = validDaysUntil(expiry);
    if (days === null) return [];
    if (days >= attentionWindowDays) return [];
    return [{
      id: `document-expiry-${document.id}`,
      module: "Documents" as const,
      label: document.displayName || documentTitle(document),
      detail: days < 0 ? "expired" : `${days}d left`,
      tone: days < 0 ? T.coral : T.warning,
      route: `/documents/${safeCategory(document.category)}/${document.id}`,
    }];
  });
  const review = documents.filter((document) => document.documentType === "Unknown").map((document) => ({
    id: `document-review-${document.id}`,
    module: "Documents" as const,
    label: document.displayName || document.originalName || "Document",
    detail: "needs classification",
    tone: T.warning,
    route: `/documents/${safeCategory(document.category)}/${document.id}`,
  }));
  return [...expiring, ...review];
}

export function healthAttention(reminders: HealthHomeReminder[]): HomeAttentionItem[] {
  return reminders.map((reminder) => ({
    id: `health-${reminder.id}`,
    module: "Health" as const,
    label: `${reminder.title}${reminder.memberName ? ` · ${reminder.memberName}` : ""}`,
    detail: reminderWhen(reminder.dueDate),
    tone: A.pink,
    route: `/health?tab=Overview${reminder.memberId ? `&member=${encodeURIComponent(reminder.memberId)}` : ""}&reminder=${encodeURIComponent(reminder.id)}`,
  }));
}

export function medicationAttention(events: HealthMedicationAttention[]): HomeAttentionItem[] {
  return events.flatMap((event) => {
    if (event.eventType !== "medication" || !event.occurredAt || !/runs out/i.test(event.detail ?? "")) return [];
    const days = validDaysUntil(event.occurredAt);
    if (days === null) return [];
    if (days >= attentionWindowDays) return [];
    return [{
      id: `health-medication-${event.id}`,
      module: "Health" as const,
      label: `${event.title} · ${event.memberName}`,
      detail: days < 0 ? "ran out" : `runs out ${reminderWhen(event.occurredAt)}`,
      tone: days < 0 ? T.coral : A.pink,
      route: `/health?tab=Medications&member=${encodeURIComponent(event.memberId)}&medication=${encodeURIComponent(event.id)}`,
    }];
  });
}

export function wealthAttention(records: WealthRecord[]): HomeAttentionItem[] {
  return records.flatMap((record) => {
    const rawDate = record.followUpDate ?? dateFields.map((field) => record.details[field]).find((value): value is string => typeof value === "string" && Boolean(value));
    if (!rawDate) return [];
    const days = validDaysUntil(rawDate);
    if (days === null) return [];
    if (days >= attentionWindowDays) return [];
    return [{
      id: `wealth-time-${record.id}`,
      module: "Wealth" as const,
      label: record.title,
      detail: `${record.followUpDate ? "follow up" : "time-sensitive"} · ${days < 0 ? "overdue" : `${days}d left`} · ${recordSubtitle(record)}`,
      tone: days < 0 ? T.coral : T.warning,
      route: `/wealth?record=${encodeURIComponent(record.id)}&action=review`,
    }];
  });
}
