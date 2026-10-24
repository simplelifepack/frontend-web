import type { HTMLAttributes, ButtonHTMLAttributes } from "react";
export type ChoiceGroupProps = HTMLAttributes<HTMLDivElement> & {
  fullWidth?: boolean;
};
export type ChoiceProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  appearance?: "default" | "filter" | "profile";
  count?: number;
};
