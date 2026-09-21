import { Bell, CalendarClock, Check, Plus } from "lucide-react";
import Card from "@/components/Card";
import type { HealthOverview } from "@/lib/api.types";
import { relativeDate } from "../healthUtils";

function ReminderPanel({
  reminders,
  onAdd,
}: {
  reminders: HealthOverview["upcoming"];
  onAdd: () => void;
}) {
  return (
    <Card className="lp-health-reminders-card">
      <div className="lp-health-card-title">
        <Bell size={17} /> Reminders{" "}
        <button type="button" onClick={onAdd}>
          <Plus size={14} /> Add
        </button>
      </div>
      {reminders.length ? (
        <div className="lp-health-reminder-list">
          {reminders.map((reminder) => (
            <div className="lp-health-reminder" key={reminder.id}>
              <CalendarClock size={17} />
              <span>
                <b>{reminder.title}</b>
                <small>{relativeDate(reminder.dueDate)}</small>
              </span>
              {reminder.status === "completed" ? (
                <i className="lp-health-reminder-status" aria-label="Completed">
                  <Check size={14} />
                </i>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="lp-health-muted">No upcoming reminders.</p>
      )}
    </Card>
  );
}

export default ReminderPanel;
