import {
  lightColorTokens as light,
  darkColorTokens as dark,
} from "./colorTokens";

export const primaryPalette = {
  light: {
    base: light["action-primary-default"],
    hover: light["action-primary-hover"],
    pressed: light["action-primary-pressed"],
    text: light["text-on-brand"],
  },
  dark: {
    base: dark["action-primary-default"],
    hover: dark["action-primary-hover"],
    pressed: dark["action-primary-pressed"],
    text: dark["text-on-brand"],
  },
  soft: light["surface-brand-tint"],
} as const;

// Compatibility aliases consume the supplied semantic light/dark tokens.
export const colors = {
  background: "var(--lp-navy)",
  surface: "var(--lp-panel)",
  success: "var(--lp-mint)",
  danger: "var(--lp-coral)",
  controlBorder: "var(--lp-control-border)",
  chart: [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ],
  scrim: "var(--lpv-scrim)",
  successSoft: "var(--color-status-success-surface)",
  mutedSoft: "color-mix(in srgb, var(--lp-muted) 12%, transparent)",
  navy: "var(--lp-navy)",
  panel: "var(--lp-panel)",
  raised: "var(--lp-raised)",
  border: "var(--lp-border)",
  action: "var(--lp-action)",
  actionHover: "var(--lp-action-hover)",
  actionText: "var(--lp-action-text)",
  actionSoft: "var(--color-surface-brand-tint)",
  readiness: "var(--lp-readiness)",
  readinessBright: "var(--lp-readiness-bright)",
  readinessSoft: "var(--lp-readiness-soft)",
  readinessBorder: "var(--lp-readiness-border)",
  warning: "var(--lp-warning)",
  warningSoft: "var(--lp-warning-soft)",
  warningBorder: "var(--lp-warning-border)",
  mint: "var(--lp-mint)",
  coral: "var(--lp-coral)",
  info: "var(--lp-info)",
  purple: "var(--lp-purple)",
  pink: "var(--lp-pink)",
  teal: "var(--lp-teal)",
  text: "var(--lp-text)",
  muted: "var(--lp-muted)",
  faint: "var(--lp-faint)",
  coralSoft: "var(--lp-coral-soft)",
  coralBorder: "var(--lp-coral-border)",
  heading: "var(--lp-heading)",
};

// Canonical supplied tokens are the source for both modes and all legacy aliases.
const tokenDeclarations = (tokens: Record<string, string>) =>
  Object.entries(tokens)
    .map(([name, value]) => `--color-${name}: ${value};`)
    .join("\n");
export const semanticColorVariables = `:root {
  ${tokenDeclarations(light)}
  --lp-navy: var(--color-surface-canvas);
  --lp-panel: var(--color-surface-default);
  --lp-raised: var(--color-surface-secondary);
  --lp-border: var(--color-border-default);
  --lp-readiness: var(--color-status-warning-icon);
  --lp-readiness-bright: var(--color-status-warning-border);
  --lp-action: var(--color-action-primary-default);
  --lp-action-hover: var(--color-action-primary-hover);
  --lp-action-text: var(--color-text-on-brand);
  --lp-mint: var(--color-status-success-icon);
  --lp-warning: var(--color-status-warning-icon);
  --lp-coral: var(--color-status-danger-icon);
  --lp-info: var(--color-status-info-icon);
  --lp-purple: var(--color-action-primary-default);
  --lp-pink: var(--color-person-4);
  --lp-teal: var(--color-person-3);
  --lp-heading: var(--color-text-heading);
  --lp-text: var(--color-text-primary);
  --lp-muted: var(--color-text-secondary);
  --lp-faint: var(--color-text-tertiary);
  --lp-readiness-soft: var(--color-status-warning-surface);
  --lp-readiness-border: var(--color-status-warning-border);
  --lp-warning-soft: var(--color-status-warning-surface);
  --lp-warning-border: var(--color-status-warning-border);
  --lp-coral-soft: var(--color-status-danger-surface);
  --lp-coral-border: var(--color-status-danger-border);
  --lpv-scrim: var(--color-overlay-backdrop);
  --lp-shadow: var(--color-shadow-strong);
  --lp-control-border: var(--color-border-emphasis);
  --chart-1: var(--color-person-1);
  --chart-2: var(--color-status-success-icon);
  --chart-3: var(--color-status-warning-icon);
  --chart-4: var(--color-person-2);
  --chart-5: var(--color-person-4);
  --lpv-bg: var(--lp-navy);
  --lpv-panel: var(--lp-panel);
  --lpv-raised: var(--lp-raised);
  --lpv-border: var(--lp-border);
  --lpv-text: var(--lp-text);
  --lpv-muted: var(--lp-muted);
  --lpv-action: var(--lp-action);
  --lpv-actionink: var(--lp-action-text);
  --lpv-bartext: var(--lp-muted);
  --lpv-baractive: var(--lp-action);
  --lpv-barpill: var(--lp-raised);
  --lpv-barbg: var(--color-surface-default);
}
.dark {
  ${tokenDeclarations(dark)}
}`;
