import styled from "styled-components";
import { theme } from "../../variables/theme";
import { fieldStyles } from "../Input/styles";
export const StyledSelect = styled.select`
  ${fieldStyles}
  cursor: pointer;
  & option {
    background: ${({ theme }) => theme.colors.panel};
    color: ${({ theme }) => theme.colors.text};
  }
`;
StyledSelect.defaultProps = { theme };
