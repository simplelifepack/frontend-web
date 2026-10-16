import { Text } from "@/design-system";
import { T } from "@/constants/theme";

export default function Stamp() {
  return (
    <Text as="div" size="sm" weight="semibold" tone="success"
      style={{ transform: "rotate(-9deg)", border: `2px solid ${T.mint}`, color: T.mint, borderRadius: 7, padding: "3px var(--space-s10)", letterSpacing: 2 }}
    >
      READY
    </Text>
  );
}
