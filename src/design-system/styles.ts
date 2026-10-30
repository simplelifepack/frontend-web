import { createGlobalStyle } from "styled-components";
import {
  typography,
  interFontFaces,
  typographyVariables,
} from "./variables/typography";
import { semanticColorVariables } from "./variables/colors";
import { spacing, radii, vars, contentWidths } from "./variables";
const declarations = (
  prefix: string,
  values: Record<string, string | number>,
) =>
  Object.entries(values)
    .map(([name, value]) => `--${prefix}-${name}: ${value};`)
    .join("\n");
export const GlobalTypography = createGlobalStyle`
  ${interFontFaces}
  ${typographyVariables}
  ${semanticColorVariables}
  :root {
    ${declarations("space", spacing)}
    ${declarations("radius", radii)}
    ${declarations("layer", vars.layers)}
    ${declarations("shadow", vars.shadows)}
    ${declarations("border", vars.borderWidths)}
    ${declarations("content", contentWidths)}
    ${declarations("icon", vars.icons)}
  }
  :where(button, a, input, select, textarea, [tabindex]):focus-visible {
    outline: ${vars.borderWidths.s2} solid var(--lp-action);
    outline-offset: ${spacing.s3};
  }
  .lucide { stroke-width: ${vars.icons.stroke}; flex-shrink: 0; }
  @media (pointer: coarse) {
    button[data-ds-button], button[data-ds-control], .lp-account-actions button,
    .lp-user-menu, .lp-sheet-item { min-height: ${spacing.s44}; }
    label:has(> input[type="checkbox"]), label:has(> input[type="radio"]) {
      display: inline-flex; align-items: center; gap: ${spacing.s8}; min-height: ${spacing.s44};
    }
    button[data-ds-icon-only] { min-width: ${spacing.s44}; }
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  html, body { font-style: normal; font-family: ${typography.family}; font-size: ${typography.text.md}; line-height: ${typography.lineHeights.body}; }
  button, input, select, textarea, option, table, code, pre, kbd, samp, svg text, [data-sonner-toast] { font-family: inherit; }
  :where(button, input, select, textarea) { font-size: inherit; line-height: inherit; font-style: normal; }
  input::file-selector-button { font: inherit; }
  input::placeholder, textarea::placeholder { font-family: inherit; }
  [data-sonner-toaster] { font-family: ${typography.family} !important; }
`;
