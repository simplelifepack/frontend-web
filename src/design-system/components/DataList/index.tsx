import styled, { css } from "styled-components";
import { theme } from "../../variables/theme";

const columns = css<{ $columns: number }>`
  display: grid;
  grid-template-columns: ${({ theme, $columns }) =>
    `${theme.spacing.s24} minmax(0, 2fr) repeat(${$columns - 3}, minmax(0, 1fr)) ${theme.spacing.s20}`};
  align-items: center;
  gap: ${({ theme }) => theme.spacing.s12};
  min-width: 0;
  padding: ${({ theme }) => theme.spacing.s16};
  & > * {
    min-width: 0;
    overflow-wrap: anywhere;
  }
`;
export const DataListHeader = styled.div<{ $columns: number }>`
  ${columns}
  background: ${({ theme }) => theme.colors.raised};
  color: ${({ theme }) => theme.colors.muted};
  @media ${({ theme }) => theme.media.tablet} {
    display: flex;
    & > :not(:first-child) {
      display: none;
    }
  }
`;
export const DataListRow = styled.div<{ $columns: number }>`
  ${columns}
  border-top: ${({ theme }) => theme.vars.borderWidths.s1} solid ${({
    theme,
  }) => theme.colors.border};
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.colors.raised};
  }
  &:focus-visible {
    outline: ${({ theme }) => theme.vars.borderWidths.s2} solid
      ${({ theme }) => theme.colors.action};
    outline-offset: -${({ theme }) => theme.spacing.s2};
  }
  @media ${({ theme }) => theme.media.tablet} {
    display: flex;
    flex-wrap: wrap;
    & > :nth-child(2) {
      flex: 1;
      min-width: calc(100% - ${({ theme }) => theme.spacing.s60});
    }
    & > :last-child {
      margin-inline-start: auto;
    }
  }
`;
DataListHeader.defaultProps = DataListRow.defaultProps = { theme };
