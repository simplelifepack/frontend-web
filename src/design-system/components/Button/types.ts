import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "default";
export type ButtonSize = "sm" | "md" | "lg";
export type ButtonTone = "neutral" | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  tone?: ButtonTone;
  iconOnly?: boolean;
  fullWidth?: boolean;
  asChild?: boolean;
  loading?: boolean;
  loadingText?: ReactNode;
  loadingIndicator?: ReactNode;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}
