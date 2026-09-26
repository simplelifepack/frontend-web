import {
  BookOpen,
  Briefcase,
  Car,
  FileText,
  Fingerprint,
  Gavel,
  HeartPulse,
  Home,
  ImageIcon,
  Plane,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import type { DocumentRecord, ReviewField } from "@/lib/api";

export type Source = {
  id: string;
  name: string;
  connected: boolean;
  detail?: string;
};

export const categories = [
  { key: "identity", name: "Identity", accent: "var(--lp-info)", icon: Fingerprint },
  { key: "employment", name: "Employment", accent: "var(--lp-purple)", icon: Briefcase },
  { key: "finance", name: "Finance", accent: "var(--lp-teal)", icon: Wallet },
  { key: "insurance", name: "Insurance", accent: "var(--lp-teal)", icon: ShieldCheck },
  { key: "property", name: "Property", accent: "var(--lp-pink)", icon: Home },
  { key: "medical", name: "Medical", accent: "var(--lp-mint)", icon: HeartPulse },
  { key: "education", name: "Education", accent: "var(--lp-purple)", icon: BookOpen },
  { key: "travel", name: "Travel", accent: "var(--lp-info)", icon: Plane },
  { key: "vehicle", name: "Vehicle", accent: "var(--lp-mint)", icon: Car },
  { key: "legal", name: "Legal", accent: "var(--lp-pink)", icon: Gavel },
  { key: "photo", name: "Photo", accent: "var(--lp-warning)", icon: ImageIcon },
  { key: "other", name: "Other", accent: "var(--lp-muted)", icon: FileText },
];

const knownCategoryKeys = new Set(categories.map((category) => category.key));

export function safeCategory(value: string | null | undefined) {
  return value && knownCategoryKeys.has(value) ? value : "other";
}

export function labelize(value: string | null | undefined) {
  if (!value) return "Unknown";
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function documentTitle(doc: DocumentRecord) {
  return doc.title || doc.originalName;
}

export function fieldsObject(doc: DocumentRecord) {
  return doc.fields && typeof doc.fields === "object"
    ? (doc.fields as Record<string, unknown>)
    : {};
}

export function reviewFields(doc: DocumentRecord): ReviewField[] {
  const fields = fieldsObject(doc).reviewFields;
  return Array.isArray(fields) ? (fields as ReviewField[]) : [];
}

export function fieldByKeys(doc: DocumentRecord, keys: string[]) {
  const approvedFields = reviewFields(doc);
  const reviewMatch = approvedFields.find((field) =>
    keys.some((key) => field.key?.toLowerCase().includes(key.toLowerCase())),
  );
  if (reviewMatch?.value) return `${reviewMatch.label}: ${reviewMatch.value}`;

  const fields = fieldsObject(doc);
  for (const key of keys) {
    const value = fields[key];
    if (typeof value === "string" && value.trim()) {
      return `${labelize(key)}: ${value}`;
    }
  }

  return (
    approvedFields.find((field) => field.important)?.value ??
    approvedFields[0]?.value
  );
}

export function expiryValue(doc: DocumentRecord) {
  const fields = fieldsObject(doc);
  const approvedFields = reviewFields(doc);
  const direct = [
    "dateOfExpiry",
    "validTill",
    "validUntil",
    "expiry",
    "endDate",
  ]
    .map((key) => fields[key])
    .find((value): value is string => typeof value === "string" && Boolean(value));
  if (direct) return direct;

  return approvedFields.find((field) =>
    /expiry|valid until|valid till|end date/i.test(field.label),
  )?.value;
}

export function importantDetail(doc: DocumentRecord) {
  const byType = fieldByKeys(doc, [
    "panNumber",
    "aadhaarNumber",
    "aadhaarLast4",
    "passportNumber",
    "licenseNumber",
    "accountNumber",
    "policyNumber",
    "ifsc",
    "amount",
    "date",
  ]);
  return byType ?? sourceLabel(doc);
}

export function sourceLabel(doc: DocumentRecord) {
  if (doc.source === "GOOGLE_DRIVE") return "Google Drive";
  if (doc.source === "GMAIL") return "Gmail";
  if (String(doc.source) === "SCAN" || doc.sourceProvider === "SCAN") return "Scanned";
  return "Manual Upload";
}

export function openUpload() {
  window.dispatchEvent(new CustomEvent("readiness:open-upload"));
}
