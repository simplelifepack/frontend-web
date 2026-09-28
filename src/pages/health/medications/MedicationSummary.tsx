import { useState } from "react";
import { Check, Pill, Plus, Trash2 } from "lucide-react";
import Card from "@/components/Card";
import type { HealthTimelineEvent } from "@/lib/api.types";
import { btnGhost } from "@/constants/theme";
import { formatDate } from "../healthUtils";
import AddMedicationDialog from "./AddMedicationDialog";

type MedicationForm = {
  name: string;
  dose: string;
  frequency: string;
  duration: string;
  quantity: string;
  repeats: boolean;
  runsOutAt: string;
  status: "continuing" | "stopped";
  stoppedAt: string;
};

function MedicationSummary({
  events,
  onCreate,
  onUpdate,
  onDelete,
}: {
  events: HealthTimelineEvent[];
  onCreate: (form: MedicationForm) => Promise<void>;
  onUpdate: (medicationId: string, form: MedicationForm) => Promise<void>;
  onDelete: (medicationId: string) => Promise<void>;
}) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<HealthTimelineEvent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HealthTimelineEvent | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusId, setStatusId] = useState<string | null>(null);
  const medications = events.filter(
    (event) => event.eventType === "medication",
  );
  return (
    <Card className="lp-health-med-card">
      <div className="lp-health-med-head">
        <h2>
          <Pill size={18} /> Current medications
        </h2>
        <button type="button" onClick={() => setAdding(true)}>
          <Plus size={18} /> Add
        </button>
      </div>
      <div className="lp-health-med-list">
        {medications.length ? (
          medications.map((item) => {
            const detail = medicationDetail(item);
            const stopped = item.medication?.status === "stopped";
            return (
              <div className={`lp-health-med-row${stopped ? " stopped" : ""}`} key={item.id}>
                <button
                  type="button"
                  className="lp-health-med-icon"
                  aria-label={`Edit ${item.title}`}
                  onClick={() => setEditing(item)}
                >
                  <Pill size={18} />
                </button>
                <span className="lp-health-med-main">
                  <b>
                    {item.title}
                    {detail.dose ? <em>{detail.dose}</em> : null}
                  </b>
                </span>
                <span className="lp-health-med-frequency">{detail.frequency || "Not set"}</span>
                <span className="lp-health-med-confirmation">{detail.confirmation}</span>
                <span className="lp-health-med-actions">
                  <button
                    type="button"
                    className={`lp-health-med-status${stopped ? "" : " active"}`}
                    disabled={statusId === item.id}
                    onClick={async () => {
                      if (!stopped) return;
                      setStatusId(item.id);
                      try {
                        await onUpdate(item.id, {
                          ...formFromMedication(item),
                          status: "continuing",
                          stoppedAt: "",
                        });
                      } finally {
                        setStatusId(null);
                      }
                    }}
                  >
                    {!stopped ? <Check size={14} /> : null}
                    Still taking
                  </button>
                  <button
                    type="button"
                    className={`lp-health-med-status${stopped ? " active" : ""}`}
                    disabled={statusId === item.id}
                    onClick={async () => {
                      if (stopped) return;
                      setStatusId(item.id);
                      try {
                        await onUpdate(item.id, {
                          ...formFromMedication(item),
                          status: "stopped",
                          stoppedAt: today(),
                        });
                      } finally {
                        setStatusId(null);
                      }
                    }}
                  >
                    Stopped
                  </button>
                </span>
                <button
                  type="button"
                  className="lp-health-med-delete"
                  aria-label={`Delete ${item.title}`}
                  disabled={deletingId === item.id}
                  onClick={() => setDeleteTarget(item)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })
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
      {editing ? (
        <AddMedicationDialog
          onClose={() => setEditing(null)}
          initialMedication={formFromMedication(editing)}
          onCreate={async (form) => {
            await onUpdate(editing.id, form);
          }}
        />
      ) : null}
      {deleteTarget ? (
        <DeleteMedicationDialog
          deleting={deletingId === deleteTarget.id}
          medicationName={deleteTarget.title}
          onClose={() => setDeleteTarget(null)}
          onConfirm={async () => {
            setDeletingId(deleteTarget.id);
            try {
              await onDelete(deleteTarget.id);
              setDeleteTarget(null);
            } finally {
              setDeletingId(null);
            }
          }}
        />
      ) : null}
    </Card>
  );
}

function medicationDetail(item: HealthTimelineEvent) {
  const medication = item.medication;
  const stoppedLabel =
    item.medication?.status === "stopped"
      ? `Stopped${item.medication.stoppedAt ? ` ${formatDate(item.medication.stoppedAt)}` : ""}`
      : "Not confirmed";
  const repeatDue = medication?.runsOutAt ? `repeat due ${formatDate(medication.runsOutAt)}` : "";
  return {
    dose: medication?.dose ?? "",
    frequency: medication?.frequency ?? "",
    confirmation: [stoppedLabel, repeatDue].filter(Boolean).join(" · "),
  };
}

function formFromMedication(item: HealthTimelineEvent): MedicationForm {
  const medication = item.medication;
  return {
    name: medication?.name ?? item.title,
    dose: medication?.dose ?? "",
    frequency: medication?.frequency ?? "",
    duration: medication?.duration ?? "",
    quantity: medication?.quantity ?? "",
    repeats: Boolean(medication?.repeats),
    runsOutAt: medication?.runsOutAt?.slice(0, 10) ?? "",
    status: medication?.status === "stopped" ? "stopped" : "continuing",
    stoppedAt: medication?.stoppedAt?.slice(0, 10) ?? "",
  };
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function DeleteMedicationDialog({
  deleting,
  medicationName,
  onClose,
  onConfirm,
}: {
  deleting: boolean;
  medicationName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  return (
    <div className="lp-modal-backdrop" style={{ zIndex: 90 }}>
      <div className="lp-modal-panel lp-health-add-dialog" role="dialog" aria-modal="true" aria-label="Delete medication">
        <header className="lp-health-dialog-head">
          <div>
            <h2>Delete medication?</h2>
            <p>{medicationName} will be permanently removed from this Health profile.</p>
          </div>
        </header>
        <footer>
          <button type="button" style={btnGhost} disabled={deleting} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="lp-health-danger-button" disabled={deleting} onClick={() => void onConfirm()}>
            {deleting ? "Deleting..." : "Delete medication"}
          </button>
        </footer>
      </div>
    </div>
  );
}

export default MedicationSummary;
