import {
  Text,
  Button,
  Card,
  Stack,
  Row,
  Heading,
  IconBadge,
} from "@/design-system";

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
    <Card role="region" aria-label="Reminders">
      <Stack $gap="s16">
        <Row $justify="space-between">
          <Row $gap="s8">
            <Bell aria-hidden="true" />
            <Heading level={3} size="sm">
              Reminders
            </Heading>
          </Row>
          <Button size="sm" variant="secondary" type="button" onClick={onAdd}>
            <Plus aria-hidden="true" />
            Add
          </Button>
        </Row>
        {reminders.length ? (
          <Stack $gap="s12">
            {reminders.map((reminder) => (
              <Row key={reminder.id} $wrap={false}>
                <IconBadge>
                  <CalendarClock aria-hidden="true" />
                </IconBadge>
                <Stack $grow $gap="s4">
                  <Text weight="medium">{reminder.title}</Text>
                  <Text size="sm" tone="muted">
                    {relativeDate(reminder.dueDate)}
                  </Text>
                </Stack>
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
      </Stack>
    </Card>
  );
}
export default ReminderPanel;
