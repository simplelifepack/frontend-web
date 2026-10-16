import styled from "styled-components";
import { theme } from "../../variables/theme";
import type { PillTone } from "./types";
export const Status = styled.span<{ $tone: PillTone }>`
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  border-radius: ${({ theme }) => theme.radii.pill};
  padding: ${({ theme }) => theme.spacing.s3} ${({ theme }) => theme.spacing.s9};
  font: ${({ theme }) => theme.typography.weights.bold}
    ${({ theme }) => theme.typography.text.sm} /
    ${({ theme }) => theme.typography.lineHeights.body}
    ${({ theme }) => theme.typography.family};
  color: ${({ theme, $tone }) =>
    ({
      ready: theme.colors.mint,
      warn: theme.colors.warning,
      wax: theme.colors.coral,
      flat: theme.colors.muted,
    })[$tone]};
  background: ${({ theme, $tone }) =>
    ({
      ready: theme.colors.successSoft,
      warn: theme.colors.warningSoft,
      wax: theme.colors.coralSoft,
      flat: theme.colors.mutedSoft,
    })[$tone]};
`;
Status.defaultProps = { theme };
