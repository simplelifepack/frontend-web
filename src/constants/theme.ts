import { colors } from "@/design-system/variables/colors";

export const T = {
  navy: colors.navy,
  panel: colors.panel,
  raised: colors.raised,
  border: colors.border,
  action: colors.action,
  actionHover: colors.actionHover,
  actionText: colors.actionText,
  readiness: colors.readiness,
  readinessBright: colors.readinessBright,
  readinessSoft: colors.readinessSoft,
  readinessBorder: colors.readinessBorder,
  warning: colors.warning,
  warningSoft: colors.warningSoft,
  warningBorder: colors.warningBorder,
  mint: colors.mint,
  coral: colors.coral,
  info: colors.info,
  purple: colors.purple,
  pink: colors.pink,
  teal: colors.teal,
  white: colors.heading,
  text: colors.text,
  muted: colors.muted,
  faint: colors.faint,
  coralSoft: colors.coralSoft,
  coralBorder: colors.coralBorder,
} as const;

export const A = {
  blue: colors.info,
  purple: colors.purple,
  teal: colors.teal,
  pink: colors.pink,
  green: colors.mint,
  readiness: colors.readiness,
} as const;

export type Tone = "ready" | "warn" | "wax" | "flat";
