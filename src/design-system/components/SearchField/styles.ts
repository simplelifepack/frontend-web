import styled from "styled-components";
import { theme } from "../../variables/theme";
import { fieldStyles } from "../Input/styles";
export const Field = styled.label`
  display: flex;
  min-width: 0;
  align-self: start;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.s8};
  padding-inline: ${({ theme }) => theme.spacing.s10};
  border: ${({ theme }) => theme.vars.borderWidths.s1} solid
    ${({ theme }) => theme.colors.controlBorder};
  border-radius: ${({ theme }) => theme.radii.control};
  background: ${({ theme }) => theme.colors.raised};
  color: ${({ theme }) => theme.colors.muted};
  &:focus-within {
    outline: ${({ theme }) => theme.vars.borderWidths.s2} solid
      ${({ theme }) => theme.colors.action};
    outline-offset: ${({ theme }) => theme.spacing.s2};
  }
  & > svg {
    width: ${({ theme }) => theme.spacing.s16};
    height: ${({ theme }) => theme.spacing.s16};
    flex-shrink: 0;
  }
`;
export const Control = styled.input`
  ${fieldStyles} flex:1;
  border: 0;
  background: transparent;
  padding-inline: 0;
  &:focus-visible {
    outline: none;
  }
`;
Field.defaultProps = Control.defaultProps = { theme };
