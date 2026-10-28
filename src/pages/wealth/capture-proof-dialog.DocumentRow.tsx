import { Text, Input, Button } from "@/design-system";
import { type ReactNode } from "react";
import { X } from "lucide-react";
import { type DocumentRecord } from "@/lib/api";
import { categories, documentTitle, fieldsObject, labelize } from "@/pages/documents/document-utils";
import { css, labelStyle, inputStyle } from "./capture-proof-dialog.Mode";


export function DocumentRow({
  doc,
  fallbackOwner,
  onClick,
  selected,
}: {
  doc: DocumentRecord;
  fallbackOwner?: string;
  onClick: () => void;
  selected?: boolean;
}) {
  const meta = categoryMeta(doc.category);
  const Icon = meta.icon;
  const owner = doc.owner || fallbackOwner || "You";
  return (
    <button
      type="button"
      className={`lp-vault-doc-row ${selected ? "selected" : ""}`}
      onClick={onClick}
    >
      <span
        className="lp-vault-icon"
        style={{
          color: meta.accent,
        }}
      >
        <Icon aria-hidden="true" focusable="false" size="var(--icon-regular)" />
      </span>
      <span>
        <b>{documentTitle(doc)}</b>
        <small>
          {owner} · {labelize(doc.category)}
        </small>
      </span>
    </button>
  );
}


export function categoryMeta(category: string) {
  return (
    categories.find(
      (item) =>
        item.name.toLowerCase() === category.toLowerCase() ||
        item.key === category.toLowerCase(),
    ) ?? categories[categories.length - 1]!
  );
}


export function isWealthEvidenceDocument(doc: DocumentRecord) {
  const haystack = [
    doc.category,
    doc.documentType,
    doc.normalizedType,
    doc.title,
    doc.originalName,
    JSON.stringify(fieldsObject(doc)),
  ]
    .join(" ")
    .toLowerCase();
  return [
    "finance",
    "insurance",
    "bank",
    "investment",
    "itr",
    "tax",
    "transaction",
    "property",
    "deed",
    "loan",
    "liability",
    "policy",
    "statement",
    "payment",
    "receipt",
  ].some((word) => haystack.includes(word));
}


export function amountFromDocument(doc: DocumentRecord) {
  const fields = fieldsObject(doc);
  const found = ["amount", "value", "coverageAmount", "principalAmount"]
    .map((key) => fields[key])
    .find((value) => typeof value === "string" || typeof value === "number");
  return found ? String(found).replace(/[^\d.]/g, "") : "";
}


export function normalizeAmount(value: string) {
  const normalized = value.trim().replace(/[^\d.]/g, "");
  if (!normalized) return "";
  const [whole, ...rest] = normalized.split(".");
  return rest.length ? `${whole}.${rest.join("").slice(0, 2)}` : whole;
}


export function Head({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div
      className="lp-wealth-modal-head"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "var(--space-s16)",
      }}
    >
      <Text as="b" size="lg" weight="semibold" style={{ color: css.heading }}>{title}</Text>
      <Button size="sm" iconOnly variant="tertiary" type="button" aria-label="Close"
        onClick={onClose}
      >
        <X aria-hidden="true" focusable="false" size="var(--icon-small)" />
      </Button>
    </div>
  );
}


export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ flex: 1, marginTop: "var(--space-s12)" }}>
      <Text as="label" size="md" style={labelStyle()}>{label}</Text>
      {children}
    </div>
  );
}


export function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div style={{ marginTop: "var(--space-s12)" }}>
      <Text as="label" size="md" style={labelStyle()}>{label}</Text>
      <Input
        type="date"
        style={inputStyle()}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
