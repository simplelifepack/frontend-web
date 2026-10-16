import { StyledHeading } from "./styles";
import type { HeadingProps, HeadingLevel, HeadingSize } from "./types";
const sizes: Record<HeadingLevel, HeadingSize> = {
  1: "xl",
  2: "lg",
  3: "md",
  4: "sm",
  5: "sm",
  6: "sm",
};
export function Heading({
  level,
  size = sizes[level],
  children,
  ...props
}: HeadingProps) {
  return (
    <StyledHeading
      as={`h${level}` as `h${HeadingLevel}`}
      data-ds-heading=""
      $size={size}
      {...props}
    >
      {children}
    </StyledHeading>
  );
}
export type { HeadingProps, HeadingLevel, HeadingSize } from "./types";
