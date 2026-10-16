import styled from "styled-components";
import { theme } from "../../variables/theme";
export const Group = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.s6};
  min-width: 0;
`;
export const Label = styled.label`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.text.md};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
`;
Group.defaultProps = Label.defaultProps = { theme };
