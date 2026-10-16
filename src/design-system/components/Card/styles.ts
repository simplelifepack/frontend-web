import styled, { css } from "styled-components";
import { theme } from "../../variables/theme";
export const Surface = styled.div<{
  $flush: boolean;
  $tone: "default" | "danger";
}>`
  :where(&) {
    background: ${({ theme }) => theme.colors.panel};
    color: ${({ theme }) => theme.colors.text};
    border: ${({ theme }) => theme.vars.borderWidths.s1} solid
      ${({ theme, $tone }) =>
        $tone === "danger" ? theme.colors.coralBorder : theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.panel};
    padding: ${({ theme, $flush }) => ($flush ? 0 : theme.spacing.s18)};
    ${({ $flush }) =>
      $flush &&
      css`
        overflow: hidden;
      `}
  }
`;
Surface.defaultProps = { theme };
