import styled from "styled-components";
import { theme } from "../../variables/theme";
export const Disclosure = styled.details`
  color: ${({ theme }) => theme.colors.text};
  & > summary {
    cursor: pointer;
    color: ${({ theme }) => theme.colors.muted};
    font-weight: ${({ theme }) => theme.typography.weights.semibold};
    padding-block: ${({ theme }) => theme.spacing.s12};
  }
  & > summary:focus-visible {
    outline: ${({ theme }) => theme.vars.borderWidths.s2} solid
      ${({ theme }) => theme.colors.action};
    outline-offset: ${({ theme }) => theme.spacing.s2};
  }
`;
export const Preformatted = styled.pre`
  margin: 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font: inherit;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.raised};
  border: ${({ theme }) => theme.vars.borderWidths.s1} solid
    ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.control};
  padding: ${({ theme }) => theme.spacing.s12};
`;
Disclosure.defaultProps = { theme };
Preformatted.defaultProps = { theme };
