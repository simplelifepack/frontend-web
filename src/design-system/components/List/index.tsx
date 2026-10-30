import styled, { css } from "styled-components";
import { theme } from "../../variables/theme";
import { Button } from "../Button";
import type { colors } from "../../variables/colors";

const row = css<{ $divided?: boolean }>`
  display: flex;
  align-items: center;
  min-width: 0;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.s12};
  padding: ${({ theme }) => theme.spacing.s16};
  border-top: ${({ theme, $divided }) =>
    $divided
      ? `${theme.vars.borderWidths.s1} solid ${theme.colors.border}`
      : "none"};
`;
export const ListRow = styled.div<{ $divided?: boolean }>`
  ${row}
`;
export const ListAction = styled(Button)<{ $divided?: boolean }>`
  ${row}
  width: 100%;
  justify-content: flex-start;
  text-align: left;
  border-radius: 0;
  font-weight: ${({ theme }) => theme.typography.weights.regular};
  & > svg:last-child {
    margin-inline-start: auto;
  }
`;
export const TileAction = styled(Button)<{ $horizontal?: boolean }>`
  width: 100%;
  height: 100%;
  align-items: ${({ $horizontal }) => ($horizontal ? "center" : "flex-start")};
  flex-direction: ${({ $horizontal }) => ($horizontal ? "row" : "column")};
  text-align: left;
  justify-content: flex-start;
  padding: ${({ theme }) => theme.spacing.s18};
  gap: ${({ theme }) => theme.spacing.s12};
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.panel};
  background: ${({ theme }) => theme.colors.panel};
`;
export const IconBadge = styled.span<{ $tone?: keyof typeof colors }>`
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
  width: ${({ theme }) => theme.spacing.s40};
  height: ${({ theme }) => theme.spacing.s40};
  border-radius: ${({ theme }) => theme.radii.control};
  background: ${({ theme }) => theme.colors.raised};
  color: ${({ theme, $tone = "action" }) => theme.colors[$tone] as string};
  & > svg {
    width: ${({ theme }) => theme.vars.icons.regular};
    height: ${({ theme }) => theme.vars.icons.regular};
  }
`;
for (const component of [ListRow, ListAction, TileAction, IconBadge])
  component.defaultProps = { theme };

export const ControlSlot = styled.div`
  width: ${({ theme }) => `calc(${theme.spacing.s60} * 3)`};
  max-width: 100%;
  min-width: 0;
  @media ${({ theme }) => theme.media.mobile} {
    width: 100%;
  }
`;
ControlSlot.defaultProps = { theme };
