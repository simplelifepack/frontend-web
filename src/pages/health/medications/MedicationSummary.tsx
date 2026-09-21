import { Stethoscope } from "lucide-react";
import Card from "@/components/Card";
import type { HealthTimelineEvent } from "@/lib/api.types";
import { formatDate } from "../healthUtils";

function MedicationSummary({ events }: { events: HealthTimelineEvent[] }) {
  const medications = events.filter(
    (event) => event.eventType === "medication",
  );
  return (
    <Card>
      <div className="lp-health-card-title">
        <Stethoscope size={17} /> Medications
      </div>
      <div className="lp-health-record-list">
        {medications.length ? (
          medications.map((item) => (
            <div className="lp-health-record-row" key={item.id}>
              <span>
                <b>{item.title}</b>
                <small>{item.detail ?? "Medication recorded"}</small>
                <small>{formatDate(item.occurredAt)}</small>
              </span>
            </div>
          ))
        ) : (
          <p className="lp-health-muted">No medications recorded.</p>
        )}
      </div>
    </Card>
  );
}

export default MedicationSummary;
