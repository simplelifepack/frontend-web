import { useEffect, useState } from "react";

import { colors } from "../../variables";

import type { RingProps } from "./types";
import { Frame, Graphic, Progress, Value } from "./styles";

export function Ring({ score, size = 64, color }: RingProps) {
  const value = Number.isFinite(score)
    ? Math.min(100, Math.max(0, Math.round(score)))
    : 0;
  const stroke = size >= 56 ? 5 : 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - (value / 100) * circumference;
  const strokeColor =
    color ??
    (value >= 80 ? colors.mint : value >= 40 ? colors.readiness : colors.coral);
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setOffset(targetOffset));
    return () => cancelAnimationFrame(frame);
  }, [targetOffset]);

  return (
    <Frame $size={size} role="img" aria-label={`Readiness ${value}%`}>
      <Graphic aria-hidden="true" focusable="false" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.raised}
          strokeWidth={stroke}
        />
        <Progress
          data-testid="readiness-ring-progress"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </Graphic>
      <Value $large={size >= 56}>{value}</Value>
    </Frame>
  );
}
