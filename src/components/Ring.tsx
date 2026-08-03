import { T } from "@/constants/theme";

type RingProps = {
  score: number;
  size?: number;
  color?: string;
};

export default function Ring({ score, size = 64, color }: RingProps) {
  const stroke = size > 52 ? 6 : 5;
  const radius = (size - stroke * 2) / 2 - 2;
  const circumference = 2 * Math.PI * radius;
  const strokeColor = color ?? (score >= 100 ? T.mint : score >= 70 ? T.gold : T.coral);
  const center = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={center} cy={center} r={radius} fill="none" stroke={T.border} strokeWidth={stroke} />
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={strokeColor}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - score / 100)}
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
        {score}
      </text>
    </svg>
  );
}
