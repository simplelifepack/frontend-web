import { validateDateOfBirth } from "./healthUtils";
import { useState } from "react";
import { FlaskConical, Link2, Pill, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import type { HealthMeasurement, HealthMember, HealthRecord } from "@/lib/api.types";
import { type VisitDocument, type HealthDialogKind, type ReminderType, type ReminderFrequency } from "./HealthDialog.HealthDialogKind";
import { visitDate, formatVisitDate, isInsuranceDocument } from "./HealthDialog.buildVisitContexts";

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
  const insurance = item.record.type === "medical_report" && item.document && isInsuranceDocument(item.document);
  const Icon = item.record.type === "lab_report"
    ? FlaskConical
    : item.record.type === "prescription"
      ? Pill
      : insurance ? ShieldCheck : Link2;
  return (
    <span className={insurance ? "lp-visit-pack-document-icon lp-visit-pack-insurance-icon" : "lp-visit-pack-document-icon"}>
      <Icon aria-hidden="true" focusable="false" size={17} />
    </span>
  );
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
  const [identity, setIdentity] = useState({
    name: member.name, relation: member.relation, dateOfBirth: member.dateOfBirth ?? "",
    age: member.age == null ? "" : String(member.age), gender: member.gender ?? "",
  });
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
    const age = identity.age === "" ? null : Number(identity.age);
    if (kind === "profile") {
      const issue = validateDateOfBirth(identity.dateOfBirth);
      if (!identity.name.trim() || issue || (age != null && (!Number.isInteger(age) || age < 0 || age > 120))) {
        setError(issue || (!identity.name.trim() ? "Enter the patient name." : "Enter an age from 0 to 120."));
        return;
      }
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
          name: identity.name.trim(),
          relation: identity.relation,
          dateOfBirth: identity.dateOfBirth || null,
          age: identity.age === (member.age == null ? "" : String(member.age)) ? undefined : age,
          gender: identity.gender.trim() || null,
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
return { kind, member, identity, setIdentity, records, measurements, onClose, onSaved, onViewDocument, title, setTitle, date, setDate, reminderType, setReminderType, reminderFrequency, setReminderFrequency, bloodGroup, setBloodGroup, conditions, setConditions, allergies, setAllergies, emergencyContactName, setEmergencyContactName, emergencyContactPhone, setEmergencyContactPhone, primaryDoctor, setPrimaryDoctor, insuranceProvider, setInsuranceProvider, insurancePolicyNumber, setInsurancePolicyNumber, error, setError, saving, setSaving, titles, save };
}
