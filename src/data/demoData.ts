import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Briefcase,
  Car,
  FileText,
  FolderOpen,
  HeartPulse,
  Home as HomeIcon,
  Fingerprint,
  KeyRound,
  Landmark,
  LayoutGrid,
  Plane,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";

import { A } from "@/constants/theme";

export interface Doc {
  id: number;
  name: string;
  docType: string;
  category: string;
  source: string;
  updated: string;
  expiry: string;
}

export const DOCS: Doc[] = [
  { id: 1, name: "Passport", docType: "Passport", category: "Identity", source: "DigiLocker", updated: "Apr 2026", expiry: "2027-03-12" },
  { id: 2, name: "Aadhaar", docType: "Aadhaar", category: "Identity", source: "DigiLocker", updated: "Jan 2026", expiry: "" },
  { id: 3, name: "PAN", docType: "PAN", category: "Identity", source: "DigiLocker", updated: "Jan 2026", expiry: "" },
  { id: 4, name: "Driving licence", docType: "Driver License", category: "Identity", source: "DigiLocker", updated: "Feb 2026", expiry: "2026-11-15" },
  { id: 5, name: "Offer letter", docType: "Offer Letter", category: "Employment", source: "Gmail", updated: "Apr 2026", expiry: "" },
  { id: 6, name: "Payslips, 24 months", docType: "Payslip", category: "Employment", source: "Gmail", updated: "Jun 2026", expiry: "" },
  { id: 7, name: "Form 16, FY25-26", docType: "Form 16", category: "Finance", source: "Gmail", updated: "May 2026", expiry: "" },
  { id: 8, name: "Bank statements", docType: "Bank Statement", category: "Finance", source: "Gmail", updated: "Jun 2026", expiry: "" },
  { id: 9, name: "Investment statement", docType: "Investment Statement", category: "Finance", source: "Drive", updated: "May 2026", expiry: "" },
  { id: 10, name: "Health insurance", docType: "Health Insurance", category: "Insurance", source: "Gmail", updated: "Mar 2026", expiry: "2026-08-30" },
  { id: 11, name: "Life insurance, HDFC", docType: "Life Insurance", category: "Insurance", source: "Gmail", updated: "Mar 2026", expiry: "2049-03-01" },
  { id: 12, name: "Prescriptions", docType: "Prescription", category: "Medical", source: "ABHA", updated: "Mar 2026", expiry: "" },
  { id: 13, name: "Lab reports", docType: "Lab Report", category: "Medical", source: "ABHA", updated: "Mar 2026", expiry: "" },
  { id: 14, name: "Sale deed, Whitefield", docType: "Sale Deed", category: "Property", source: "Upload", updated: "2024", expiry: "" },
  { id: 15, name: "Property tax receipt", docType: "Property Tax Receipt", category: "Property", source: "Upload", updated: "Apr 2026", expiry: "" },
];

export const HAVE = new Set(DOCS.map((doc) => doc.docType));

export interface Category {
  name: string;
  complete: number;
  accent: string;
  icon: LucideIcon;
}

export const CATEGORIES: Category[] = [
  { name: "Identity", complete: 100, accent: A.blue, icon: Fingerprint },
  { name: "Employment", complete: 80, accent: A.purple, icon: Briefcase },
  { name: "Finance", complete: 90, accent: A.gold, icon: Wallet },
  { name: "Insurance", complete: 75, accent: A.teal, icon: ShieldCheck },
  { name: "Property", complete: 70, accent: A.pink, icon: HomeIcon },
  { name: "Medical", complete: 85, accent: A.green, icon: HeartPulse },
];

export interface LifeEvent {
  id: string;
  name: string;
  blurb: string;
  accent: string;
  icon: LucideIcon;
  reqs: string[];
}

export const EVENTS: LifeEvent[] = [
  { id: "visa", name: "Schengen visa", blurb: "Travel pack", accent: A.blue, icon: Plane, reqs: ["Passport", "Payslip", "Bank Statement", "Form 16", "Travel Insurance", "Flight Reservation", "Hotel Booking"] },
  { id: "usvisa", name: "US B1/B2 visa", blurb: "Travel pack", accent: A.blue, icon: Plane, reqs: ["Passport", "Bank Statement", "Form 16", "Payslip", "Travel Insurance", "DS-160 form"] },
  { id: "ukvisa", name: "UK visa", blurb: "Travel pack", accent: A.blue, icon: Plane, reqs: ["Passport", "Bank Statement", "Payslip", "Travel Insurance", "Cover Letter"] },
  { id: "canada", name: "Canada visa", blurb: "Travel pack", accent: A.blue, icon: Plane, reqs: ["Passport", "Bank Statement", "Form 16", "Travel Insurance", "Funds Proof"] },
  { id: "homeloan", name: "Home loan", blurb: "Application pack", accent: A.green, icon: Landmark, reqs: ["PAN", "Aadhaar", "Form 16", "Bank Statement", "Payslip", "Sale Deed", "Property Tax Receipt"] },
  { id: "carloan", name: "Car loan", blurb: "Application pack", accent: A.teal, icon: Car, reqs: ["PAN", "Aadhaar", "Bank Statement", "Payslip", "Driver License", "Down Payment Proof"] },
  { id: "bgv", name: "Background verification", blurb: "Job switch", accent: A.purple, icon: ShieldCheck, reqs: ["Aadhaar", "PAN", "Payslip", "Offer Letter", "Experience Letter"] },
  { id: "hospital", name: "Hospital admission", blurb: "Cashless pack", accent: A.pink, icon: HeartPulse, reqs: ["Aadhaar", "Prescription", "Lab Report", "Health Insurance", "Discharge Summary", "Pre-Authorization"] },
  { id: "tax", name: "Tax filing", blurb: "FY 2025-26", accent: A.gold, icon: FileText, reqs: ["PAN", "Aadhaar", "Form 16", "Bank Statement", "Investment Statement", "Capital Gains Statement"] },
  { id: "property", name: "Property sale", blurb: "Resale pack", accent: A.pink, icon: HomeIcon, reqs: ["Sale Deed", "Property Tax Receipt", "PAN", "Aadhaar", "Encumbrance Certificate"] },
  { id: "passport", name: "Passport renewal", blurb: "Tatkal ready", accent: A.blue, icon: BookOpen, reqs: ["Passport", "Aadhaar", "PAN"] },
];

export interface EvalRow {
  label: string;
  have: boolean;
}

export interface EvalResult {
  rows: EvalRow[];
  score: number;
  haveCount: number;
}

export interface Asset {
  name: string;
  type: string;
  value: number;
  cls: "asset" | "liability";
  nominee: boolean;
}

export const WEALTH: Asset[] = [
  { name: "HDFC term cover", type: "Insurance", value: 10000000, cls: "asset", nominee: true },
  { name: "SBI ULIP Smart Wealth", type: "Insurance", value: 850000, cls: "asset", nominee: false },
  { name: "Parag Parikh Flexi Cap", type: "Mutual fund", value: 1240000, cls: "asset", nominee: true },
  { name: "Nippon Small Cap", type: "Mutual fund", value: 560000, cls: "asset", nominee: false },
  { name: "EPF corpus", type: "Pension", value: 1850000, cls: "asset", nominee: true },
  { name: "HDFC home loan", type: "Liability", value: 4200000, cls: "liability", nominee: false },
];

export interface NavItem {
  key: WorkspaceRoute;
  label: string;
  icon: LucideIcon;
}

export type WorkspaceRoute =
  | "home"
  | "packages"
  | "documents"
  | "health"
  | "family"
  | "wealth"
  | "legacy"
  | "trust";

export const NAV: NavItem[] = [
  { key: "home", label: "Home", icon: LayoutGrid },
  { key: "packages", label: "Packages", icon: Plane },
  { key: "documents", label: "Documents", icon: FolderOpen },
  { key: "health", label: "Health", icon: HeartPulse },
  { key: "family", label: "Family", icon: Users },
  { key: "wealth", label: "Wealth", icon: Wallet },
  { key: "legacy", label: "Legacy handoff", icon: KeyRound },
  { key: "trust", label: "Trust center", icon: ShieldCheck },
];

const NOW = new Date("2026-06-21");

export function money(value: number): string {
  return "\u20B9" + Math.abs(value).toLocaleString("en-IN");
}

export function daysUntil(date: string): number {
  return Math.ceil((new Date(date).getTime() - NOW.getTime()) / 86400000);
}

export function evalEvent(event: LifeEvent): EvalResult {
  const rows: EvalRow[] = event.reqs.map((label) => ({ label, have: HAVE.has(label) }));
  const haveCount = rows.filter((row) => row.have).length;

  return {
    rows,
    score: Math.round((haveCount / rows.length) * 100),
    haveCount,
  };
}
