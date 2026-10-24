import { forwardRef } from "react";
import { Group, Option, Count } from "./styles";
import type { ChoiceGroupProps, ChoiceProps } from "./types";
export const ChoiceGroup = forwardRef<HTMLDivElement, ChoiceGroupProps>(
  ({ fullWidth = false, ...props }, ref) => (
    <Group role="group" $fullWidth={fullWidth} {...props} ref={ref} />
  ),
);
export const Choice = forwardRef<HTMLButtonElement, ChoiceProps>(
  ({ appearance = "default", count, children, ...props }, ref) => (
    <Option
      $appearance={appearance}
      data-ds-control=""
      type="button"
      {...props}
      ref={ref}
    >
      {children}
      {count !== undefined && <Count>{count}</Count>}
    </Option>
  ),
);
ChoiceGroup.displayName = "ChoiceGroup";
Choice.displayName = "Choice";
