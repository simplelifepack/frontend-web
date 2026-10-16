import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
} from "react";
import * as Primitive from "@radix-ui/react-popover";
import styled from "styled-components";
import { theme } from "../../variables/theme";

export const Popover = Primitive.Root;
export const PopoverTrigger = Primitive.Trigger;
const Surface = styled(Primitive.Content)`
  z-index: ${({ theme }) => theme.vars.layers.popover};
  box-sizing: border-box;
  width: min(330px, calc(100vw - 32px));
  max-height: var(--radix-popover-content-available-height);
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.s12};
  border: ${({ theme }) => theme.vars.borderWidths.s1} solid
    ${({ theme }) => theme.colors.controlBorder};
  border-radius: ${({ theme }) => theme.radii.control};
  background: ${({ theme }) => theme.colors.panel};
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.typography.family};
  box-shadow: ${({ theme }) => theme.vars.shadows.popup};
`;
Surface.defaultProps = { theme };
export const PopoverContent = forwardRef<
  ElementRef<typeof Primitive.Content>,
  ComponentPropsWithoutRef<typeof Primitive.Content>
>((props, ref) => (
  <Primitive.Portal>
    <Surface sideOffset={8} collisionPadding={16} {...props} ref={ref} />
  </Primitive.Portal>
));
PopoverContent.displayName = "PopoverContent";
