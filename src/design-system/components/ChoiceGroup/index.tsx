import { forwardRef } from "react";
import { Group, Option } from "./styles";
import type { ChoiceGroupProps, ChoiceProps } from "./types";
export const ChoiceGroup = forwardRef<HTMLDivElement, ChoiceGroupProps>(
  (props, ref) => <Group role="group" {...props} ref={ref} />,
);
export const Choice = forwardRef<HTMLButtonElement, ChoiceProps>(
  (props, ref) => (
    <Option data-ds-control="" type="button" {...props} ref={ref} />
  ),
);
ChoiceGroup.displayName = "ChoiceGroup";
Choice.displayName = "Choice";
