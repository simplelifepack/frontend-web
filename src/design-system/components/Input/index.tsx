import { forwardRef } from "react";
import { StyledInput } from "./styles";
import type { InputProps } from "./types";
export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => (
  <StyledInput data-ds-control="" {...props} ref={ref} />
));
Input.displayName = "Input";
export type { InputProps } from "./types";
