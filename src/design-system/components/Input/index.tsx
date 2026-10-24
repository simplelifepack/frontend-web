import { forwardRef } from "react";
import { StyledInput } from "./styles";
import type { InputProps } from "./types";
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ textAlign, ...props }, ref) => (
    <StyledInput
      data-ds-control=""
      $textAlign={textAlign}
      {...props}
      ref={ref}
    />
  ),
);
Input.displayName = "Input";
export type { InputProps } from "./types";
export { PasswordInput } from "./PasswordInput";
