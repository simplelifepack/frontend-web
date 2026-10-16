import { forwardRef } from "react";
import { StyledRadio } from "./styles";
import type { RadioProps } from "./types";
export const Radio = forwardRef<HTMLInputElement, RadioProps>((props, ref) => (
  <StyledRadio data-ds-control="" type="radio" {...props} ref={ref} />
));
Radio.displayName = "Radio";
export type { RadioProps } from "./types";
