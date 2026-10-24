import type { ComponentPropsWithRef, ReactNode, ElementType } from "react";
export type TextElement = ElementType;
export type TextSize = "sm" | "md" | "lg";
export type TextWeight = "regular" | "medium" | "semibold";
export type TextTone = "default" | "muted" | "danger" | "success" | "heading";
export type TextProps<E extends TextElement = "span"> = {
  as?: E;
  children: ReactNode;
  size?: TextSize;
  weight?: TextWeight;
  tone?: TextTone;
} & Omit<
  ComponentPropsWithRef<E>,
  "as" | "children" | "size" | "weight" | "color"
>;
