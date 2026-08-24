/**
 * ReadiNes brand assets.
 *
 * These render the supplied artwork (ReadiNes-Logo-Final.png) directly — the
 * mark and wordmark are sliced out of it and the flat ink background is keyed
 * to transparency. Nothing here is redrawn.
 *
 *   public/brand-mark.png          the R-key mark, transparent background
 *   public/brand-wordmark.png      "ReadiNes" in cream, for dark surfaces
 *   public/brand-wordmark-ink.png  "ReadiNes" in ink, for light surfaces
 *   public/brand-icon.png          favicon, mark on its ink tile
 *
 * Palette sampled from the artwork: ink #1E242B · gold #D9A441 · cream #F3EEE2
 */

export const BRAND_GOLD = "#D9A441";
export const BRAND_INK = "#1E242B";
export const BRAND_CREAM = "#F3EEE2";

const MARK_ASPECT = 661 / 967; // width / height of the sliced mark
const WORD_ASPECT = 1213 / 274; // width / height of the sliced wordmark
const WORD_SCALE = 274 / 193; // full slice height / letter height

type BrandMarkProps = {
  size?: number;
  /**
   * Retained for API compatibility. The keyhole is transparent in the artwork,
   * so it already picks up whatever surface the mark is placed on and no
   * explicit carve colour is needed.
   */
  carve?: string;
  title?: string;
};

export function BrandMark({ size = 34, title }: BrandMarkProps) {
  return (
    <img
      src="/brand-mark.png"
      width={Math.round(size * MARK_ASPECT)}
      height={size}
      alt={title ?? ""}
      aria-hidden={title ? undefined : true}
      style={{ display: "block", flex: "none", objectFit: "contain" }}
    />
  );
}

type BrandWordmarkProps = {
  size?: number;
  /** Light values select the cream artwork, dark values the ink artwork. */
  color?: string;
  /** Retained for API compatibility; the gold is baked into the artwork. */
  gold?: string;
};

export function BrandWordmark({ size = 18, color = BRAND_CREAM }: BrandWordmarkProps) {
  const height = Math.round(size * WORD_SCALE);
  const src = isLight(color) ? "/brand-wordmark.png" : "/brand-wordmark-ink.png";

  return (
    <img
      src={src}
      width={Math.round(height * WORD_ASPECT)}
      height={height}
      alt="ReadiNes"
      style={{ display: "block", flex: "none", objectFit: "contain" }}
    />
  );
}

function isLight(color: string) {
  const hex = color.trim().replace("#", "");
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => c + c)
          .join("")
      : hex;
  if (full.length !== 6) return true;

  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return true;

  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5;
}
