import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import { useDialogFocus } from "../Modal/focus";
import { forwardRef, useRef, useImperativeHandle } from "react";
import { Surface, Dismiss, Container } from "./styles";
import type {
  DrawerPanelProps,
  DrawerBackdropProps,
  DrawerContainerProps,
} from "./types";
export const DrawerPanel = forwardRef<HTMLElement, DrawerPanelProps>(
  ({ edge = "right", onDismiss, ...props }, ref) => {
    const panel = useRef<HTMLElement>(null);
    useImperativeHandle(ref, () => panel.current!);
    useDialogFocus(panel, onDismiss);
    return (
      <Surface
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        $edge={edge}
        {...props}
        ref={panel}
      />
    );
  },
);
export const DrawerBackdrop = forwardRef<
  HTMLButtonElement,
  DrawerBackdropProps
>((props, ref) => <Dismiss type="button" {...props} ref={ref} />);
DrawerPanel.displayName = "DrawerPanel";
DrawerBackdrop.displayName = "DrawerBackdrop";

export const DrawerContainer = forwardRef<HTMLDivElement, DrawerContainerProps>(
  (props, ref) =>
    createPortal(<Container {...props} ref={ref} />, document.body),
);
DrawerContainer.displayName = "DrawerContainer";

// Standalone panels/backdrops must escape route isolation and scroll containers.
export function DrawerPortal({ children }: { children: ReactNode }) {
  return createPortal(children, document.body);
}
