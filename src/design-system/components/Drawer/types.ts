import type { ComponentProps } from "react";
export interface DrawerPanelProps extends ComponentProps<"aside"> {
  onDismiss?: () => void;
  edge?: "right" | "bottom";
}
export type DrawerBackdropProps = ComponentProps<"button">;

export type DrawerContainerProps = ComponentProps<"div">;
