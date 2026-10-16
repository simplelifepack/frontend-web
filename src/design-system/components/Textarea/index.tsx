import { forwardRef } from "react";
import { StyledTextarea } from "./styles";
import type { TextareaProps } from "./types";
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (props, ref) => <StyledTextarea data-ds-control="" {...props} ref={ref} />,
);
Textarea.displayName = "Textarea";
export type { TextareaProps } from "./types";
