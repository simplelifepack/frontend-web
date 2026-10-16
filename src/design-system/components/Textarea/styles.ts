import styled from "styled-components";
import { theme } from "../../variables/theme";
import { fieldStyles } from "../Input/styles";
export const StyledTextarea = styled.textarea`
  ${fieldStyles}
  min-height: ${({ theme }) => theme.spacing.s60};
  resize: vertical;
`;
StyledTextarea.defaultProps = { theme };
