import * as Primitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { forwardRef, useCallback, useState, type ReactNode } from "react";
import styled, { css } from "styled-components";
import { theme } from "../../variables/theme";
import { fieldStyles, filterControlStyles } from "../Input/styles";

export type SelectOption = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
  searchText?: string;
  alwaysVisible?: boolean;
};
export type SelectMenuProps = {
  value: string;
  onValueChange?: (value: string) => void;
  options: SelectOption[];
  "aria-label"?: string;
  disabled?: boolean;
  placeholder?: string;
  container?: HTMLElement | null;
  id?: string;
  name?: string;
  required?: boolean;
  className?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
};
export const selectTriggerStyles = css`
  ${fieldStyles}
  ${filterControlStyles}
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.s12};
  border-radius: ${({ theme }) => theme.radii.s10};
  padding-inline: ${({ theme }) => theme.spacing.s12};
  text-align: left;
  text-transform: none;
  letter-spacing: normal;
  cursor: pointer;
  & > span:first-child {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  & svg {
    width: ${({ theme }) => theme.vars.icons.small};
    height: ${({ theme }) => theme.vars.icons.small};
    flex-shrink: 0;
    color: ${({ theme }) => theme.colors.muted};
  }
`;
export const SelectTriggerButton = styled.button`
  ${selectTriggerStyles}
`;
const Trigger = styled(Primitive.Trigger)`
  ${selectTriggerStyles}
`;
export const selectSurfaceStyles = css`
  box-sizing: border-box;
  max-width: calc(100vw - ${({ theme }) => theme.spacing.s32});
  overflow: hidden;
  z-index: ${({ theme }) => theme.vars.layers.popover};
  padding: ${({ theme }) => theme.spacing.s4};
  border: ${({ theme }) => theme.vars.borderWidths.s1} solid
    ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.s10};
  background: ${({ theme }) => theme.colors.panel};
  box-shadow: ${({ theme }) => theme.vars.shadows.popup};
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.typography.family};
  font-size: ${({ theme }) => theme.typography.text.md};
  font-weight: ${({ theme }) => theme.typography.weights.regular};
  line-height: ${({ theme }) => theme.typography.lineHeights.body};
`;
const Menu = styled(Primitive.Content)`
  ${selectSurfaceStyles}
  min-width: var(--radix-select-trigger-width);
  max-height: min(
    var(--radix-select-content-available-height),
    calc(${({ theme }) => theme.spacing.s60} * 5)
  );
`;
const Viewport = styled(Primitive.Viewport)`
  max-height: inherit;
  overflow-y: auto;
`;
export const selectOptionStyles = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: ${({ theme }) => theme.spacing.s40};
  gap: ${({ theme }) => theme.spacing.s12};
  padding: ${({ theme }) => theme.spacing.s8}
    ${({ theme }) => theme.spacing.s12};
  border-radius: ${({ theme }) => theme.radii.small};
  cursor: pointer;
  outline: none;
  &[data-highlighted],
  &[data-selected="true"] {
    background: ${({ theme }) => theme.colors.raised};
  }
  &[data-state="checked"],
  &[aria-selected="true"] {
    color: ${({ theme }) => theme.colors.action};
    background: ${({ theme }) => theme.colors.actionSoft};
    font-weight: ${({ theme }) => theme.typography.weights.medium};
  }
  &[data-disabled=""],
  &[data-disabled="true"],
  &[aria-disabled="true"] {
    opacity: ${({ theme }) => theme.vars.opacity.p50};
    cursor: not-allowed;
  }
  & svg {
    width: ${({ theme }) => theme.vars.icons.small};
    height: ${({ theme }) => theme.vars.icons.small};
    flex-shrink: 0;
  }
`;
const Item = styled(Primitive.Item)`
  ${selectOptionStyles}
`;
for (const component of [SelectTriggerButton, Trigger, Menu, Viewport, Item])
  component.defaultProps = { theme };

/** The same themed select for filters and forms, including empty/clear options. */
export const SelectMenu = forwardRef<HTMLButtonElement, SelectMenuProps>(
  function SelectMenu(
    {
      value,
      onValueChange,
      options,
      disabled,
      placeholder,
      container,
      name,
      required,
      "aria-label": label,
      ...triggerProps
    },
    forwardedRef,
  ) {
    const [dialog, setDialog] = useState<HTMLElement | null>(null);
    const attachTrigger = useCallback(
      (node: HTMLButtonElement | null) => {
        setDialog(node?.closest<HTMLElement>('[role="dialog"]') ?? null);
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      },
      [forwardedRef],
    );
    // Radix reserves an empty string for its placeholder. Prefix every option so
    // clearing remains an explicit choice and real values cannot collide with it.
    const selected = options.some((option) => option.value === value)
      ? `value:${value}`
      : "";
    return (
      <Primitive.Root
        value={selected}
        onValueChange={(next) => onValueChange?.(next.slice(6))}
        disabled={disabled}
        required={required}
      >
        {name && (
          <input type="hidden" name={name} value={value} disabled={disabled} />
        )}
        <Trigger
          {...triggerProps}
          ref={attachTrigger}
          aria-label={label}
          data-ds-control=""
          data-ds-select=""
        >
          <Primitive.Value placeholder={placeholder} />
          <Primitive.Icon asChild>
            <ChevronDown aria-hidden="true" />
          </Primitive.Icon>
        </Trigger>
        <Primitive.Portal container={container ?? dialog ?? undefined}>
          <Menu
            position="popper"
            sideOffset={6}
            collisionPadding={16}
            data-ds-select-menu=""
          >
            <Viewport>
              {options.map((option) => (
                <Item
                  key={option.value}
                  value={`value:${option.value}`}
                  disabled={option.disabled}
                >
                  <Primitive.ItemText>{option.label}</Primitive.ItemText>
                  <Primitive.ItemIndicator>
                    <Check aria-hidden="true" />
                  </Primitive.ItemIndicator>
                </Item>
              ))}
            </Viewport>
          </Menu>
        </Primitive.Portal>
      </Primitive.Root>
    );
  },
);
