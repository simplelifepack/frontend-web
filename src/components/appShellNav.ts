import {
  FolderOpen,
  HeartPulse,
  LayoutGrid,
  Plane,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import type { WorkspaceRoute } from "@/data/demoData";

export const ROUTE_PATHS: Record<WorkspaceRoute, string> = {
  home: "/home",
  packages: "/packages",
  documents: "/documents",
  health: "/health",
  family: "/family",
  wealth: "/wealth",
  legacy: "/legacy",
  trust: "/trust",
};

export const SHELL_NAV = [
  { key: "home", label: "Home", icon: LayoutGrid },
  { key: "documents", label: "Documents", icon: FolderOpen },
  { key: "packages", label: "Packages", icon: Plane },
  { key: "health", label: "Health", icon: HeartPulse },
  { key: "wealth", label: "Wealth", icon: Wallet },
  { key: "trust", label: "Trust center", icon: ShieldCheck },
] as const;

export function routeFromPath(pathname: string): WorkspaceRoute {
  if (pathname.startsWith("/documents")) return "documents";
  const match = Object.entries(ROUTE_PATHS).find(([, path]) => path === pathname);
  return (match?.[0] as WorkspaceRoute | undefined) ?? "home";
}
