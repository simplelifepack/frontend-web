import { forwardRef, useContext } from "react";
import { Slot } from "@radix-ui/react-slot";
import { ThemeContext } from "styled-components";

import { theme as defaultTheme } from "../../variables/theme";
import { StyledButton } from "./styles";
import type { ButtonProps } from "./types";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      tone = "neutral",
      iconOnly = false,
      asChild = false,
      type = "button",
      loading = false,
      disabled,
      loadingText,
      loadingIndicator,
      startIcon,
      endIcon,
      children,
      ...props
    },
    ref,
  ) => {
    const theme = useContext(ThemeContext) ?? defaultTheme;
    const blocked = disabled || loading;
    return (
      <StyledButton
        {...props}
        as={asChild ? Slot : undefined}
        theme={theme}
        $variant={variant}
        $size={size}
        $tone={tone}
        $iconOnly={iconOnly}
        data-ds-button=""
        data-ds-icon-only={iconOnly ? "" : undefined}
        data-button-variant={variant}
        data-button-size={size}
        className={className}
        ref={ref}
        type={asChild ? undefined : type}
        disabled={asChild ? undefined : blocked}
        aria-disabled={asChild && blocked ? true : props["aria-disabled"]}
        tabIndex={asChild && blocked ? -1 : props.tabIndex}
        onClickCapture={(event) => {
          if (asChild && blocked) {
            event.preventDefault();
            event.stopPropagation();
          } else {
            props.onClickCapture?.(event);
          }
        }}
        aria-busy={loading ? true : props["aria-busy"]}
      >
        {asChild ? (
          children
        ) : (
          <>
            {loading && loadingIndicator ? loadingIndicator : startIcon}
            {loading && loadingText != null ? loadingText : children}
            {endIcon}
          </>
        )}
      </StyledButton>
    );
  },
);
Button.displayName = "Button";

export type {
  ButtonProps,
  ButtonVariant,
  ButtonSize,
  ButtonTone,
} from "./types";
