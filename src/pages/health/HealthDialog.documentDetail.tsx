import { useState } from "react";
import { FlaskConical, Link2, Pill, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import type { HealthMeasurement, HealthMember, HealthRecord } from "@/lib/api.types";
import { type VisitDocument, type HealthDialogKind, type ReminderType, type ReminderFrequency } from "./HealthDialog.HealthDialogKind";
import { visitDate, formatVisitDate } from "./HealthDialog.buildVisitContexts";

export function documentDetail(item: VisitDocument) {
  const fileName =
    item.document?.originalName ||
    item.document?.displayName ||
    item.document?.title;
  const date =
    visitDate(item) === "Undated"
      ? "Date unavailable"
      : formatVisitDate(visitDate(item));
  return fileName ? `${fileName} · ${date}` : date;
}

export function DocumentIcon({ item }: { item: VisitDocument }) {
  const meta = documentIconMeta(item);
  const Icon = meta.icon;
  return (
    <span
      className="lp-visit-pack-document-icon"
      style={{
        color: meta.color,
        background: meta.background,
      }}
    >
      <Icon aria-hidden="true" focusable="false" size={17} />
    </span>
  );
}

export function documentIconMeta(item: VisitDocument) {
  const text =
    `${item.record.type} ${item.document?.documentType ?? ""} ${item.document?.category ?? ""}`.toLowerCase();
  if (/prescription|medication|medicine/.test(text)) {
    return {
      icon: Pill,
      color: "var(--lp-purple)",
      background: "color-mix(in srgb, var(--lp-purple) 14%, transparent)",
    };
  }
  if (/lab|test|report|blood|lipid/.test(text)) {
    return {
      icon: FlaskConical,
      color: "var(--lp-pink)",
      background: "color-mix(in srgb, var(--lp-pink) 14%, transparent)",
    };
  }
  if (/insurance|policy/.test(text)) {
    return {
      icon: ShieldCheck,
      color: "var(--lp-mint)",
      background: "color-mix(in srgb, var(--lp-mint) 14%, transparent)",
    };
  }
  return {
    icon: Link2,
    color: "var(--lp-purple)",
    background: "color-mix(in srgb, var(--lp-purple) 14%, transparent)",
  };
}

export function humanRecordType(type: string) {
  return type
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function safeFileStem(value: string) {
  return (
    value
      .trim()
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "Health"
  );
}

export function safeFileName(value: string) {
  const parts = value.split(/[\\/]/).pop() || "document";
  return (
    parts
      .replace(/[^a-zA-Z0-9._ -]+/g, "-")
      .replace(/\s+/g, "-")
      .slice(0, 180) || "document"
  );
}

export function appendSuffix(path: string, suffix: number) {
  const index = path.lastIndexOf(".");
  return index > path.lastIndexOf("/")
    ? `${path.slice(0, index)}-${suffix}${path.slice(index)}`
    : `${path}-${suffix}`;
}


export function useHealthDialogLogic({
  kind,
  member,
  records,
  measurements,
  onClose,
  onSaved,
  onViewDocument,
}: {
  kind: HealthDialogKind;
  member: HealthMember;
  records: HealthRecord[];
  measurements: HealthMeasurement[];
  onClose: () => void;
  onSaved: () => Promise<void>;
  onViewDocument: (documentId: string) => void;
}) {

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [reminderType, setReminderType] = useState<ReminderType | "">("");
  const [reminderFrequency, setReminderFrequency] = useState<ReminderFrequency | "">("");
  const [bloodGroup, setBloodGroup] = useState(member.bloodGroup || "Unknown");
  const [conditions, setConditions] = useState(member.conditions || "");
  const [allergies, setAllergies] = useState(member.allergies || "");
  const [emergencyContactName, setEmergencyContactName] = useState(
    member.emergencyContactName || "",
  );
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(
    member.emergencyContactPhone || "",
  );
  const [primaryDoctor, setPrimaryDoctor] = useState(
    member.primaryDoctor || "",
  );
  const [insuranceProvider, setInsuranceProvider] = useState(
    member.insuranceProvider || "",
  );
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState(
    member.insurancePolicyNumber || "",
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const titles = {
    reminder: "Add reminder",
    profile: "Edit medical profile",
    emergency: "Emergency card",
    reading: "Log reading",
  };
  const save = async () => {
    if (kind === "reminder" && (!title.trim() || !reminderType || !date || !reminderFrequency)) {
      setError("Title, what for, due date, and how often are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (kind === "reminder")
        await api.health.createReminder({
          memberId: member.id,
          title: title.trim(),
          type: reminderType || "other",
          dueDate: date,
          frequency: reminderFrequency || "once",
        });
      else
        await api.health.updateMember(member.id, {
          bloodGroup,
          conditions,
          allergies,
          emergencyContactName,
          emergencyContactPhone,
          primaryDoctor,
          insuranceProvider,
          insurancePolicyNumber,
        });
      await onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save.");
    } finally {
      setSaving(false);
    }
  };
return { kind, member, records, measurements, onClose, onSaved, onViewDocument, title, setTitle, date, setDate, reminderType, setReminderType, reminderFrequency, setReminderFrequency, bloodGroup, setBloodGroup, conditions, setConditions, allergies, setAllergies, emergencyContactName, setEmergencyContactName, emergencyContactPhone, setEmergencyContactPhone, primaryDoctor, setPrimaryDoctor, insuranceProvider, setInsuranceProvider, insurancePolicyNumber, setInsurancePolicyNumber, error, setError, saving, setSaving, titles, save };
}
