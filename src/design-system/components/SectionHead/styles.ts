import styled from "styled-components";
import { theme } from "../../variables/theme";
export const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.s16};
  margin-bottom: ${({ theme }) => theme.spacing.s22};
  & p {
    margin-top: ${({ theme }) => theme.spacing.s6};
  }
  & > div {
    min-width: 0;
  }
  @media ${({ theme }) => theme.media.field} {
    flex-direction: column;
    & > :last-child:not(:first-child) {
      align-self: stretch;
    }
  }
`;

Header.defaultProps = { theme };
