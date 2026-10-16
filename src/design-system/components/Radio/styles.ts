import styled from "styled-components";
import { theme } from "../../variables/theme";
export const StyledRadio = styled.input`
  width: ${({ theme }) => theme.spacing.s18};
  height: ${({ theme }) => theme.spacing.s18};
  flex-shrink: 0;
  vertical-align: middle;
  accent-color: ${({ theme }) => theme.colors.action};
  cursor: pointer;
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
StyledRadio.defaultProps = { theme };
