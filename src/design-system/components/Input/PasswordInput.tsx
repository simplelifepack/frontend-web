import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { PasswordControl, PasswordFrame, PasswordToggle } from "./styles";
import type { InputProps } from "./types";

/** Password visibility changes presentation only; value, ref and events stay native. */
export const PasswordInput = forwardRef<
  HTMLInputElement,
  Omit<InputProps, "type">
>(({ textAlign, ...props }, ref) => {
  const [visible, setVisible] = useState(false);
  const label = String(props["aria-label"] ?? "password").toLowerCase();
  const Icon = visible ? EyeOff : Eye;
  return (
    <PasswordFrame>
      <PasswordControl
        {...props}
        $textAlign={textAlign}
        data-ds-control=""
        ref={ref}
        type={visible ? "text" : "password"}
      />
      <PasswordToggle
        type="button"
        size="sm"
        variant="tertiary"
        iconOnly
        disabled={props.disabled}
        aria-label={`${visible ? "Hide" : "Show"} ${label}`}
        aria-pressed={visible}
        onClick={() => setVisible((value) => !value)}
      >
        <Icon aria-hidden="true" />
      </PasswordToggle>
    </PasswordFrame>
  );
});
PasswordInput.displayName = "PasswordInput";
