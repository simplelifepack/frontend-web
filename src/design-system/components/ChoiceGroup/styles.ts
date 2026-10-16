import styled from "styled-components";
import { theme } from "../../variables/theme";
export const Group = styled.div`
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.s8};
`;
export const Option = styled.button`
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
  font: ${({ theme }) => theme.typography.weights.semibold}
    ${({ theme }) => theme.typography.text.md} /
    ${({ theme }) => theme.typography.lineHeights.body}
    ${({ theme }) => theme.typography.family};
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
