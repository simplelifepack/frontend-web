import { forwardRef } from "react";
import { StyledSelect } from "./styles";
import type { SelectProps } from "./types";
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (props, ref) => <StyledSelect data-ds-control="" {...props} ref={ref} />,
);
Select.displayName = "Select";
export type { SelectProps } from "./types";
