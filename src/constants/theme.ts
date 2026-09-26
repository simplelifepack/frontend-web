import type { CSSProperties } from "react";

export const T = {
  navy: "var(--lp-navy)",
  panel: "var(--lp-panel)",
  raised: "var(--lp-raised)",
  border: "var(--lp-border)",
  action: "var(--lp-action)",
  actionHover: "var(--lp-action-hover)",
  actionText: "var(--lp-action-text)",
  readiness: "var(--lp-readiness)",
  readinessBright: "var(--lp-readiness-bright)",
  readinessSoft: "var(--lp-readiness-soft)",
  readinessBorder: "var(--lp-readiness-border)",
  warning: "var(--lp-warning)",
  warningSoft: "var(--lp-warning-soft)",
  warningBorder: "var(--lp-warning-border)",
  mint: "var(--lp-mint)",
  coral: "var(--lp-coral)",
  info: "var(--lp-info)",
  purple: "var(--lp-purple)",
  pink: "var(--lp-pink)",
  teal: "var(--lp-teal)",
  white: "var(--lp-heading)",
  text: "var(--lp-text)",
  muted: "var(--lp-muted)",
  faint: "var(--lp-faint)",
  coralSoft: "var(--lp-coral-soft)",
  coralBorder: "var(--lp-coral-border)",
} as const;

export const A = {
  blue: "var(--lp-info)",
  purple: "var(--lp-purple)",
  teal: "var(--lp-teal)",
  pink: "var(--lp-pink)",
  green: "var(--lp-mint)",
  readiness: "var(--lp-readiness)",
} as const;

export type Tone = "ready" | "warn" | "wax" | "flat";

export const btnPrimary: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  background: T.action,
  color: T.actionText,
  border: "none",
  borderRadius: 10,
  padding: "10px 15px",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};

export const btnGhost: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  background: T.raised,
  color: T.text,
  border: `1px solid ${T.border}`,
  borderRadius: 10,
  padding: "10px 15px",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

export const btnDanger: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  background: "transparent",
  color: T.coral,
  border: "1px solid var(--lp-coral-border)",
  borderRadius: 10,
  padding: "10px 15px",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};
