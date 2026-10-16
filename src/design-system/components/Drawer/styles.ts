import styled from "styled-components";
import { Backdrop } from "../Modal/styles";
import { theme } from "../../variables/theme";
export const Surface = styled.aside<{ $edge: "right" | "bottom" }>`
  box-sizing: border-box;
  background: ${({ theme }) => theme.colors.panel};
  color: ${({ theme }) => theme.colors.text};
  border: ${({ theme }) => theme.vars.borderWidths.s1} solid
    ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.vars.shadows.panel};
  border-radius: ${({ theme, $edge }) =>
    $edge === "bottom"
      ? theme.radii.panel + " " + theme.radii.panel + " 0 0"
      : "0"};
`;
export const Dismiss = styled.button`
  position: fixed;
  inset: 0;
  border: 0;
  background: ${({ theme }) => theme.colors.scrim};
  cursor: pointer;
  &:focus-visible {
    outline: ${({ theme }) => theme.vars.borderWidths.s2} solid
      ${({ theme }) => theme.colors.action};
    outline-offset: -${({ theme }) => theme.spacing.s3};
  }
`;
Surface.defaultProps = Dismiss.defaultProps = { theme };

export const Container = styled(Backdrop)`
  :where(&) {
    display: flex;
    justify-content: flex-end;
    padding: 0;
    z-index: ${({ theme }) => theme.vars.layers.drawer};
  }
`;
Container.defaultProps = { theme };
