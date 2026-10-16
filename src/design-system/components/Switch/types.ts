import type { ButtonHTMLAttributes } from "react";
export interface SwitchProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onChange" | "children"
> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}
export interface SwitchIndicatorProps {
  checked: boolean;
}
