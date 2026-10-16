import styled, { css } from "styled-components";
import type { ButtonSize, ButtonTone, ButtonVariant } from "./types";

const variants = {
  primary: css`
    background: var(--button-accent);
    border-color: var(--button-accent);
    color: var(--button-on-accent);
    &:not(:disabled):not([aria-disabled="true"]):hover {
      background: var(--button-accent-hover);
      border-color: var(--button-accent-hover);
    }
  `,
  secondary: css`
    background: ${({ theme }) => theme.colors.raised};
    border-color: var(--button-border);
    color: var(--button-text);
    &:not(:disabled):not([aria-disabled="true"]):hover {
      background: var(--button-soft);
      border-color: var(--button-accent);
    }
  `,
  tertiary: css`
    background: transparent;
    color: var(--button-accent);
    &:not(:disabled):not([aria-disabled="true"]):hover {
      background: var(--button-soft);
    }
  `,
  default: css`
    background: ${({ theme }) => theme.colors.panel};
    border-color: var(--button-border);
    color: var(--button-text);
    &:not(:disabled):not([aria-disabled="true"]):hover {
      background: ${({ theme }) => theme.colors.raised};
      border-color: var(--button-accent);
    }
  `,
};

const sizes = {
  sm: css`
    --button-height: ${({ theme }) => theme.spacing.s32};
    min-height: var(--button-height);
    padding: ${({ theme }) => theme.spacing.s4}
      ${({ theme }) => theme.spacing.s10};
    font-size: ${({ theme }) => theme.typography.text.sm};
  `,
  md: css`
    --button-height: ${({ theme }) => theme.spacing.s40};
    min-height: var(--button-height);
    padding: ${({ theme }) => theme.spacing.s8}
      ${({ theme }) => theme.spacing.s15};
    font-size: ${({ theme }) => theme.typography.text.md};
  `,
  lg: css`
    --button-height: ${({ theme }) => theme.spacing.s44};
    min-height: var(--button-height);
    padding: ${({ theme }) => theme.spacing.s10}
      ${({ theme }) => theme.spacing.s16};
    font-size: ${({ theme }) => theme.typography.text.md};
  `,
};

const tones = {
  neutral: css`
    --button-accent: ${({ theme }) => theme.colors.action};
    --button-accent-hover: ${({ theme }) => theme.colors.actionHover};
    --button-on-accent: ${({ theme }) => theme.colors.actionText};
    --button-text: ${({ theme }) => theme.colors.text};
    --button-border: ${({ theme }) => theme.colors.border};
    --button-soft: ${({ theme }) => theme.colors.actionSoft};
  `,
  danger: css`
    --button-accent: ${({ theme }) => theme.colors.coral};
    --button-accent-hover: color-mix(
      in srgb,
      ${({ theme }) => theme.colors.coral} ${({ theme }) => theme.vars.mix.p86},
      ${({ theme }) => theme.colors.text}
    );
    --button-on-accent: ${({ theme }) => theme.colors.navy};
    --button-text: ${({ theme }) => theme.colors.coral};
    --button-border: ${({ theme }) => theme.colors.coralBorder};
    --button-soft: ${({ theme }) => theme.colors.coralSoft};
  `,
};

export const StyledButton = styled.button<{
  $variant: ButtonVariant;
  $size: ButtonSize;
  $tone: ButtonTone;
  $iconOnly: boolean;
}>`
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  gap: ${({ theme }) => theme.spacing.s8};
  min-width: 0;
  flex-shrink: 0;
  max-width: 100%;
  border: ${({ theme }) => theme.vars.borderWidths.s1} solid transparent;
  border-radius: ${({ theme }) => theme.radii.s10};
  font-style: normal;
  font-family: ${({ theme }) => theme.typography.family};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  line-height: ${({ theme }) => theme.typography.lineHeights.compact};
  text-align: center;
  text-decoration: none;
  white-space: normal;
  overflow-wrap: anywhere;
  cursor: pointer;
  transition:
    background-color ${({ theme }) => theme.vars.duration.ms150} ease,
    border-color ${({ theme }) => theme.vars.duration.ms150} ease,
    color ${({ theme }) => theme.vars.duration.ms150} ease;

  ${({ $tone }) => tones[$tone]}
  ${({ $variant }) => variants[$variant]}
  ${({ $size }) => sizes[$size]}
  ${({ $iconOnly }) =>
    $iconOnly &&
    css`
      width: var(--button-height);
      min-width: var(--button-height);
      height: var(--button-height);
      padding: 0;
      flex-shrink: 0;
    `}

  & svg {
    color: inherit;
    width: ${({ theme }) => theme.vars.icons.small};
    height: ${({ theme }) => theme.vars.icons.small};
    flex-shrink: 0;
    pointer-events: none;
  }
  &:focus-visible {
    outline: ${({ theme }) => theme.vars.borderWidths.s2} solid
      ${({ theme }) => theme.colors.action};
    outline-offset: ${({ theme }) => theme.spacing.s3};
  }
  &:disabled,
  &[aria-disabled="true"] {
    opacity: ${({ theme }) => theme.vars.opacity.p50};
    cursor: not-allowed;
  }
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;
