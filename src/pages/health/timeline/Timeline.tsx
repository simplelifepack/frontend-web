import { CalendarClock, Microscope, Stethoscope } from "lucide-react";
import Card from "@/components/Card";
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
      <div className="lp-health-card-title">
        <CalendarClock size={17} /> Health timeline
      </div>
      {groups.length ? (
        groups.map((group) => (
          <section className="lp-health-timeline-group" key={group.month}>
            <h3>{group.month}</h3>
            <div className="lp-health-timeline-events">
              {group.events.map((event) => (
                <div
                  className="lp-health-timeline-event"
                  key={`${event.eventType}:${event.id}`}
                >
                  <i aria-hidden="true" />
                  <span className="lp-health-timeline-icon">
                    {event.eventType === "measurement" ? (
                      <Microscope size={16} />
                    ) : (
                      <Stethoscope size={16} />
                    )}
                  </span>
                  <div>
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
                      · {event.source}
                    </small>
                    {event.detail ? <small>{event.detail}</small> : null}
                  </div>
                  <time>{formatDate(event.occurredAt)}</time>
                </div>
              ))}
            </div>
          </section>
        ))
      ) : (
        <p className="lp-health-muted">No health events recorded yet.</p>
      )}
    </Card>
  );
}

export default Timeline;
