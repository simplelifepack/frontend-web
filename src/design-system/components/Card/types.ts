import type { HTMLAttributes } from "react";
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  flush?: boolean;
  tone?: "default" | "danger";
}
