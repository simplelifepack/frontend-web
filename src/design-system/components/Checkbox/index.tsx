import { forwardRef } from "react";
import { StyledCheckbox } from "./styles";
import type { CheckboxProps } from "./types";
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (props, ref) => (
    <StyledCheckbox data-ds-control="" type="checkbox" {...props} ref={ref} />
  ),
);
Checkbox.displayName = "Checkbox";
export type { CheckboxProps } from "./types";
