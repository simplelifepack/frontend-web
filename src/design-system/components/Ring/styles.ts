import styled from "styled-components";
import { theme } from "../../variables/theme";
export const Frame = styled.div<{ $size: number }>`
  position: relative;
  flex-shrink: 0;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
`;
export const Graphic = styled.svg`
  && {
    width: 100%;
    height: 100%;
    display: block;
  }
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
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
`;
Progress.defaultProps = Value.defaultProps = { theme };

/** Native, non-animated linear progress for summaries and checklists. */
export const LinearProgress = styled.progress<{
  $tone?: "success" | "action" | "readiness";
}>`
  appearance: none;
  display: block;
  width: 100%;
  height: ${({ theme }) => theme.spacing.s8};
  overflow: hidden;
  border: none;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.raised};
  color: ${({ theme, $tone = "action" }) => theme.colors[$tone]};
  &::-webkit-progress-bar {
    background: ${({ theme }) => theme.colors.raised};
  }
  &::-webkit-progress-value {
    background: ${({ theme, $tone = "action" }) => theme.colors[$tone]};
  }
  &::-moz-progress-bar {
    background: ${({ theme, $tone = "action" }) => theme.colors[$tone]};
  }
`;
LinearProgress.defaultProps = { theme };
