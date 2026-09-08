import type { ButtonHTMLAttributes } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export default function CustomPackButton({ quotaReached, disabled, style, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { quotaReached: boolean }) {
  const button = <button {...props} type="button" disabled={disabled || quotaReached}
    style={{ ...style, ...(quotaReached ? { opacity: 0.5, cursor: 'not-allowed', pointerEvents: 'none' } : {}) }} />;
  if (!quotaReached) return button;
  return <TooltipProvider delayDuration={150}><Tooltip>
    <TooltipTrigger asChild>
      <span tabIndex={0} aria-label="Create a custom pack unavailable. Upgrade to use."
        style={{ display: 'inline-block', cursor: 'not-allowed' }}>{button}</span>
    </TooltipTrigger>
    <TooltipContent>Upgrade to use</TooltipContent>
  </Tooltip></TooltipProvider>;
}
