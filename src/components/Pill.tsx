import type { ReactNode } from "react";

import { T, type Tone } from "@/constants/theme";

type PillProps = {
  children: ReactNode;
  tone: Tone;
};

export default function Pill({ children, tone }: PillProps) {
  const map: Record<Tone, { bg: string; fg: string }> = {
    ready: { bg: "rgba(79,203,149,0.14)", fg: T.mint },
    warn: { bg: "rgba(217,184,106,0.14)", fg: T.gold },
    wax: { bg: "rgba(232,115,106,0.16)", fg: T.coral },
    flat: { bg: "rgba(147,160,181,0.12)", fg: T.muted },
  };

  const colors = map[tone];

  return (
    <span
      style={{
        background: colors.bg,
        color: colors.fg,
        display: "inline-flex",
        alignItems: "center",
        minHeight: 21,
        fontFamily: "ui-monospace, monospace",
        fontSize: 11,
        fontWeight: 700,
        lineHeight: "15px",
        padding: "3px 9px",
        borderRadius: 999,
        letterSpacing: 0,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}
