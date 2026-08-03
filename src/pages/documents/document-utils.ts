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
  { key: "identity", name: "Identity", accent: "#5B8DEF", icon: Fingerprint },
  { key: "employment", name: "Employment", accent: "#9B7BE8", icon: Briefcase },
  { key: "finance", name: "Finance", accent: "#D9B86A", icon: Wallet },
  { key: "insurance", name: "Insurance", accent: "#3FB9C7", icon: ShieldCheck },
  { key: "property", name: "Property", accent: "#E86A9B", icon: Home },
  { key: "medical", name: "Medical", accent: "#4FCB95", icon: HeartPulse },
  { key: "education", name: "Education", accent: "#8B5CF6", icon: BookOpen },
  { key: "travel", name: "Travel", accent: "#60A5FA", icon: Plane },
  { key: "vehicle", name: "Vehicle", accent: "#34D399", icon: Car },
  { key: "legal", name: "Legal", accent: "#F472B6", icon: Gavel },
  { key: "photo", name: "Photo", accent: "#F59E0B", icon: ImageIcon },
  { key: "other", name: "Other", accent: "#94A3B8", icon: FileText },
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
  return "Manual Upload";
}

export function openUpload() {
  window.dispatchEvent(new CustomEvent("lifepack:open-upload"));
}
