import * as Primitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import styled from "styled-components";
import { theme } from "../../variables/theme";
import { fieldStyles, filterControlStyles } from "../Input/styles";

type Option = { value: string; label: string; disabled?: boolean };
type Props = {
  value: string;
  onValueChange: (value: string) => void;
  options: Option[];
  "aria-label": string;
  disabled?: boolean;
};
const Trigger = styled(Primitive.Trigger)`
  ${fieldStyles}
  ${filterControlStyles}
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.s12};
  cursor: pointer;
  & > span:first-child {
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
const Menu = styled(Primitive.Content)`
  box-sizing: border-box;
  min-width: var(--radix-select-trigger-width);
  max-width: calc(100vw - ${({ theme }) => theme.spacing.s32});
  max-height: min(
    var(--radix-select-content-available-height),
    calc(${({ theme }) => theme.spacing.s60} * 5)
  );
  overflow: hidden;
  z-index: ${({ theme }) => theme.vars.layers.popover};
  padding: ${({ theme }) => theme.spacing.s4};
  border: ${({ theme }) => theme.vars.borderWidths.s1} solid
    ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.control};
  background: ${({ theme }) => theme.colors.panel};
  box-shadow: ${({ theme }) => theme.vars.shadows.popup};
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.typography.family};
  font-size: ${({ theme }) => theme.typography.text.md};
  font-weight: ${({ theme }) => theme.typography.weights.regular};
  line-height: ${({ theme }) => theme.typography.lineHeights.body};
`;
const Item = styled(Primitive.Item)`
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
  &[data-highlighted] {
    background: ${({ theme }) => theme.colors.raised};
  }
  &[data-state="checked"] {
    color: ${({ theme }) => theme.colors.action};
    background: ${({ theme }) => theme.colors.actionSoft};
    font-weight: ${({ theme }) => theme.typography.weights.medium};
  }
  &[data-disabled] {
    opacity: ${({ theme }) => theme.vars.opacity.p50};
    cursor: not-allowed;
  }
  & svg {
    width: ${({ theme }) => theme.vars.icons.small};
    height: ${({ theme }) => theme.vars.icons.small};
  }
`;
for (const component of [Trigger, Menu, Item])
  component.defaultProps = { theme };

/** Accessible themed filter menu. Radix owns focus, typeahead, Escape, and selection. */
export function SelectMenu({
  value,
  onValueChange,
  options,
  disabled,
  "aria-label": label,
}: Props) {
  return (
    <Primitive.Root
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <Trigger aria-label={label} data-ds-control="">
        <Primitive.Value />
        <Primitive.Icon asChild>
          <ChevronDown aria-hidden="true" />
        </Primitive.Icon>
      </Trigger>
      <Primitive.Portal>
        <Menu
          position="popper"
          sideOffset={Number.parseInt(theme.spacing.s6)}
          collisionPadding={Number.parseInt(theme.spacing.s16)}
        >
          <Primitive.Viewport>
            {options.map((option) => (
              <Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                <Primitive.ItemText>{option.label}</Primitive.ItemText>
                <Primitive.ItemIndicator>
                  <Check aria-hidden="true" />
                </Primitive.ItemIndicator>
              </Item>
            ))}
          </Primitive.Viewport>
        </Menu>
      </Primitive.Portal>
    </Primitive.Root>
  );
}
