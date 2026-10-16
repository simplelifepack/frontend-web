import type { ReactElement, InputHTMLAttributes, ReactNode } from "react";
export interface FieldProps {
  label: string;
  hint?: ReactNode;
  error?: string;
  children: ReactElement<InputHTMLAttributes<HTMLElement>>;
}
