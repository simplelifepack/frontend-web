import { Text } from "@/design-system";
import { Users } from "lucide-react";
import type { HealthOverview } from "@/lib/api.types";

function HealthAttention({
  reminders,
}: {
  reminders: HealthOverview["upcoming"];
}) {
  const needsAttention = reminders.filter(
    (item) => item.status !== "completed",
  ).length;
  return (
    <Text as="div" size="md" className="lp-health-attention">
      <Users aria-hidden="true" focusable="false" size="var(--icon-small)" />{" "}
      {needsAttention
        ? `${needsAttention} ${needsAttention === 1 ? "thing" : "things"} need${needsAttention === 1 ? "s" : ""} attention`
        : "All caught up"}
    </Text>
  );
}

export default HealthAttention;
