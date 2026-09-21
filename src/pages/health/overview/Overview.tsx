import { CalendarClock, FileText } from "lucide-react";
import Card from "@/components/Card";
import type { HealthOverview, HealthRecord } from "@/lib/api.types";
import { btnGold, T } from "@/constants/theme";
import { formatDate, relativeDate } from "../healthUtils";
import MetricInsight from "./MetricInsight";
import MetricCards from "./MetricCards";
import ReminderPanel from "./ReminderPanel";
import HealthReadiness from "./HealthReadiness";
import EmptyTracked from "./EmptyTracked";

function Overview({
  overview,
  records,
  onTrack,
  onReminder,
  onEdit,
  onVisit,
}: {
  onReminder: () => void;
  onEdit: () => void;
  onVisit: () => void;
  overview: HealthOverview | null;
  records: HealthRecord[];
  onTrack: () => void;
}) {
  const upcoming = overview?.upcoming ?? [];
  return (
    <>
      {upcoming[0] ? (
        <Card style={{ marginBottom: 16, padding: "13px 16px" }}>
          <div className="lp-health-event">
            <CalendarClock size={18} color={T.gold} />
            <div>
              <b>{upcoming[0].title}</b>
              <small>
                {formatDate(upcoming[0].dueDate)} ·{" "}
                {relativeDate(upcoming[0].dueDate)}
              </small>
            </div>
            <button type="button" style={btnGold} onClick={onVisit}>
              <FileText size={15} /> Prepare for visit
            </button>
          </div>
        </Card>
      ) : null}
      <MetricInsight tracked={overview?.trackedMetrics ?? []} />
      {overview?.trackedMetrics.length ? (
        <MetricCards tracked={overview.trackedMetrics} />
      ) : (
        <EmptyTracked onTrack={onTrack} />
      )}
      <div className="lp-two-col lp-health-overview-bottom">
        <ReminderPanel reminders={upcoming} onAdd={onReminder} />
        <HealthReadiness
          member={overview?.member}
          records={records}
          onRecords={onEdit}
        />
      </div>
    </>
  );
}

export default Overview;
