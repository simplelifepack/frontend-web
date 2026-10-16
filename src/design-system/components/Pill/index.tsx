import { Status } from "./styles";
import type { PillProps } from "./types";
export function Pill({ tone, children }: PillProps) {
  return <Status $tone={tone}>{children}</Status>;
}
export type { PillProps } from "./types";
