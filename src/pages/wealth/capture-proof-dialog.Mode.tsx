import { ModalPanel, ModalBackdrop } from "@/design-system";
import { type CSSProperties, type ReactNode } from "react";
import { type DocumentRecord, type WealthRecord } from "@/lib/api";
import { fieldsObject } from "@/pages/documents/document-utils";
import { classifyWealthRecord, recordAmount } from "./wealth-view";
import { ProofModal, HoldingModal } from "./capture-proof-dialog.HoldingModal";
import { MoneyLentBorrowedModal } from "./capture-proof-dialog.MoneyLentBorrowedModal";


export type Mode = "asset" | "proof" | "money";

export type Props = {
  mode?: Mode;
  initialCategoryCode?: string;
  title?: string;
  onClose: () => void;
  onSaved: (record: WealthRecord) => void;
};


export const currencies = ["INR", "USD", "EUR", "GBP", "AED", "SGD"];

export const holdingTypeSuggestions = {
  asset: [
    "Savings account",
    "Current account",
    "Fixed deposit",
    "Mutual funds",
    "Stocks",
    "Bonds",
    "Retirement / NPS",
    "EPF / PF",
    "PPF",
    "Property",
    "Gold",
    "Crypto",
    "Business ownership",
    "Other",
  ],
  liability: [
    "Home loan / Mortgage",
    "Car loan",
    "Personal loan",
    "Education loan",
    "Credit card",
    "Business loan",
    "Loan against property",
    "Other",
  ],
  cover: [
    "Life insurance",
    "Health insurance",
    "Vehicle insurance",
    "Home / Property insurance",
    "Personal accident insurance",
    "Travel insurance",
    "Other",
  ],
} as const;

export const today = () => new Date().toISOString().slice(0, 10);

export const css = {
  panel: "var(--lp-panel)",
  raised: "var(--lp-raised)",
  border: "var(--lp-border)",
  text: "var(--lp-text)",
  muted: "var(--lp-muted)",
  heading: "var(--lp-heading)",
  action: "var(--lp-action)",
  coral: "var(--lp-coral)",
  mint: "var(--lp-mint)",
};


export function inputStyle(): CSSProperties {
  return { width: "100%" };
}


export function labelStyle(): CSSProperties {
  return { display: "block", marginBottom: 5, color: css.muted, fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: 0.5, textTransform: "uppercase", fontVariantNumeric: "tabular-nums" };
}


export function Modal({
  children,
  onClose,
  danger,
  className = "",
}: {
  children: ReactNode;
  onClose: () => void;
  danger?: boolean;
  className?: string;
}) {
  return (
    <ModalBackdrop

      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: "var(--layer-overlay)", display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <ModalPanel onDismiss={onClose}
        className={`lp-wealth-ref-modal ${className}`}
        onClick={(event) => event.stopPropagation()}
        style={{ width: "min(500px,100%)", maxHeight: "92vh", overflowY: "auto" }}
      >
        <div className="lp-sheet-grab lp-grabonly" />
        {children}
      </ModalPanel>
    </ModalBackdrop>
  );
}


export function CaptureProofDialog({
  mode,
  initialCategoryCode,
  title,
  onClose,
  onSaved,
}: Props) {
  const resolved: Mode =
    mode ?? (initialCategoryCode === "payment_proof" ? "proof" : "asset");
  if (resolved === "money")
    return <MoneyLentBorrowedModal onClose={onClose} onSaved={onSaved} />;
  return resolved === "proof" ? (
    <ProofModal onClose={onClose} onSaved={onSaved} />
  ) : (
    <HoldingModal title={title} onClose={onClose} onSaved={onSaved} />
  );
}


export function text(value: unknown) {
  return value == null ? "" : String(value);
}


export function holdingKind(record?: WealthRecord) {
  if (!record) return "asset";
  const domain = classifyWealthRecord(record);
  if (domain === "liability") return "liability";
  if (domain === "protection") return "cover";
  return "asset";
}


export function initialHoldingState(record?: WealthRecord) {
  const details = record?.details ?? {};
  const kind = holdingKind(record);
  return {
    name: record?.title ?? "",
    kind,
    type: text(
      details.assetType ||
        details.loanType ||
        details.insuranceType ||
        details.type,
    ),
    institution: text(
      details.institution ||
        details.provider ||
        details.party ||
        details.location,
    ),
    accountRef: text(
      details.accountRef ||
        details.referenceNumber ||
        details.reference ||
        details.policyNumber ||
        details.loanAccountNumber,
    ),
    value: record ? String(recordAmount(record) || "") : "",
    currency: text(details.currency) || "INR",
    memberId: text(details.memberId) || "you",
    renewalDate: text(details.renewalDate),
    maturityDate: text(details.maturityDate),
    accessNote: text(details.accessInstruction || record?.notes),
    nominee: Boolean(details.nominee),
    nomineeName: text(
      details.nomineeName ||
        (typeof details.nominee === "string" ? details.nominee : ""),
    ),
  };
}


export function valueFromDocumentFields(doc: DocumentRecord, keys: string[]) {
  const fields = fieldsObject(doc);
  for (const key of keys) {
    const value = fields[key];
    if (
      (typeof value === "string" && value.trim()) ||
      typeof value === "number"
    ) {
      return String(value);
    }
  }
  const reviewFields = Array.isArray(fields.reviewFields)
    ? (fields.reviewFields as Array<{
        key?: string;
        label?: string;
        value?: unknown;
      }>)
    : [];
  const match = reviewFields.find((field) =>
    keys.some((key) =>
      `${field.key ?? ""} ${field.label ?? ""}`
        .toLowerCase()
        .includes(key.toLowerCase()),
    ),
  );
  return match?.value == null || match.value === "" ? "" : String(match.value);
}


export function kindFromDocument(doc: DocumentRecord) {
  const category = `${doc.category} ${doc.documentType}`.toLowerCase();
  if (/insurance|policy|cover/.test(category)) return "cover";
  if (/loan|mortgage|liability|credit/.test(category)) return "liability";
  return "asset";
}


export function typeFromDocument(doc: DocumentRecord, kind: string) {
  const docType = doc.documentType?.trim();
  if (docType && !/^unknown$/i.test(docType)) return docType;
  if (kind === "cover") return "Insurance";
  if (kind === "liability") return "Loan";
  if (/property/i.test(doc.category)) return "Property";
  return "Bank account";
}
