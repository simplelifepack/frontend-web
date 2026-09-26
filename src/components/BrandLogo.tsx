import type { CSSProperties } from "react";

type BrandLogoProps = {
  height?: number;
  className?: string;
};

type BrandMarkProps = {
  size?: number;
  color?: string;
  carve?: string;
  title?: string;
};

type BrandWordmarkProps = {
  size?: number;
  color?: string;
  accent?: string;
  tick?: boolean;
};

const BRAND_ACCENT = "#D9A441";
const BRAND_CHARCOAL = "#1E242B";
const BRAND_CREAM = "#F3EEE2";

export function BrandMark({
  size = 36,
  color = BRAND_ACCENT,
  carve = BRAND_CHARCOAL,
  title = "ReadiNes",
}: BrandMarkProps) {
  return (
    <svg
      width={size}
      height={size * (187 / 147)}
      viewBox="41 25 147 187"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      style={{ flexShrink: 0 }}
    >
      <path d="M70.4 106.7 L142.8 199" fill="none" stroke={color} strokeLinecap="round" strokeWidth={26} />
      <g transform="translate(124.44,154.56) rotate(51.9)">
        <rect x="0" y="-24" width="17" height="26" rx="3" fill={color} />
        <rect x="3.5" y="-18" width="10" height="2.4" rx="1.2" fill={carve} />
        <rect x="3.5" y="-13" width="7.5" height="2.4" rx="1.2" fill={carve} />
      </g>
      <g transform="translate(140.48,175.02) rotate(51.9)">
        <rect x="0" y="-24" width="17" height="26" rx="3" fill={color} />
        <rect x="3.5" y="-18" width="10" height="2.4" rx="1.2" fill={carve} />
        <rect x="3.5" y="-13" width="7.5" height="2.4" rx="1.2" fill={carve} />
      </g>
      <path d="M58 29 V199" fill="none" stroke={color} strokeLinecap="butt" strokeWidth={26} />
      <circle cx="58" cy="199" r="13" fill={color} />
      <path d="M45 29 H112 C164 29 164 135 112 135 H45 Z" fill={color} />
      <circle cx="102" cy="68" r="18" fill={carve} />
      <path d="M94 78 L84 114 H120 L110 78 Z" fill={carve} />
    </svg>
  );
}

export function BrandWordmark({
  size = 17,
  color = BRAND_CHARCOAL,
  accent = BRAND_ACCENT,
  tick = true,
}: BrandWordmarkProps) {
  const base: CSSProperties = {
    fontFamily: "'Nunito Sans','Space Grotesk',system-ui,sans-serif",
    fontWeight: 800,
    fontSize: size,
    letterSpacing: "-0.02em",
    color,
    display: "inline-flex",
    alignItems: "baseline",
    lineHeight: 1,
  };

  if (!tick) {
    return (
      <span style={base}>
        Readi<span style={{ color: accent }}>N</span>es
      </span>
    );
  }

  const h = size;
  return (
    <span style={base}>
      Read
      <svg
        width={h * 0.52}
        height={h * 1.06}
        viewBox="0 0 26 53"
        style={{ margin: "0 0.06em", transform: "translateY(0.16em)" }}
        aria-hidden
      >
        <path
          d="M3 33 L10 45 L21 16"
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={8}
        />
        <circle cx="22.5" cy="4.5" r="4" fill={accent} />
      </svg>
      <span style={{ color: accent }}>N</span>es
    </span>
  );
}

export default function BrandLogo({ height = 40, className }: BrandLogoProps) {
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: Math.max(8, height * 0.22),
        height,
        maxWidth: "100%",
      }}
    >
      <BrandMark size={height * 0.62} />
      <BrandWordmark size={height * 0.38} />
    </span>
  );
}

export const BRAND = {
  name: "ReadiNes",
  tagline: "Be ready for life's important moments",
  colors: { accent: BRAND_ACCENT, charcoal: BRAND_CHARCOAL, cream: BRAND_CREAM, paper: "#FAF7F0" },
};
