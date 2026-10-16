import { forwardRef } from "react";
import { Control, Indicator, Thumb } from "./styles";
import type { SwitchProps, SwitchIndicatorProps } from "./types";
export function SwitchIndicator({ checked }: SwitchIndicatorProps) {
  return (
    <Indicator aria-hidden="true" $checked={checked}>
      <Thumb $checked={checked} />
    </Indicator>
  );
}
export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onCheckedChange, onClick, ...props }, ref) => (
    <Control
      data-ds-control=""
      {...props}
      type="button"
      role="switch"
      aria-checked={checked}
      $checked={checked}
      ref={ref}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) onCheckedChange(!checked);
      }}
    >
      <Thumb $checked={checked} />
    </Control>
  ),
);
Switch.displayName = "Switch";
