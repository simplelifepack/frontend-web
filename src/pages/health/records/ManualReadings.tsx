import { useState } from "react";
import { Button, Card, Heading, Row, Stack, Text } from "@/design-system";
import type { HealthMeasurement, HealthMember } from "@/lib/api.types";
import { ReadingDialog } from "../HealthDialog.ReadingDialog";
import { displayHealthTime } from "../healthDateTime";
import { formatDate } from "../healthUtils";

export default function ManualReadings({ member, measurements, onSaved }: {
  member: HealthMember;
  measurements: HealthMeasurement[];
  onSaved: () => Promise<void>;
}) {
  const [editing, setEditing] = useState<HealthMeasurement | null>(null);
  const readings = measurements.filter(item => item.sourceType === "manual" && !item.sourceDocumentId);
  if (!readings.length) return null;
  return <Card>
    <Stack $gap="s12">
      <Heading level={2} size="sm">Manual readings</Heading>
      {readings.map(reading => <Row key={reading.id} $justify="space-between">
        <Stack $gap="s4">
          <Text weight="semibold">{reading.displayName} · {reading.value}{reading.secondaryValue == null ? "" : "/" + reading.secondaryValue} {reading.unit}</Text>
          <Text size="sm" tone="muted">
            {reading.measuredAt && reading.timeZone ? displayHealthTime(reading.measuredAt, reading.timeZone) : formatDate(reading.measuredAt)}
            {reading.source ? " · " + reading.source : ""}
          </Text>
          {reading.notes && <Text size="sm">{reading.notes}</Text>}
        </Stack>
        <Button variant="tertiary" onClick={() => setEditing(reading)} aria-label={"Edit " + reading.displayName + " reading"}>Edit</Button>
      </Row>)}
    </Stack>
    {editing && <ReadingDialog member={member} measurements={measurements} reading={editing} onClose={() => setEditing(null)} onSaved={onSaved} />}
  </Card>;
}
