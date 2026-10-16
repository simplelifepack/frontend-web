import { Text } from "@/design-system";
import { Button, type ButtonProps, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/design-system";

export default function CustomPackButton({ quotaReached, disabled, style, variant = "primary", ...props }: ButtonProps & { quotaReached: boolean }) {
  const button = <Button {...props} variant={variant} type="button" disabled={disabled || quotaReached}
    style={style} />;
  if (!quotaReached) return button;
  return <TooltipProvider delayDuration={150}><Tooltip>
    <TooltipTrigger asChild>
      <Text size="md" tabIndex={0} aria-label="Create a custom pack unavailable. Upgrade to use."
        style={{ display: 'inline-block', cursor: 'not-allowed' }}>{button}</Text>
    </TooltipTrigger>
    <TooltipContent>Upgrade to use</TooltipContent>
  </Tooltip></TooltipProvider>;
}
