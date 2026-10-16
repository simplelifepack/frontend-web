import { Heading, Text, Card } from "@/design-system";

import { Activity, Stethoscope } from "lucide-react";

import type { HealthTimelineEvent } from "@/lib/api.types";
import { formatDate, formatMonthYear } from "../healthUtils";

function Timeline({ events }: { events: HealthTimelineEvent[] }) {
  const groups = events.reduce<
    Array<{ month: string; events: HealthTimelineEvent[] }>
  >((current, event) => {
    const month = formatMonthYear(event.occurredAt);
    const group = current[current.length - 1];
    if (group?.month === month) group.events.push(event);
    else current.push({ month, events: [event] });
    return current;
  }, []);
  return (
    <Card className="lp-health-timeline">
      {groups.length ? (
        groups.map((group) => (
          <section className="lp-health-timeline-group" key={group.month}>
            <Heading level={3} size="sm">{group.month}</Heading>
            <div   className="lp-health-timeline-events">
              {group.events.map((event) => (
                <div
                  className="lp-health-timeline-event"
                  key={`${event.eventType}:${event.id}`}
                >
                  <i aria-hidden="true" />
                  <Text size="md" className="lp-health-timeline-icon">
                    {event.eventType === "measurement" ? (
                      <Activity aria-hidden="true" focusable="false" size="var(--icon-small)" />
                    ) : (
                      <Stethoscope aria-hidden="true" focusable="false" size="var(--icon-small)" />
                    )}
                  </Text>
                  <Text as="div" size="md">
                    <b>
                      {event.title}
                      {event.value != null
                        ? ` ${event.value}${event.secondaryValue != null ? `/${event.secondaryValue}` : ""} ${event.unit ?? ""}`
                        : ""}
                    </b>
                    <small>
                      {event.eventType === "measurement"
                        ? "Reading"
                        : "Medication"}{" "}
                      · {event.eventType === "measurement" ? "Reading logged" : event.source}
                    </small>
                    {event.detail ? <small>{event.detail}</small> : null}
                  </Text>
                  <time>{formatDate(event.occurredAt)}</time>
                </div>
              ))}
            </div>
          </section>
        ))
      ) : (
        <Text as="p" size="sm" className="lp-health-muted">No health events recorded yet.</Text>
      )}
    </Card>
  );
}

export default Timeline;
