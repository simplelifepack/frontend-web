import { useState } from "react";
import { Plus, Stethoscope } from "lucide-react";
import Card from "@/components/Card";
import type { HealthTimelineEvent } from "@/lib/api.types";
import { formatDate } from "../healthUtils";
import AddMedicationDialog from "./AddMedicationDialog";

function MedicationSummary({
  events,
  onCreate,
}: {
  events: HealthTimelineEvent[];
  onCreate: (form: {
    name: string;
    dose: string;
    frequency: string;
    repeats: boolean;
    runsOutAt: string;
  }) => Promise<void>;
}) {
  const [adding, setAdding] = useState(false);
  const medications = events.filter(
    (event) => event.eventType === "medication",
  );
  return (
    <Card>
      <div className="lp-health-card-title">
        <Stethoscope size={17} /> Medications
        <button type="button" onClick={() => setAdding(true)}>
          <Plus size={14} /> Add medication
        </button>
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
      {adding ? (
        <AddMedicationDialog
          onClose={() => setAdding(false)}
          onCreate={onCreate}
        />
      ) : null}
    </Card>
  );
}

export default MedicationSummary;
