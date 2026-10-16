import styled, { css } from "styled-components";
import { theme } from "../../variables/theme";
const track = css<{ $checked: boolean }>`
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  width: ${({ theme }) => theme.spacing.s40};
  height: ${({ theme }) => theme.spacing.s24};
  padding: ${({ theme }) => theme.spacing.s3};
  border: ${({ theme }) => theme.vars.borderWidths.s1} solid
    ${({ theme, $checked }) =>
      $checked ? theme.colors.action : theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme, $checked }) =>
    $checked ? theme.colors.action : theme.colors.raised};
`;
export const Control = styled.button<{ $checked: boolean }>`
  ${track} cursor:pointer;
  &:focus-visible {
    outline: ${({ theme }) => theme.vars.borderWidths.s2} solid
      ${({ theme }) => theme.colors.action};
    outline-offset: ${({ theme }) => theme.spacing.s3};
  }
  &:disabled {
    opacity: ${({ theme }) => theme.vars.opacity.p50};
    cursor: not-allowed;
  }
`;
export const Indicator = styled.span<{ $checked: boolean }>`
  ${track}
`;
export const Thumb = styled.span<{ $checked: boolean }>`
  display: block;
  width: ${({ theme }) => theme.spacing.s16};
  height: ${({ theme }) => theme.spacing.s16};
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme, $checked }) =>
    $checked ? theme.colors.actionText : theme.colors.muted};
  transform: translateX(
    ${({ theme, $checked }) => ($checked ? theme.spacing.s16 : 0)}
  );
  transition: transform ${({ theme }) => theme.vars.duration.ms150} ease;
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;
Control.defaultProps = Indicator.defaultProps = Thumb.defaultProps = { theme };
