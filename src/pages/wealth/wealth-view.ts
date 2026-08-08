import type { WealthRecord, WealthRecordType } from "@/lib/api";

export const typeLabels: Record<WealthRecordType, string> = {
  ASSET: "Asset",
  LOAN_TAKEN: "Loan Taken",
  LOAN_GIVEN: "Loan Given",
  INSURANCE: "Insurance",
  PAYMENT_PROOF: "Payment / Financial Proof",
};

export const typeOptions = Object.keys(typeLabels) as WealthRecordType[];

export function money(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

export function numberValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return 0;
  const normalized = value.replace(/[^0-9.-]/g, "");
  return normalized ? Number(normalized) || 0 : 0;
}

export function recordAmount(record: WealthRecord) {
  const details = record.details;
  if (record.type === "ASSET") return numberValue(details.value ?? details.amount ?? details.marketValue);
  if (record.type === "INSURANCE") return numberValue(details.coverageAmount ?? details.sumAssured ?? details.premium);
  if (record.type === "PAYMENT_PROOF") return numberValue(details.amount);
  return calculateLoanBreakdown(record)?.outstanding ?? numberValue(details.principalAmount ?? details.amount);
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
  return {
    document: record.attachments.length > 0,
    nominee: Boolean(record.details.nominee),
    access: Boolean(record.details.accessInstruction || record.notes),
  };
}

export function dashboardStats(records: WealthRecord[]) {
  const assets = records.filter((record) => record.type === "ASSET");
  const liabilities = records.filter((record) => record.type === "LOAN_TAKEN");
  const protection = records.filter((record) => record.type === "INSURANCE");
  const documented = records.filter((record) => record.attachments.length > 0).length;
  const accessReady = records.filter((record) => statusFor(record).access).length;
  const readiness = records.length ? Math.round(((documented + accessReady) / (records.length * 2)) * 100) : 0;
  return {
    assets,
    liabilities,
    protection,
    proofs: records.filter((record) => record.type === "PAYMENT_PROOF"),
    assetTotal: assets.reduce((total, record) => total + recordAmount(record), 0),
    liabilityTotal: liabilities.reduce((total, record) => total + recordAmount(record), 0),
    protectionTotal: protection.reduce((total, record) => total + recordAmount(record), 0),
    readiness,
    accessMissing: records.length - accessReady,
  };
}

export function attentionRows(records: WealthRecord[]) {
  return records.flatMap((record) => {
    const status = statusFor(record);
    if (!status.document) return [{ record, severity: record.type === "ASSET" || record.type === "LOAN_TAKEN" ? "CRITICAL" : "IMPORTANT", reason: "no document on file", action: "Attach" }];
    if (!status.access) return [{ record, severity: "CRITICAL", reason: "no access instructions", action: "Add note" }];
    if (record.followUpDate) return [{ record, severity: "INFO", reason: `follow up on ${new Date(record.followUpDate).toLocaleDateString()}`, action: "Review" }];
    return [];
  }).slice(0, 6);
}
