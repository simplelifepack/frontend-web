import styled, { css } from "styled-components";
import { theme } from "../../variables/theme";
import { Button } from "../Button";
export const fieldStyles = css`
  box-sizing: border-box;
  width: 100%;
  align-self: start;
  min-width: 0;
  min-height: ${({ theme }) => theme.spacing.s40};
  border: ${({ theme }) => theme.vars.borderWidths.s1} solid
    ${({ theme }) => theme.colors.controlBorder};
  border-radius: ${({ theme }) => theme.radii.control};
  background: ${({ theme }) => theme.colors.raised};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacing.s8}
    ${({ theme }) => theme.spacing.s10};
  font-style: normal;
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  font-family: ${({ theme }) => theme.typography.family};
  font-size: ${({ theme }) => theme.typography.text.md};
  line-height: ${({ theme }) => theme.typography.lineHeights.body};
  @media ${({ theme }) => theme.media.mobile} {
    font-size: ${({ theme }) => theme.typography.text.lg};
  }
  &::placeholder {
    color: ${({ theme }) => theme.colors.muted};
    opacity: 1;
  }
  &:hover:not(:disabled):not([readonly]) {
    border-color: ${({ theme }) => theme.colors.muted};
  }
  &:focus-visible {
    outline: ${({ theme }) => theme.vars.borderWidths.s2} solid
      ${({ theme }) => theme.colors.action};
    outline-offset: ${({ theme }) => theme.spacing.s2};
  }
  &[aria-invalid="true"] {
    border-color: ${({ theme }) => theme.colors.coral};
  }
  &:disabled {
    opacity: ${({ theme }) => theme.vars.opacity.p50};
    cursor: not-allowed;
  }
  &[readonly] {
    color: ${({ theme }) => theme.colors.muted};
  }
`;
export const StyledInput = styled.input<{ $textAlign?: "center" }>`
  ${fieldStyles}
  ${({ $textAlign }) => $textAlign && "text-align: center;"}
`;
StyledInput.defaultProps = { theme };

export const PasswordFrame = styled.div`
  position: relative;
  width: 100%;
  min-width: 0;
`;
export const PasswordControl = styled(StyledInput)`
  padding-inline-end: ${({ theme }) =>
    `calc(${theme.spacing.s40} + ${theme.spacing.s8})`};
`;
export const PasswordToggle = styled(Button)`
  position: absolute;
  inset-inline-end: ${({ theme }) => theme.spacing.s4};
  top: 0;
  bottom: 0;
  margin-block: auto;
`;
PasswordFrame.defaultProps =
  PasswordControl.defaultProps =
  PasswordToggle.defaultProps =
    { theme };

/** Collection filters share body typography and quiet surfaces; forms retain their defaults. */
export const filterControlStyles = css`
  background: ${({ theme }) => theme.colors.panel};
  border-color: ${({ theme }) => theme.colors.border};
  font-weight: ${({ theme }) => theme.typography.weights.regular};
`;
