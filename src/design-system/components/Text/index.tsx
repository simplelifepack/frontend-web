import type { ElementType } from "react";
import { StyledText } from "./styles";
import type { TextElement, TextProps } from "./types";
export function Text<E extends TextElement = "span">({
  as,
  size = "md",
  weight = "regular",
  tone = "default",
  children,
  ...props
}: TextProps<E>) {
  // The public generic couples native attributes and refs to the semantic tag.
  const Element = StyledText as ElementType;
  return (
    <Element
      as={as ?? "span"}
      data-ds-text=""
      $size={size}
      $weight={weight}
      $tone={tone}
      {...props}
    >
      {children}
    </Element>
  );
}
export type {
  TextProps,
  TextElement,
  TextSize,
  TextWeight,
  TextTone,
} from "./types";
