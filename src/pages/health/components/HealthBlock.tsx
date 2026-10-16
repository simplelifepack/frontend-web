import { Text } from "@/design-system";
import type { ReactNode } from "react";
import { Microscope } from "lucide-react";

function HealthBlock({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="lp-health-block">
      <Text as="div" size="md" weight="semibold" className="lp-health-card-title">
        <Microscope aria-hidden="true" focusable="false" size={17} /> {title} {action}
      </Text>
      {children}
    </section>
  );
}

export default HealthBlock;
