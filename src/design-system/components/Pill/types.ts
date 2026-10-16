import type { ReactNode } from "react";
export type PillTone = "ready" | "warn" | "wax" | "flat";
export interface PillProps {
  children: ReactNode;
  tone: PillTone;
}
