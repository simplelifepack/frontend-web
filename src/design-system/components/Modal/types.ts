import type { HTMLAttributes } from "react";
export type ModalBackdropProps = HTMLAttributes<HTMLDivElement>;
export type ModalPanelProps = HTMLAttributes<HTMLDivElement> & {
  onDismiss?: () => void;
  flush?: boolean;
  size?: "default" | "compact" | "wide";
  as?: "div" | "form" | "section";
};
