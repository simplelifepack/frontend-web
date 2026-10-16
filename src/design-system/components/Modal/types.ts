import type { HTMLAttributes } from "react";
export type ModalBackdropProps = HTMLAttributes<HTMLDivElement>;
export type ModalPanelProps = HTMLAttributes<HTMLDivElement> & {
  onDismiss?: () => void;
  flush?: boolean;
  as?: "div" | "form" | "section";
};
