import {
  Button,
  Text,
  Card,
  Stack,
  Row,
  Heading,
  IconBadge,
} from "@/design-system";

import { Bell, CalendarClock, Check } from "lucide-react";

import { useState } from "react";
import { api } from "@/lib/api";
import ReminderDialog from "./ReminderDialog";
import { displayHealthTime } from "../healthDateTime";
import type { HealthOverview, HealthReminder, HealthTimelineEvent, TrackedHealthMetric } from "@/lib/api.types";
import { relativeDate } from "../healthUtils";

function ReminderPanel({
  reminders, memberId, timeline, tracked, onSaved, onAdd,
}: {
  reminders: HealthOverview["upcoming"];
  memberId: string;
  timeline: HealthTimelineEvent[];
  tracked: TrackedHealthMetric[];
  onSaved: () => Promise<void>;
  onAdd?: () => void;
}) {
  const [editing, setEditing] = useState<HealthReminder | null>(null);
  const [all, setAll] = useState<HealthReminder[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const visible = all ?? reminders;
  async function showAll() {
    setLoading(true);
    setError("");
    try {
      setAll(await api.health.memberReminders(memberId));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Reminders could not be loaded.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <Card role="region" aria-label="Coming up">
      <Stack $gap="s16">
        <Row $justify="space-between">
          <Row $gap="s8">
            <Bell aria-hidden="true" />
            <Heading level={3} size="sm">
              Coming up
            </Heading>
          </Row>
          {onAdd && <Button variant="tertiary" type="button" onClick={onAdd}>Add reminder</Button>}
          <Button variant="tertiary" type="button" loading={loading} onClick={() => all ? setAll(null) : void showAll()}>
            {all ? "Show upcoming" : "Manage reminders"}
          </Button>
        </Row>
        {visible.length ? (
          <Stack $gap="s12">
            {visible.map((reminder) => (
              <Row key={reminder.id} $wrap={false}>
                <IconBadge>
                  <CalendarClock aria-hidden="true" />
                </IconBadge>
                <Stack $grow $gap="s4">
                  <Text weight="medium">{reminder.title}</Text>
                  <Text size="sm" tone="muted">
                    {reminder.dueDate && reminder.timeZone ? displayHealthTime(reminder.dueDate, reminder.timeZone)
                      : reminder.dueDate ? relativeDate(reminder.dueDate) : "No upcoming occurrence"}
                  </Text>
                  {reminder.notes && <Text size="sm">{reminder.notes}</Text>}
                </Stack>
                <Button variant="tertiary" size="sm" aria-label={"Edit " + reminder.title} onClick={() => setEditing(reminder)}>Edit</Button>
                {reminder.status === "completed" ? (
                  <Check aria-label="Completed" />
                ) : null}
              </Row>
            ))}
          </Stack>
        ) : (
          <Text as="p" tone="muted">
            No upcoming reminders.
          </Text>
        )}
        {error && <Text role="alert" tone="danger">{error}</Text>}
      </Stack>
      {editing && <ReminderDialog memberId={memberId} timeline={timeline} tracked={tracked} reminder={editing}
        onClose={() => setEditing(null)} onSaved={async () => {
          await onSaved();
          if (all) await showAll();
        }} />}
    </Card>
  );
}
export default ReminderPanel;
