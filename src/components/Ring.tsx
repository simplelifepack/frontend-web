import { useEffect, useState } from "react";

import { T } from "@/constants/theme";

type RingProps = {
  score: number;
  size?: number;
  color?: string;
};

export default function Ring({ score, size = 64, color }: RingProps) {
  const value = Number.isFinite(score) ? Math.min(100, Math.max(0, Math.round(score))) : 0;
  const stroke = size >= 56 ? 5 : 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - (value / 100) * circumference;
  const strokeColor = color ?? (value >= 80 ? T.mint : value >= 40 ? T.readiness : T.coral);
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setOffset(targetOffset));
    return () => cancelAnimationFrame(frame);
  }, [targetOffset]);

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={T.raised} strokeWidth={stroke} />
        <circle
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
          style={{ transition: "stroke-dashoffset 700ms cubic-bezier(.22,.9,.3,1)" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          color: T.white,
          fontFamily: "ui-monospace, monospace",
          fontSize: size >= 56 ? 15 : 12,
          fontVariantNumeric: "tabular-nums",
          fontWeight: 700,
        }}
      >
        {value}
      </div>
    </div>
  );
}
