import styled from "styled-components";
import { theme } from "../../variables/theme";
export const Group = styled.div<{ $fullWidth: boolean }>`
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.s8};
  ${({ $fullWidth }) =>
    $fullWidth &&
    "width: 100%; & > [data-ds-control] { flex: 1; min-width: 0; }"}
`;
export const Option = styled.button<{
  $appearance: "default" | "filter" | "profile";
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.s6};
  min-height: ${({ theme }) => theme.spacing.s32};
  padding: ${({ theme }) => theme.spacing.s6}
    ${({ theme }) => theme.spacing.s12};
  border: ${({ theme }) => theme.vars.borderWidths.s1} solid
    ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.control};
  background: ${({ theme }) => theme.colors.panel};
  color: ${({ theme }) => theme.colors.muted};
  font: ${({ theme }) => theme.typography.weights.medium}
    ${({ theme }) => theme.typography.text.md} /
    ${({ theme }) => theme.typography.lineHeights.body}
    ${({ theme }) => theme.typography.family};
  ${({ theme, $appearance }) =>
    $appearance === "filter" &&
    `border-radius: ${theme.radii.pill}; font-weight: ${theme.typography.weights.medium}; min-height: ${theme.spacing.s40}; padding-inline: ${theme.spacing.s14};`}
  ${({ theme, $appearance }) =>
    $appearance === "profile" &&
    `
    min-width: calc(${theme.spacing.s40} * 4);
    max-width: min(100%, ${theme.vars.sizes.tooltip});
    justify-content: flex-start;
    text-align: left;
    padding: ${theme.spacing.s12};
    gap: ${theme.spacing.s12};
    border-radius: ${theme.radii.panel};
  `}
  cursor: pointer;
  &[aria-pressed="true"] {
    background: ${({ theme }) => theme.colors.actionSoft};
    border-color: ${({ theme }) => theme.colors.action};
    color: ${({ theme }) => theme.colors.action};
  }
  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.raised};
  }
  &:focus-visible {
    outline: ${({ theme }) => theme.vars.borderWidths.s2} solid
      ${({ theme }) => theme.colors.action};
    outline-offset: ${({ theme }) => theme.spacing.s3};
  }
  &:disabled {
    opacity: ${({ theme }) => theme.vars.opacity.p50};
    cursor: not-allowed;
  }
  & svg {
    width: ${({ theme }) => theme.spacing.s16};
    height: ${({ theme }) => theme.spacing.s16};
    color: inherit;
    flex-shrink: 0;
  }
`;
Group.defaultProps = Option.defaultProps = { theme };

export const Count = styled.span`
  display: inline-grid;
  place-items: center;
  min-width: ${({ theme }) => theme.spacing.s20};
  min-height: ${({ theme }) => theme.spacing.s20};
  padding-inline: ${({ theme }) => theme.spacing.s4};
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.mutedSoft};
  font-size: ${({ theme }) => theme.typography.text.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  line-height: ${({ theme }) => theme.typography.lineHeights.compact};
`;
Count.defaultProps = { theme };
