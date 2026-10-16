import { Toaster as Sonner } from "sonner";
import { useTheme } from "styled-components";
import { Notifications } from "./styles";
import type { ToasterProps } from "./types";
export function Toaster(props: ToasterProps) {
  const theme = useTheme();
  return (
    <Notifications>
      <Sonner theme={theme.mode} {...props} />
    </Notifications>
  );
}
