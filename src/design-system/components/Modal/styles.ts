import styled from "styled-components";
import { theme } from "../../variables/theme";
import { Stack, Row } from "../Stack";
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
export const Panel = styled.div<{
  $flush: boolean;
  $size: "default" | "compact" | "wide";
}>`
  :where(&) {
    box-sizing: border-box;
    width: min(
      ${({ theme, $size }) =>
        $size === "wide"
          ? `calc(${theme.vars.sizes.dialog} + ${theme.vars.sizes.tooltip})`
          : $size === "compact"
            ? `calc(${theme.vars.sizes.dialog} - ${theme.spacing.s60})`
            : theme.vars.sizes.dialog},
      100%
    );
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

/** Opt-in split-dialog composition; existing dialog/control defaults are unchanged. */
export const ModalColumns = styled.div`
  display: flex;
  min-width: 0;
`;
export const ModalContent = styled.div`
  flex: 1;
  min-width: 0;
  padding: ${({ theme }) => `calc(${theme.spacing.s24} + ${theme.spacing.s2})`};
`;
export const ModalAside = styled(Stack)`
  box-sizing: border-box;
  flex-shrink: 0;
  width: ${({ theme }) =>
    `calc(${theme.vars.sizes.tooltip} + ${theme.spacing.s20})`};
  background: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) =>
    `calc(${theme.spacing.s24} + ${theme.spacing.s2}) ${theme.spacing.s22}`};
  gap: ${({ theme }) => theme.spacing.s14};
  @media ${({ theme }) => theme.media.tablet} {
    display: none;
  }
`;
export const ModalHeader = styled(Row)`
  flex-wrap: nowrap;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.s16};
`;
export const ModalOptions = styled(Stack)`
  width: 100%;
  max-width: ${({ theme }) =>
    `calc(${theme.vars.sizes.dialog} - ${theme.spacing.s60} - ${theme.spacing.s40})`};
  margin-inline: auto;
  gap: ${({ theme }) => theme.spacing.s10};
`;
export const ModalForm = styled(Stack)`
  padding-top: ${({ theme }) => theme.spacing.s10};
  gap: ${({ theme }) => theme.spacing.s10};
`;
export const ModalActions = styled(Stack)`
  align-items: flex-start;
  margin-top: ${({ theme }) => theme.spacing.s4};
  gap: ${({ theme }) => theme.spacing.s12};
`;
export const ModalDetailRow = styled(Row)`
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.s8}
    ${({ theme }) => theme.spacing.s10};
  background: ${({ theme }) => theme.colors.raised};
  border-radius: ${({ theme }) => theme.radii.control};
  overflow-wrap: anywhere;
`;
export const ModalBullet = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.s9};
`;
export const ModalBulletIcon = styled.span`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: ${({ theme }) => theme.spacing.s20};
  height: ${({ theme }) => theme.spacing.s20};
  margin-top: ${({ theme }) => theme.spacing.s1};
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.action};
  color: ${({ theme }) => theme.colors.actionText};
`;
for (const component of [
  ModalColumns,
  ModalContent,
  ModalAside,
  ModalHeader,
  ModalOptions,
  ModalForm,
  ModalActions,
  ModalDetailRow,
  ModalBullet,
  ModalBulletIcon,
])
  component.defaultProps = { theme };
