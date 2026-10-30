import { lightColorTokens as colors } from "./colorTokens";

// Public surfaces use the supplied light palette.
export const landingBrand = {
  paper: colors["surface-canvas"],
  paperDeep: colors["surface-secondary"],
  panel: colors["surface-default"],
  panel2: colors["surface-inset"],
  border: colors["border-default"],
  ink: colors["text-heading"],
  body: colors["text-primary"],
  muted: colors["text-secondary"],
  action: colors["action-primary-default"],
  actionText: colors["text-on-brand"],
  actionHover: colors["action-primary-hover"],
  actionSoft: colors["surface-brand-tint"],
  emerald: colors["status-success-icon"],
  clay: colors["status-warning-icon"],
  red: colors["status-danger-icon"],
  blue: colors["status-info-icon"],
  purple: colors["person-2"],
  pink: colors["person-4"],
  teal: colors["person-3"],
} as const;
