import { forwardRef } from "react";
import { Surface } from "./styles";
import type { CardProps } from "./types";
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ flush = false, tone = "default", ...props }, ref) => (
    <Surface data-ds-card="" $flush={flush} $tone={tone} {...props} ref={ref} />
  ),
);
Card.displayName = "Card";
export type { CardProps } from "./types";
