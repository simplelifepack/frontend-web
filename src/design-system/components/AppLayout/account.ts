import styled from "styled-components";
import { theme } from "../../variables/theme";
import { Button } from "../Button";

/** Account controls share the header typography and collapse their label on small screens. */
export const AccountTrigger = styled(Button)`
  gap: ${({ theme }) => theme.spacing.s8};
  padding: ${({ theme }) => theme.spacing.s4}
    ${({ theme }) => theme.spacing.s12};
  border-radius: ${({ theme }) => theme.radii.pill};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  & > [data-account-name] {
    max-width: ${({ theme }) => theme.vars.sizes.tooltip};
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  @media ${({ theme }) => theme.media.compact} {
    & > [data-account-name] {
      display: none;
    }
  }
`;
export const AccountInitial = styled.span`
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
  width: ${({ theme }) => theme.spacing.s32};
  height: ${({ theme }) => theme.spacing.s32};
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.readinessSoft};
  color: ${({ theme }) => theme.colors.readiness};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
`;
AccountTrigger.defaultProps = AccountInitial.defaultProps = { theme };
