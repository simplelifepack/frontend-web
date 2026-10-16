import styled from "styled-components";
import { theme } from "../../variables/theme";
export const Backdrop = styled.div`
  :where(&) {
    position: fixed;
    inset: 0;
    z-index: ${({ theme }) => theme.vars.layers.overlay};
    display: grid;
    place-items: center;
    padding: ${({ theme }) => theme.spacing.s18};
    background: ${({ theme }) => theme.colors.scrim};
    backdrop-filter: blur(${({ theme }) => theme.vars.effects.backdropBlur});
  }
`;
export const Panel = styled.div<{ $flush: boolean }>`
  :where(&) {
    box-sizing: border-box;
    width: min(${({ theme }) => theme.vars.sizes.dialog}, 100%);
    max-height: 92dvh;
    overflow-y: auto;
    background: ${({ theme }) => theme.colors.panel};
    color: ${({ theme }) => theme.colors.text};
    border: ${({ theme }) => theme.vars.borderWidths.s1} solid
      ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.panel};
    padding: ${({ theme, $flush }) => ($flush ? 0 : theme.spacing.s22)};
    box-shadow: ${({ theme }) => theme.vars.shadows.panel};
  }
`;
Backdrop.defaultProps = Panel.defaultProps = { theme };
