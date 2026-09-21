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
    <div className="lp-health-attention">
      <Users size={16} />{" "}
      {needsAttention
        ? `${needsAttention} ${needsAttention === 1 ? "thing" : "things"} need${needsAttention === 1 ? "s" : ""} attention`
        : "All caught up"}
    </div>
  );
}

export default HealthAttention;
