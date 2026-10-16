import { Text, Button, Card } from "@/design-system";

import { Bell, CalendarClock, Check, Plus } from "lucide-react";

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
        <Bell aria-hidden="true" focusable="false" size={17} /> Reminders{" "}
        <Button size="sm" variant="secondary" type="button" onClick={onAdd}>
          <Plus aria-hidden="true" focusable="false" size={14} /> Add
        </Button>
      </div>
      {reminders.length ? (
        <div   className="lp-health-reminder-list">
          {reminders.map((reminder) => (
            <Text as="div" size="md" className="lp-health-reminder" key={reminder.id}>
              <CalendarClock aria-hidden="true" focusable="false" size={17} />
              <span>
                <b>{reminder.title}</b>
                <small>{relativeDate(reminder.dueDate)}</small>
              </span>
              {reminder.status === "completed" ? (
                <i className="lp-health-reminder-status" aria-label="Completed">
                  <Check aria-hidden="true" focusable="false" size={14} />
                </i>
              ) : null}
            </Text>
          ))}
        </div>
      ) : (
        <Text as="p" size="sm" className="lp-health-muted">No upcoming reminders.</Text>
      )}
    </Card>
  );
}

export default ReminderPanel;
