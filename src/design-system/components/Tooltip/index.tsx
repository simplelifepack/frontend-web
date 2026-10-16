import { forwardRef, type ElementRef } from "react";
import * as Primitive from "@radix-ui/react-tooltip";
import { Content } from "./styles";
import type { TooltipContentProps } from "./types";
export const TooltipProvider = Primitive.Provider;
export const Tooltip = Primitive.Root;
export const TooltipTrigger = Primitive.Trigger;
export const TooltipContent = forwardRef<
  ElementRef<typeof Primitive.Content>,
  TooltipContentProps
>(({ sideOffset = 4, ...props }, ref) => (
  <Primitive.Portal>
    <Content ref={ref} sideOffset={sideOffset} {...props} />
  </Primitive.Portal>
));
TooltipContent.displayName = "TooltipContent";
