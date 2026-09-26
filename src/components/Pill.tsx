import type { ReactNode } from "react";

import { T, type Tone } from "@/constants/theme";

type PillProps = {
  children: ReactNode;
  tone: Tone;
};

export default function Pill({ children, tone }: PillProps) {
  const map: Record<Tone, { bg: string; fg: string }> = {
    ready: { bg: "color-mix(in srgb, var(--lp-mint) 14%, transparent)", fg: T.mint },
    warn: { bg: T.warningSoft, fg: T.warning },
    wax: { bg: T.coralSoft, fg: T.coral },
    flat: { bg: "color-mix(in srgb, var(--lp-muted) 12%, transparent)", fg: T.muted },
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
