export type WorkspaceRoute =
  | "home"
  | "packages"
  | "documents"
  | "health"
  | "family"
  | "wealth"
  | "legacy"
  | "trust";

const NOW = new Date("2026-06-21");

export function daysUntil(date: string): number {
  return Math.ceil((new Date(date).getTime() - NOW.getTime()) / 86400000);
}
