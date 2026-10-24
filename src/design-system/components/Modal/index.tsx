import { forwardRef, useImperativeHandle, useRef } from "react";
import { createPortal } from "react-dom";
import { Backdrop, Panel } from "./styles";
import { useDialogFocus } from "./focus";
import type { ModalBackdropProps, ModalPanelProps } from "./types";
export const ModalBackdrop = forwardRef<HTMLDivElement, ModalBackdropProps>(
  (props, ref) =>
    createPortal(
      <Backdrop data-ds-backdrop="" {...props} ref={ref} />,
      document.body,
    ),
);
export const ModalPanel = forwardRef<HTMLDivElement, ModalPanelProps>(
  ({ flush = false, size = "default", onDismiss, ...props }, ref) => {
    const panel = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => panel.current!);
    useDialogFocus(panel, onDismiss);
    return (
      <Panel
        data-ds-panel=""
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        $flush={flush}
        $size={size}
        {...props}
        ref={panel}
      />
    );
  },
);
ModalBackdrop.displayName = "ModalBackdrop";
ModalPanel.displayName = "ModalPanel";

export {
  ModalColumns,
  ModalContent,
  ModalAside,
  ModalHeader,
  ModalOptions,
  ModalForm,
  ModalActions,
  ModalDetailRow,
  ModalBullet,
  ModalBulletIcon,
} from "./styles";
