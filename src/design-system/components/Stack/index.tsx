import styled from "styled-components";
import { theme } from "../../variables/theme";
import type { spacing } from "../../variables/spacing";

/** Content spacing belongs to the layout, independently of text/control margins. */
export const Stack = styled.div<{ $gap?: keyof typeof spacing }>`
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: ${({ theme, $gap = "s12" }) => theme.spacing[$gap]};
`;
Stack.defaultProps = { theme };
