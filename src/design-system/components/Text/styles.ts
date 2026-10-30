import styled from "styled-components";
import { theme } from "../../variables/theme";
import type { TextSize, TextWeight, TextTone } from "./types";
export const StyledText = styled.span<{
  $size: TextSize;
  $weight: TextWeight;
  $tone: TextTone;
}>`
  @layer components {
    & {
      margin: 0;
      min-width: 0;
      overflow-wrap: anywhere;
      font-style: normal;
      font-family: ${({ theme }) => theme.typography.family};
      font-size: ${({ theme, $size }) => theme.typography.text[$size]};
      font-weight: ${({ theme, $weight }) => theme.typography.weights[$weight]};
      line-height: ${({ theme }) => theme.typography.lineHeights.body};
      color: ${({ theme, $tone }) =>
        ({
          default: theme.colors.text,
          muted: theme.colors.muted,
          danger: theme.colors.coral,
          success: theme.colors.mint,
          heading: theme.colors.heading,
        })[$tone]};
      & strong,
      & b {
        font-weight: ${({ theme }) => theme.typography.weights.semibold};
      }
      & em {
        font-style: normal;
      }
    }
  }
`;
StyledText.defaultProps = { theme };
