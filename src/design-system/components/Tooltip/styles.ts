import styled from "styled-components";
import { theme } from "../../variables/theme";
import * as Primitive from "@radix-ui/react-tooltip";
export const Content = styled(Primitive.Content)`
  z-index: ${({ theme }) => theme.vars.layers.tooltip};
  max-width: min(
    ${({ theme }) => theme.vars.sizes.tooltip},
    calc(100vw - 32px)
  );
  border: ${({ theme }) => theme.vars.borderWidths.s1} solid
    ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.small};
  background: ${({ theme }) => theme.colors.panel};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacing.s6}
    ${({ theme }) => theme.spacing.s12};
  font-size: ${({ theme }) => theme.typography.text.sm};
  box-shadow: ${({ theme }) => theme.vars.shadows.panel};
`;
Content.defaultProps = { theme };
