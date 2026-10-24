import styled from "styled-components";
import { theme } from "../../variables/theme";
import type { spacing } from "../../variables/spacing";

/** Content spacing belongs to the layout, independently of text/control margins. */
export const Stack = styled.div<{
  $gap?: keyof typeof spacing;
  $grow?: boolean;
  $spaceAfter?: keyof typeof spacing;
}>`
  display: flex;
  margin: 0;
  margin-bottom: ${({ theme, $spaceAfter }) =>
    $spaceAfter ? theme.spacing[$spaceAfter] : 0};
  padding: 0;
  list-style: none;
  flex-direction: column;
  ${({ $grow }) => $grow && "flex: 1;"}
  min-width: 0;
  gap: ${({ theme, $gap = "s12" }) => theme.spacing[$gap]};
`;
Stack.defaultProps = { theme };

/** Shared responsive compositions. Visual values always come from the theme. */
export const Container = styled.div`
  width: 100%;
  max-width: ${({ theme }) => theme.contentWidths.shell};
  margin-inline: auto;
  padding-inline: ${({ theme }) => theme.spacing.s32};
  box-sizing: border-box;
  min-width: 0;
  @media ${({ theme }) => theme.media.mobile} {
    padding-inline: ${({ theme }) => theme.spacing.s16};
  }
`;
export const Section = styled.section<{ $tone?: "raised"; $compact?: boolean }>`
  padding-block: ${({ theme, $compact }) =>
    $compact ? theme.spacing.s32 : theme.spacing.s60};
  background: ${({ theme, $tone }) =>
    $tone ? theme.colors.raised : theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  scroll-margin-top: ${({ theme }) =>
    `calc(${theme.spacing.s60} + ${theme.spacing.s60} + ${theme.spacing.s24})`};
  @media ${({ theme }) => theme.media.mobile} {
    padding-block: ${({ theme }) => theme.spacing.s32};
  }
`;
export const Grid = styled.div<{
  $columns?: 2 | 3 | 4;
  $compactColumns?: 1 | 2;
  $sharedRows?: number;
  $reverse?: boolean;
  $align?: "center" | "stretch" | "start";
}>`
  display: grid;
  min-width: 0;
  grid-template-columns: repeat(
    ${({ $columns = 2 }) => $columns},
    minmax(0, 1fr)
  );
  gap: ${({ theme }) => theme.spacing.s24};
  align-items: ${({ $align = "stretch" }) => $align};
  & > * {
    min-width: 0;
  }
  ${({ $sharedRows }) =>
    $sharedRows &&
    `& > * { display: grid; grid-template-rows: subgrid; grid-row: span ${$sharedRows}; row-gap: 0; }`}
  ${({ $reverse }) => $reverse && `& > :first-child { order: 2; }`}
  @media ${({ theme }) => theme.media.tablet} {
    grid-template-columns: repeat(
      ${({ $columns }) => ($columns === 4 ? 2 : ($columns ?? 2))},
      minmax(0, 1fr)
    );
  }
  @media ${({ theme }) => theme.media.mobile} {
    grid-template-columns: repeat(
      ${({ $compactColumns = 1 }) => $compactColumns},
      minmax(0, 1fr)
    );
    & > :first-child {
      order: initial;
    }
    ${({ $sharedRows }) =>
      $sharedRows && "& > * { grid-row: auto; grid-template-rows: none; }"}
  }
`;
export const Row = styled.div<{
  $justify?: "space-between" | "center";
  $wrap?: boolean;
  $gap?: keyof typeof spacing;
}>`
  display: flex;
  align-items: center;
  flex-wrap: ${({ $wrap = true }) => ($wrap ? "wrap" : "nowrap")};
  min-width: 0;
  gap: ${({ theme, $gap = "s12" }) => theme.spacing[$gap]};
  justify-content: ${({ $justify }) => $justify ?? "flex-start"};
  & > svg {
    flex-shrink: 0;
  }
`;
export const Center = styled(Stack)`
  align-items: center;
  text-align: center;
`;
export const Content = styled(Stack)<{
  $pad?: keyof typeof spacing;
}>`
  padding: ${({ theme, $pad = "s24" }) => theme.spacing[$pad]};
`;
export const SiteNav = styled.nav`
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.vars.layers.navigation};
  background: ${({ theme }) => theme.colors.panel};
  border-bottom: ${({ theme }) => theme.vars.borderWidths.s1} solid
    ${({ theme }) => theme.colors.border};
  padding-block: ${({ theme }) => theme.spacing.s12};
`;
export const NavLayout = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.s12};
  @media ${({ theme }) => theme.media.mobile} {
    grid-template-columns: minmax(0, 1fr) auto;
    & > :nth-child(2) {
      grid-column: 1 / -1;
      grid-row: 2;
    }
    & > :nth-child(3) {
      grid-column: 2;
      grid-row: 1;
    }
  }
`;
export const NavLink = styled.a`
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.typography.family};
  font-size: ${({ theme }) => theme.typography.text.md};
  padding-block: ${({ theme }) => theme.spacing.s12};
  text-decoration: none;
  &:hover {
    color: ${({ theme }) => theme.colors.action};
  }
  &:focus-visible {
    outline: ${({ theme }) => theme.vars.borderWidths.s2} solid
      ${({ theme }) => theme.colors.action};
    outline-offset: ${({ theme }) => theme.spacing.s3};
    border-radius: ${({ theme }) => theme.radii.small};
  }
`;
export const SurfaceHeader = styled.div<{ $accent?: boolean }>`
  padding: ${({ theme }) => theme.spacing.s18};
  background: ${({ theme, $accent }) =>
    $accent ? theme.colors.action : theme.colors.raised};
  color: ${({ theme, $accent }) =>
    $accent ? theme.colors.actionText : theme.colors.heading};
  font-family: ${({ theme }) => theme.typography.family};
  font-size: ${({ theme }) => theme.typography.text.md};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
`;
export const ScrollRegion = styled.div<{ $vertical?: boolean }>`
  ${({ theme, $vertical }) =>
    $vertical &&
    `max-height: calc(${theme.spacing.s60} * 4); overflow-y: auto;`}
  max-width: 100%;
  overflow-x: auto;
  &:focus-visible {
    outline: ${({ theme }) => theme.vars.borderWidths.s2} solid
      ${({ theme }) => theme.colors.action};
  }
`;
export const ComparisonTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: ${({ theme }) => theme.typography.family};
  font-size: ${({ theme }) => theme.typography.text.md};
  line-height: ${({ theme }) => theme.typography.lineHeights.body};
  color: ${({ theme }) => theme.colors.text};
  th,
  td {
    text-align: left;
    vertical-align: top;
    padding: ${({ theme }) => theme.spacing.s16};
    border-bottom: ${({ theme }) => theme.vars.borderWidths.s1} solid
      ${({ theme }) => theme.colors.border};
  }
  th {
    font-weight: ${({ theme }) => theme.typography.weights.semibold};
  }
  thead {
    background: ${({ theme }) => theme.colors.action};
    color: ${({ theme }) => theme.colors.actionText};
  }
  caption {
    text-align: left;
    padding: ${({ theme }) => theme.spacing.s18};
    font-weight: ${({ theme }) => theme.typography.weights.semibold};
  }
`;
for (const component of [
  Container,
  Section,
  Grid,
  Row,
  Center,
  Content,
  SiteNav,
  NavLayout,
  NavLink,
  SurfaceHeader,
  ScrollRegion,
  ComparisonTable,
]) {
  component.defaultProps = { theme };
}

/** Responsive filter and search rows shared by collection screens. */
export const FilterBar = styled.div<{ $search?: boolean }>`
  display: grid;
  grid-template-columns: ${({ $search, theme }) =>
    $search
      ? "repeat(6, minmax(0, 1fr))"
      : `repeat(auto-fit, minmax(min(100%, calc(${theme.spacing.s40} * 4)), 1fr))`};
  ${({ $search }) => $search && "& > :first-child { grid-column: span 2; }"}
  @media ${({ theme }) => theme.media.tablet} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  gap: ${({ theme }) => theme.spacing.s12};
  min-width: 0;
  & > * {
    min-width: 0;
    width: 100%;
  }
`;
FilterBar.defaultProps = { theme };
