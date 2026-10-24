import { A, T } from "@/constants/theme";
import {
  Bell,
  Clock,
  FolderOpen,
  ShieldCheck,
  Plane,
  Wallet,
  Users,
  HeartPulse,
} from "lucide-react";
export function homeCards(
  documentCount: number,
  readiness: number,
  expiringCount: number,
  attentionCount: number,
  attentionRoute?: string,
) {
  const stats = [
    {
      label: "Documents",
      value: documentCount,
      icon: FolderOpen,
      color: A.blue,
      route: "/documents",
    },
    {
      label: "Overall readiness",
      value: `${readiness}%`,
      icon: ShieldCheck,
      color: A.green,
      route: "/packages",
    },
    {
      label: "Expiring < 60d",
      value: expiringCount,
      icon: Clock,
      color: T.warning,
      route: "/documents",
    },
    {
      label: "Needs attention",
      value: attentionCount,
      icon: Bell,
      color: A.pink,
      route: attentionRoute ?? "/documents",
    },
  ];
  const insights = [
    {
      icons: [FolderOpen, Plane],
      text: `${documentCount} records are available across your document vault and readiness packages.`,
      route: "/packages",
      tone: A.green,
    },
    {
      icons: [Wallet, ShieldCheck],
      text: expiringCount
        ? `${expiringCount} record${expiringCount === 1 ? "" : "s"} need renewal attention before they affect a package.`
        : "No saved documents currently expire within the next 60 days.",
      route: "/wealth",
      tone: expiringCount ? T.warning : T.mint,
    },
    {
      icons: [Users, HeartPulse],
      text: "Family access, emergency health details, and the wealth handoff stay connected in one protected archive.",
      route: "/trust",
      tone: A.blue,
    },
  ];
  return { stats, insights };
}

export function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
