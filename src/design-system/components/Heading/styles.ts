import styled from "styled-components";
import { theme } from "../../variables/theme";
import type { HeadingSize } from "./types";
export const StyledHeading = styled.h1<{ $size: HeadingSize }>`
  @layer components {
    & {
      margin: 0;
      min-width: 0;
      overflow-wrap: anywhere;
      font-style: normal;
      font-family: ${({ theme }) => theme.typography.family};
      font-size: ${({ theme, $size }) => theme.typography.heading[$size]};
      font-weight: ${({ theme }) => theme.typography.weights.semibold};
      line-height: ${({ theme }) => theme.typography.lineHeights.heading};
      color: ${({ theme }) => theme.colors.heading};
    }
  }
`;
StyledHeading.defaultProps = { theme };
