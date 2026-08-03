import type { CSSProperties } from "react";

export const T = {
  navy: "#0B1220",
  panel: "#131C2E",
  raised: "#1B2740",
  border: "#27324A",
  gold: "#D9B86A",
  goldBright: "#ECCB82",
  mint: "#4FCB95",
  coral: "#E8736A",
  white: "#FFFFFF",
  text: "#E6EBF5",
  muted: "#8A97AE",
  faint: "#5C6B80",
} as const;

export const A = {
  blue: "#5B8DEF",
  purple: "#9B7BE8",
  teal: "#3FB9C7",
  pink: "#E86A9B",
  green: "#4FCB95",
  gold: "#D9B86A",
} as const;

export type Tone = "ready" | "warn" | "wax" | "flat";

export const btnGold: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  background: T.gold,
  color: "#10182A",
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
  border: "1px solid rgba(232,115,106,0.4)",
  borderRadius: 10,
  padding: "10px 15px",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};
