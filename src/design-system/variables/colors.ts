// Semantic references preserve the existing CSS-variable light/dark palette.
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
  successSoft: "color-mix(in srgb, var(--lp-mint) 14%, transparent)",
  mutedSoft: "color-mix(in srgb, var(--lp-muted) 12%, transparent)",
  navy: "var(--lp-navy)",
  panel: "var(--lp-panel)",
  raised: "var(--lp-raised)",
  border: "var(--lp-border)",
  action: "var(--lp-action)",
  actionHover: "var(--lp-action-hover)",
  actionText: "var(--lp-action-text)",
  actionSoft: "color-mix(in srgb, var(--lp-action) 12%, transparent)",
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

// Single light/dark palette for styled components, inline compositions, and legacy CSS.
export const semanticColorVariables = `:root {
  --chart-1: #356dbf;
  --chart-2: #147952;
  --chart-3: #935d19;
  --chart-4: #6b4bc3;
  --chart-5: #9c3f68;
  --lp-navy: #f2f3f5;
  --lp-panel: #ffffff;
  --lp-raised: #eaecf0;
  --lp-border: #e3e6ea;
  --lp-readiness: #866318;
  --lp-readiness-bright: #9c7420;
  --lp-action: #077480;
  --lp-action-hover: #066773;
  --lp-action-text: #ffffff;
  --lp-mint: #147952;
  --lp-warning: #935d19;
  --lp-coral: #ba4238;
  --lp-info: #356dbf;
  --lp-purple: #6b4bc3;
  --lp-pink: #9c3f68;
  --lp-teal: #067c86;
  --lp-heading: #1b2431;
  --lp-text: #39424f;
  --lp-muted: #5e6674;
  --lp-faint: #626976;
  --lp-readiness-soft: color-mix(in srgb, var(--lp-readiness) 14%, transparent);
  --lp-readiness-border: color-mix(
    in srgb,
    var(--lp-readiness) 40%,
    transparent
  );
  --lp-warning-soft: color-mix(in srgb, var(--lp-warning) 14%, transparent);
  --lp-warning-border: color-mix(in srgb, var(--lp-warning) 40%, transparent);
  --lp-coral-soft: color-mix(in srgb, var(--lp-coral) 12%, transparent);
  --lp-coral-border: color-mix(in srgb, var(--lp-coral) 34%, transparent);
  --lpv-bg: var(--lp-navy);
  --lpv-panel: var(--lp-panel);
  --lpv-raised: var(--lp-raised);
  --lpv-border: var(--lp-border);
  --lpv-text: var(--lp-text);
  --lpv-muted: var(--lp-muted);
  --lpv-action: var(--lp-action);
  --lpv-actionink: var(--lp-action-text);
  --lpv-barbg: color-mix(in srgb, var(--lp-panel) 96%, transparent);
  --lpv-bartext: var(--lp-muted);
  --lpv-baractive: var(--lp-action);
  --lpv-barpill: var(--lp-raised);
  --lpv-scrim: rgb(11 18 32 / 38%);
  --lp-shadow: rgb(11 18 32 / 22%);
  --lp-control-border: #7e8795;
}
.dark {
  --chart-1: #79a7ff;
  --chart-2: #4fcb95;
  --chart-3: #eccb82;
  --chart-4: #b59af5;
  --chart-5: #f38db7;
  --lp-navy: #0b1220;
  --lp-panel: #131c2e;
  --lp-raised: #1b2740;
  --lp-border: #27324a;
  --lp-readiness: #d9b86a;
  --lp-readiness-bright: #eccb82;
  --lp-action: #35a7a0;
  --lp-action-hover: #43bbb4;
  --lp-action-text: #0b1220;
  --lp-mint: #4fcb95;
  --lp-warning: #d98a2b;
  --lp-coral: #e8736a;
  --lp-info: #5b8def;
  --lp-purple: #9b7be8;
  --lp-pink: #e86a9b;
  --lp-teal: #3fb9c7;
  --lp-heading: #ffffff;
  --lp-text: #e6ebf5;
  --lp-muted: #8a97ae;
  --lp-faint: #8490a4;
  --lp-readiness-soft: color-mix(in srgb, var(--lp-readiness) 14%, transparent);
  --lp-readiness-border: color-mix(
    in srgb,
    var(--lp-readiness) 40%,
    transparent
  );
  --lp-warning-soft: color-mix(in srgb, var(--lp-warning) 14%, transparent);
  --lp-warning-border: color-mix(in srgb, var(--lp-warning) 40%, transparent);
  --lp-coral-soft: color-mix(in srgb, var(--lp-coral) 12%, transparent);
  --lp-coral-border: color-mix(in srgb, var(--lp-coral) 34%, transparent);
  --lpv-bg: var(--lp-navy);
  --lpv-panel: var(--lp-panel);
  --lpv-raised: var(--lp-raised);
  --lpv-border: var(--lp-border);
  --lpv-text: var(--lp-text);
  --lpv-muted: var(--lp-muted);
  --lpv-action: var(--lp-action);
  --lpv-actionink: var(--lp-action-text);
  --lpv-barbg: color-mix(in srgb, var(--lp-navy) 96%, transparent);
  --lpv-bartext: var(--lp-muted);
  --lpv-baractive: var(--lp-action);
  --lpv-barpill: var(--lp-raised);
  --lpv-scrim: rgb(0 0 0 / 60%);
  --lp-shadow: rgb(0 0 0 / 48%);
  --lp-control-border: #697991;
}`;
