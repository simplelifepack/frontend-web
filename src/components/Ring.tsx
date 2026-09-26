import { T } from "@/constants/theme";

type RingProps = {
  score: number;
  size?: number;
  color?: string;
};

export default function Ring({ score, size = 64, color }: RingProps) {
  const stroke = size > 52 ? 6 : 5;
  const radius = (size - stroke * 2) / 2 - 2;
  const value = Number.isFinite(score) ? Math.min(100, Math.max(0, Math.round(score))) : 0;
  const strokeColor = color ?? (value >= 100 ? T.mint : value >= 70 ? T.readiness : T.coral);
  const center = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={center} cy={center} r={radius} fill="none" stroke={T.border} strokeWidth={stroke} />
      <circle
        data-testid="readiness-ring-progress"
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={strokeColor}
        strokeWidth={stroke}
        strokeLinecap="round"
        pathLength="100"
        strokeDasharray={`${value} 100`}
        transform={`rotate(-90 ${center} ${center})`}
      />
      <text
        x={center}
        y={center + size * 0.08}
        textAnchor="middle"
        fontFamily="ui-monospace, monospace"
        fontSize={size * 0.24}
        fontWeight="700"
        fill={T.white}
      >
        {value}
      </text>
    </svg>
  );
}
