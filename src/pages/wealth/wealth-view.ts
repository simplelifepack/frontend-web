import type { WealthRecord, WealthRecordPayload, WealthRecordType } from "@/lib/api";
import { convertStoredMoney, formatStoredMoney, getStoredHomeCurrency, normalizeHomeCurrency } from "@/lib/preferences-storage";

export const typeLabels: Record<WealthRecordType, string> = {
  ASSET: "Asset",
  LOAN_TAKEN: "Loan Taken",
  LOAN_GIVEN: "Loan Given",
  INSURANCE: "Insurance",
  PAYMENT_PROOF: "Payment / Financial Proof",
};

export const typeOptions = Object.keys(typeLabels) as WealthRecordType[];

function isMoneyLentBorrowed(record: WealthRecord) {
  return record.details.recordKind === "money_lent_borrowed";
}

export type WealthRecordDomain = "asset" | "liability" | "protection" | "lentBorrowed";

const assetTypes = new Set([
  "account",
  "bank_account",
  "savings_account",
  "fixed_deposit",
  "fd",
  "investment",
  "investment_account",
  "mutual_fund",
  "stocks",
  "retirement",
  "nps",
  "pf",
  "epf",
  "ppf",
  "property",
  "gold",
  "bank_locker",
  "vehicle",
]);

const liabilityTypes = new Set([
  "loan",
  "personal_loan",
  "home_loan",
  "mortgage",
  "auto_loan",
  "vehicle_loan",
  "education_loan",
  "business_loan",
]);

const insuranceTypes = new Set([
  "insurance",
  "life_insurance",
  "health_insurance",
  "vehicle_insurance",
  "property_insurance",
  "crop_insurance",
]);

const proofTypes = new Set([
  "payment_proof",
  "receipt",
  "bank_transfer",
  "upi_payment",
  "cash_payment",
  "tax_payment",
]);

function token(value: unknown) {
  return typeof value === "string"
    ? value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")
    : "";
}

function firstToken(...values: unknown[]) {
  return values.map(token).find(Boolean) ?? "";
}

export function classifyWealthRecord(record: WealthRecord): WealthRecordDomain {
  if (isMoneyLentBorrowed(record)) {
    return "lentBorrowed";
  }

  const category = firstToken(record.details.categoryCode, record.details.category, record.details.kind);
  if (category === "asset" || category === "holding" || category === "accounts" || category === "accounts_and_investments" || category === "accounts_investments") return "asset";
  if (category === "loan" || category === "loans" || category === "liability" || category === "liabilities") return "liability";
  if (category === "insurance" || category === "policy" || category === "policies" || category === "cover" || category === "protection") return "protection";
  if (category === "payment_proof" || category === "proof") return "lentBorrowed";

  const subtype = firstToken(
    record.details.assetType,
    record.details.loanType,
    record.details.insuranceType,
    record.details.subtypeCode,
    record.details.subtype,
    record.details.type,
  );
  if (assetTypes.has(subtype)) return "asset";
  if (liabilityTypes.has(subtype)) return "liability";
  if (insuranceTypes.has(subtype)) return "protection";
  if (proofTypes.has(subtype)) return "lentBorrowed";

  if (record.type === "ASSET") return "asset";
  if (record.type === "LOAN_TAKEN") return "liability";
  if (record.type === "INSURANCE") return "protection";
  return "lentBorrowed";
}

export function money(value: number, currency = getStoredHomeCurrency()) {
  return formatStoredMoney(value, currency);
}

export function numberValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return 0;
  const normalized = value.replace(/[^0-9.-]/g, "");
  return normalized ? Number(normalized) || 0 : 0;
}

export function recordAmount(record: WealthRecord) {
  const details = record.details;
  const domain = classifyWealthRecord(record);
  if (domain === "asset") return numberValue(details.value ?? details.amount ?? details.marketValue);
  if (domain === "protection") return numberValue(details.coverageAmount ?? details.sumAssured ?? details.premium ?? details.amount);
  if (domain === "lentBorrowed") return numberValue(details.amount ?? details.principalAmount);
  return calculateLoanBreakdown(record)?.outstanding ?? numberValue(details.principalAmount ?? details.amount);
}

export function recordCurrency(record: WealthRecord) {
  return normalizeHomeCurrency(record.details.currency);
}

export function recordMoney(record: WealthRecord, value: number) {
  return formatStoredMoney(value, recordCurrency(record));
}

export function recordHomeAmount(record: WealthRecord, currency = getStoredHomeCurrency()) {
  return convertStoredMoney(recordAmount(record), recordCurrency(record), currency);
}

export function payloadFromRecord(record: WealthRecord, patch: Partial<WealthRecordPayload> = {}): WealthRecordPayload {
  return {
    type: patch.type ?? record.type,
    title: patch.title ?? record.title,
    details: patch.details ?? record.details,
    notes: patch.notes ?? record.notes ?? "",
    followUpDate: patch.followUpDate ?? record.followUpDate ?? null,
    followUpNote: patch.followUpNote ?? record.followUpNote ?? "",
    attachmentDocumentIds: patch.attachmentDocumentIds ?? record.attachmentDocumentIds ?? record.attachments.map((item) => item.documentId),
  };
}

export function formatShortDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export function followUpText(value: string) {
  const today = new Date();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  const days = Math.round((date.getTime() - today.getTime()) / 86400000);
  if (days < 0) return `follow-up overdue by ${Math.abs(days)}d`;
  if (days === 0) return "follow up today";
  return `follow up in ${days}d`;
}

export function calculateLoanBreakdown(record: WealthRecord) {
  if (record.type !== "LOAN_TAKEN" && record.type !== "LOAN_GIVEN") return null;
  const details = record.details;
  const principal = numberValue(details.principalAmount ?? details.amount);
  const rate = numberValue(details.interestRate) / 100;
  const durationMonths = numberValue(details.durationMonths);
  const startMonths = typeof details.startDate === "string" && details.startDate
    ? Math.max(0, (new Date().getFullYear() - new Date(details.startDate).getFullYear()) * 12 + new Date().getMonth() - new Date(details.startDate).getMonth())
    : 0;
  const frequency = details.interestFrequency === "yearly" ? "yearly" : "monthly";
  const months = durationMonths || startMonths || (rate > 0 ? 12 : 0);
  const periods = frequency === "monthly" ? months : months / 12;
  const calculation = String(details.interestCalculationType ?? "simple");
  const payments = numberValue(details.paymentsMade);
  const interest =
    calculation === "compound" ? principal * ((1 + rate) ** periods - 1) :
    calculation === "flat" ? principal * rate * Math.max(1, periods) :
    calculation === "no-interest" ? 0 :
    principal * rate * periods;
  const totalPayable = principal + Math.max(0, interest);
  return {
    principal,
    interest: Math.round(Math.max(0, interest)),
    payments,
    outstanding: Math.max(0, Math.round(totalPayable - payments)),
    monthsElapsed: months,
    calculationType: calculation,
  };
}

export function recordSubtitle(record: WealthRecord) {
  const details = record.details;
  if (isMoneyLentBorrowed(record)) {
    const way = details.direction === "BORROWED" ? "You borrowed" : "You lent";
    const person = details.who || details.party;
    const date = details.transactionDate || details.date;
    return [way, person, date].filter(Boolean).map(String).slice(0, 3).join(" · ");
  }
  const bits = [
    details.assetType,
    details.provider,
    details.party,
    details.paidTo,
    details.location,
    details.policyNumber,
  ].filter(Boolean).map(String);
  return bits.length ? bits.slice(0, 2).join(" · ") : typeLabels[record.type];
}

export function statusFor(record: WealthRecord) {
  const proofOptional = isMoneyLentBorrowed(record) && record.details.proofStatus === "cash_no_record";
  return {
    document: proofOptional || record.attachments.length > 0,
    nominee: Boolean(record.details.nominee),
    access: isMoneyLentBorrowed(record) || Boolean(record.details.accessInstruction || record.notes),
  };
}

export function dashboardStats(records: WealthRecord[], currency = getStoredHomeCurrency()) {
  const assets = records.filter((record) => classifyWealthRecord(record) === "asset");
  const liabilities = records.filter((record) => classifyWealthRecord(record) === "liability");
  const protection = records.filter((record) => classifyWealthRecord(record) === "protection");
  const lentBorrowed = records.filter((record) => classifyWealthRecord(record) === "lentBorrowed");
  const documented = records.filter((record) => record.attachments.length > 0).length;
  const accessReady = records.filter((record) => statusFor(record).access).length;
  const readiness = records.length ? Math.round(((documented + accessReady) / (records.length * 2)) * 100) : 0;
  return {
    assets,
    liabilities,
    protection,
    lentBorrowed,
    assetTotal: assets.reduce((total, record) => total + recordHomeAmount(record, currency), 0),
    liabilityTotal: liabilities.reduce((total, record) => total + recordHomeAmount(record, currency), 0),
    protectionTotal: protection.reduce((total, record) => total + recordHomeAmount(record, currency), 0),
    readiness,
    accessMissing: records.length - accessReady,
  };
}

export function attentionRows(records: WealthRecord[]) {
  return records.flatMap((record) => {
    const status = statusFor(record);
    const domain = classifyWealthRecord(record);
    if (!status.document) return [{ record, severity: domain === "asset" || domain === "liability" ? "CRITICAL" : "IMPORTANT", reason: "no document on file", action: "Attach" }];
    if (!status.access) return [{ record, severity: "CRITICAL", reason: "no access instructions", action: "Add note" }];
    if (record.followUpDate) return [{ record, severity: "INFO", reason: `follow up on ${new Date(record.followUpDate).toLocaleDateString()}`, action: "Review" }];
    return [];
  }).slice(0, 6);
}
