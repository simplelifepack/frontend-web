import styled from "styled-components";
import { theme } from "../../variables/theme";
export const Notifications = styled.div`
  [data-sonner-toaster] {
    z-index: ${({ theme }) => theme.vars.layers.notification};
  }
  --normal-bg: ${({ theme }) => theme.colors.panel};
  --normal-text: ${({ theme }) => theme.colors.text};
  --normal-border: ${({ theme }) => theme.colors.border};
  [data-sonner-toaster] [data-sonner-toast] {
    background: ${({ theme }) => theme.colors.panel};
    color: ${({ theme }) => theme.colors.text};
    border-color: ${({ theme }) => theme.colors.border};
  }
  [data-type="success"] [data-icon] {
    color: ${({ theme }) => theme.colors.success};
  }
  [data-type="error"] [data-icon] {
    color: ${({ theme }) => theme.colors.danger};
  }
  [data-type="warning"] [data-icon] {
    color: ${({ theme }) => theme.colors.warning};
  }
  [data-type="info"] [data-icon] {
    color: ${({ theme }) => theme.colors.info};
  }
  [data-description] {
    color: ${({ theme }) => theme.colors.muted};
  }
  [data-button] {
    background: ${({ theme }) => theme.colors.action};
    color: ${({ theme }) => theme.colors.actionText};
  }
  [data-cancel] {
    background: ${({ theme }) => theme.colors.raised};
    color: ${({ theme }) => theme.colors.text};
  }
`;
Notifications.defaultProps = { theme };
