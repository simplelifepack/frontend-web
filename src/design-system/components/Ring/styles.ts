import styled from "styled-components";
import { theme } from "../../variables/theme";
export const Frame = styled.div<{ $size: number }>`
  position: relative;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
`;
export const Graphic = styled.svg`
  transform: rotate(-90deg);
`;
export const Progress = styled.circle`
  transition: stroke-dashoffset ${({ theme }) => theme.vars.motion.ring};
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;
export const Value = styled.div<{ $large: boolean }>`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: ${({ theme }) => theme.colors.heading};
  font-family: ${({ theme }) => theme.typography.family};
  font-size: ${({ theme, $large }) =>
    $large ? theme.typography.text.lg : theme.typography.text.sm};
  font-variant-numeric: tabular-nums;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
`;
Progress.defaultProps = Value.defaultProps = { theme };
