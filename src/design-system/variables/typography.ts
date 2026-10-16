export const typography = {
  family: '"Poppins", sans-serif',
  chartLabel: "8px",
  text: { sm: "12px", md: "14px", lg: "16px" },
  heading: { sm: "18px", md: "22px", lg: "28px", xl: "clamp(32px, 5vw, 56px)" },
  weights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
  lineHeights: { heading: 1.2, body: 1.5, compact: 1.2 },
} as const;

// Shared by the app document and the standalone printable emergency-card document.
export const poppinsFontFaces = (
  [
    [400, "regular"],
    [500, "medium"],
    [600, "semibold"],
    [700, "bold"],
  ] as const
)
  .map(
    ([weight, file]) =>
      `@font-face { font-family: "Poppins"; font-style: normal; font-weight: ${weight}; font-display: swap; src: url("/fonts/poppins/${file}.ttf") format("truetype"); }`,
  )
  .join("\n");

export const typographyVariables = `:root {
 --font-sans: ${typography.family};
 --text-sm: ${typography.text.sm}; --text-md: ${typography.text.md}; --text-lg: ${typography.text.lg};
 --heading-sm: ${typography.heading.sm}; --heading-md: ${typography.heading.md}; --heading-lg: ${typography.heading.lg}; --heading-xl: ${typography.heading.xl};
 --weight-regular: ${typography.weights.regular}; --weight-medium: ${typography.weights.medium}; --weight-semibold: ${typography.weights.semibold}; --weight-bold: ${typography.weights.bold};
 --line-heading: ${typography.lineHeights.heading}; --line-body: ${typography.lineHeights.body}; --line-compact: ${typography.lineHeights.compact};
}`;
