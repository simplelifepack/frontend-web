import type { HTMLAttributes, ReactNode, Ref } from "react";
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = "sm" | "md" | "lg" | "xl";
export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  level: HeadingLevel;
  size?: HeadingSize;
  ref?: Ref<HTMLHeadingElement>;
}
