import type { CSSProperties } from "react";
import styled from "styled-components";

const LogoImage = styled.img`
  flex-shrink: 0;
`;

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
  gold?: string;
  accent?: string;
  tick?: boolean;
};

const BRAND_ACCENT = "#D9A441";
const BRAND_CHARCOAL = "#1E242B";
const BRAND_CREAM = "#F3EEE2";

export function BrandMark({ size = 36, title = "Readines" }: BrandMarkProps) {
  return (
    <LogoImage
      src="/icons/favicon.svg"
      width={size}
      height={size * (337 / 336)}
      alt={title}
    />
  );
}

export function BrandWordmark({
  size = 17,
  color = "var(--lp-heading)",
  gold,
  accent = BRAND_ACCENT,
  tick = false,
}: BrandWordmarkProps) {
  const highlight = gold ?? accent;
  const base: CSSProperties = {
    fontWeight: "var(--weight-bold)",
    fontSize: size,
    letterSpacing: 0,
    color,
    display: "inline-flex",
    alignItems: "baseline",
    lineHeight: "var(--line-body)",
  };

  if (!tick) {
    return (
      <span style={base}>
        Readi<span style={{ color: highlight }}>N</span>es
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
        <circle cx="22.5" cy="4.5" r="4" fill={highlight} />
      </svg>
      <span style={{ color: highlight }}>n</span>es
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
  name: "Readines",
  tagline: "Be ready for life's important moments",
  colors: {
    accent: BRAND_ACCENT,
    charcoal: BRAND_CHARCOAL,
    cream: BRAND_CREAM,
    paper: "#FAF7F0",
  },
};
