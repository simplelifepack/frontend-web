import {
  BellRing,
  FolderTree,
  HeartPulse,
  Plane,
  type LucideIcon,
} from "lucide-react";

export type LandingTab = {
  id: string;
  label: string;
  icon: LucideIcon;
  head: string;
  body: string;
  points: string[];
};

export const TABS: LandingTab[] = [
  {
    id: "discover",
    label: "Discover & classify",
    icon: FolderTree,
    head: "Connect once. Everything files itself.",
    body: "Link Gmail, Drive, or DigiLocker, or simply drop files in. ReadiNes reads each one, sorts it into the right place, and builds a living graph of your documents.",
    points: [
      "Auto-classified on upload",
      "Identity, finance, insurance, property, medical",
      "Re-tag anything in one tap",
    ],
  },
  {
    id: "packages",
    label: "Life-event packages",
    icon: Plane,
    head: "Prepare for any event in minutes.",
    body: "Ask for a Schengen visa, a home loan, a job switch. ReadiNes assembles the exact pack, marks what is ready, flags what is missing, and exports a clean ZIP.",
    points: [
      "Readiness score from your real vault",
      "Missing items flagged, not guessed",
      "Download, share, or email the pack",
    ],
  },
  {
    id: "health",
    label: "Healthcare",
    icon: HeartPulse,
    head: "Walk into every appointment ready.",
    body: "Keep every prescription and report on one timeline. Track your own readings. Print a one-page visit summary or carry the whole pack. ReadiNes organizes, never diagnoses.",
    points: [
      "Per-family-member records",
      "Self-logged lab trends",
      "One-tap visit pack or printout",
    ],
  },
  {
    id: "ready",
    label: "Readiness & reminders",
    icon: BellRing,
    head: "Never get caught off guard.",
    body: "See what is expiring, what is missing a nominee, what is ready to go. Quiet nudges before the deadline, not after it.",
    points: [
      "Expiry tracking across documents",
      "Gaps surfaced automatically",
      "Readiness at a glance",
    ],
  },
];
