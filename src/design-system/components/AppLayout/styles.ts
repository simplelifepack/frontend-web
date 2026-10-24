import styled from "styled-components";
import { theme } from "../../variables/theme";

export const AppFrame = styled.div`
  display: flex;
  height: 100dvh;
  min-height: 0;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
`;
export const AppSidebar = styled.aside<{ $expanded: boolean }>`
  box-sizing: border-box;
  width: ${({ theme, $expanded }) =>
    $expanded
      ? `calc(${theme.spacing.s60} * 4 - ${theme.spacing.s8})`
      : `calc(${theme.spacing.s60} + ${theme.spacing.s8})`};
  height: 100dvh;
  overflow-y: auto;
  overscroll-behavior: contain;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.s16};
  padding: ${({ theme, $expanded }) =>
    $expanded
      ? theme.spacing.s16
      : `${theme.spacing.s16} ${theme.spacing.s10}`};
  border-right: ${({ theme }) => theme.vars.borderWidths.s1} solid
    ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.panel};
  @media ${({ theme }) => theme.media.navigation} {
    display: none;
  }
`;
export const AppBrand = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: ${({ theme }) => theme.spacing.s44};
`;
export const AppNavigation = styled.nav`
  display: grid;
  gap: ${({ theme }) => theme.spacing.s4};
  flex: 1;
  align-content: start;
`;
export const AppNavigationLink = styled.a<{ $expanded?: boolean }>`
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: ${({ $expanded = true }) =>
    $expanded ? "flex-start" : "center"};
  min-width: 0;
  min-height: ${({ theme }) => theme.spacing.s44};
  gap: ${({ theme }) => theme.spacing.s12};
  padding: ${({ theme, $expanded = true }) =>
    $expanded
      ? `${theme.spacing.s10} ${theme.spacing.s12}`
      : `${theme.spacing.s10} 0`};
  border: ${({ theme }) => theme.vars.borderWidths.s1} solid transparent;
  border-radius: ${({ theme }) => theme.radii.s10};
  color: ${({ theme }) => theme.colors.muted};
  font: ${({ theme }) => theme.typography.weights.medium}
    ${({ theme }) => theme.typography.text.md} /
    ${({ theme }) => theme.typography.lineHeights.body}
    ${({ theme }) => theme.typography.family};
  text-decoration: none;
  &:hover {
    background: ${({ theme }) => theme.colors.raised};
    color: ${({ theme }) => theme.colors.heading};
  }
  &[aria-current="page"] {
    background: ${({ theme }) => theme.colors.actionSoft};
    border-color: ${({ theme }) => theme.colors.action};
    color: ${({ theme }) => theme.colors.action};
  }
  & svg {
    width: ${({ theme }) => theme.vars.icons.regular};
    height: ${({ theme }) => theme.vars.icons.regular};
    flex-shrink: 0;
  }
`;
export const AppMain = styled.main`
  flex: 1;
  min-width: 0;
  min-height: 0;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;
export const AppHeader = styled.header`
  padding: ${({ theme }) => theme.spacing.s24}
    ${({ theme }) => theme.spacing.s32} ${({ theme }) => theme.spacing.s20};
  @media ${({ theme }) => theme.media.navigation} {
    padding: ${({ theme }) => theme.spacing.s16};
  }
`;
export const AppHeaderContent = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.s12};
  max-width: ${({ theme }) => theme.contentWidths.shell};
  margin-inline: auto;
  & > :first-child {
    display: none;
  }
  & > :nth-child(2) {
    width: 100%;
    max-width: ${({ theme }) => theme.vars.sizes.dialog};
    min-width: 0;
  }
  @media ${({ theme }) => theme.media.navigation} {
    & > :first-child {
      display: flex;
    }
    & > :nth-child(2) {
      grid-column: 1 / -1;
      grid-row: 2;
      max-width: none;
    }
    & > :nth-child(3) {
      grid-column: 2;
      grid-row: 1;
    }
  }
`;
export const AppScroll = styled.div`
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 0 ${({ theme }) => theme.spacing.s32}
    ${({ theme }) => theme.spacing.s40};
  @media ${({ theme }) => theme.media.navigation} {
    padding: 0 ${({ theme }) => theme.spacing.s16}
      calc(
        ${({ theme }) => theme.spacing.s60} +
          ${({ theme }) => theme.spacing.s32} + env(safe-area-inset-bottom)
      );
  }
`;
export const AppContent = styled.div`
  width: 100%;
  min-width: 0;
  max-width: ${({ theme }) => theme.contentWidths.shell};
  margin-inline: auto;
`;
export const AppTabbar = styled.nav`
  display: none;
  position: fixed;
  inset-inline: 0;
  bottom: 0;
  z-index: ${({ theme }) => theme.vars.layers.navigation};
  grid-template-columns: repeat(5, minmax(0, 1fr));
  border-top: ${({ theme }) => theme.vars.borderWidths.s1} solid
    ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.panel};
  padding: ${({ theme }) => theme.spacing.s6} ${({ theme }) => theme.spacing.s8}
    calc(${({ theme }) => theme.spacing.s6} + env(safe-area-inset-bottom));
  @media ${({ theme }) => theme.media.navigation} {
    display: grid;
  }
`;
export const AppTab = styled(AppNavigationLink)`
  flex-direction: column;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.s3};
  font-size: ${({ theme }) => theme.typography.text.sm};
  padding: ${({ theme }) => theme.spacing.s4};
`;
for (const component of [
  AppFrame,
  AppSidebar,
  AppBrand,
  AppNavigation,
  AppNavigationLink,
  AppMain,
  AppHeader,
  AppHeaderContent,
  AppScroll,
  AppContent,
  AppTabbar,
  AppTab,
])
  component.defaultProps = { theme };

/** Shared full-page authentication composition, using the same surfaces as dialogs. */
export const AuthFrame = styled.main`
  min-height: 100dvh;
  display: grid;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.s32};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  @media ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacing.s16};
  }
`;
export const AuthSurface = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  width: 100%;
  max-width: ${({ theme }) => theme.contentWidths.shell};
  margin-inline: auto;
  overflow: hidden;
  border: ${({ theme }) => theme.vars.borderWidths.s1} solid
    ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.panel};
  background: ${({ theme }) => theme.colors.panel};
  & > section {
    min-width: 0;
    padding: ${({ theme }) => theme.spacing.s40};
  }
  & > aside {
    padding: ${({ theme }) => theme.spacing.s40};
    background: ${({ theme }) => theme.colors.raised};
    border-right: ${({ theme }) => theme.vars.borderWidths.s1} solid
      ${({ theme }) => theme.colors.border};
  }
  @media ${({ theme }) => theme.media.tablet} {
    grid-template-columns: minmax(0, 1fr);
    max-width: ${({ theme }) => theme.vars.sizes.dialog};
    & > aside {
      display: none;
    }
    & > section {
      padding: ${({ theme }) => theme.spacing.s24};
    }
  }
`;
AuthFrame.defaultProps = { theme };
AuthSurface.defaultProps = { theme };
