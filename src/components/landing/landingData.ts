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
    body: "Link Gmail or Drive, or simply drop files in. Readines reads each one, sorts it into the right place, and builds a living graph of your documents.",
    points: [
      "Auto-classified on upload",
      "Your important document areas",
      "Re-tag anything in one tap",
    ],
  },
  {
    id: "packages",
    label: "Life-event packages",
    icon: Plane,
    head: "Prepare for any event in minutes.",
    body: "Ask for the moment you are preparing for. Readines assembles the exact pack, marks what is ready, flags what is missing, and exports a clean ZIP.",
    points: [
      "Readines score from your real vault",
      "Missing items flagged, not guessed",
      "Download, share, or email the pack",
    ],
  },
  {
    id: "health",
    label: "Healthcare",
    icon: HeartPulse,
    head: "Walk into every appointment ready.",
    body: "Keep every prescription and report on one timeline. Track your own readings. Print a one-page visit summary or carry the whole pack. Readines organizes, never diagnoses.",
    points: [
      "Your records in one place",
      "Self-logged lab trends",
      "One-tap visit pack or printout",
    ],
  },
  {
    id: "ready",
    label: "Readines & reminders",
    icon: BellRing,
    head: "Never get caught off guard.",
    body: "See what is expiring, what is missing a nominee, what is ready to go. Quiet nudges before the deadline, not after it.",
    points: [
      "Expiry tracking across documents",
      "Gaps surfaced automatically",
      "Readines at a glance",
    ],
  },
];
