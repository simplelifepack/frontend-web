import { Header } from "./styles";
import { Heading } from "../Heading";
import { Text } from "../Text";
import type { SectionHeadProps } from "./types";
export function SectionHead({ title, sub, action }: SectionHeadProps) {
  return (
    <Header className="lp-section-head">
      <div>
        <Heading level={2} size="lg">
          {title}
        </Heading>
        <Text as="p" tone="muted">
          {sub}
        </Text>
      </div>
      {action}
    </Header>
  );
}
