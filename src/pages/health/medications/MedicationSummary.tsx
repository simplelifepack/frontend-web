import { Heading, Text, Choice, ModalBackdrop, ModalPanel, Button, Card } from "@/design-system";

import { useState } from "react";
import { Check, Pill, Plus, Trash2 } from "lucide-react";

import type { HealthTimelineEvent } from "@/lib/api.types";

import { formatDate } from "../healthUtils";
import AddMedicationDialog from "./AddMedicationDialog";

type MedicationForm = {
  name: string;
  dose: string;
  whenToTake: Array<"morning" | "afternoon" | "night">;
  mealTiming: "before_food" | "after_food" | "with_food" | "any_time" | "";
  repeatRunsOut: string;
  status: "continuing" | "stopped";
  stoppedAt: string;
};

const timeLabels: Record<"morning" | "afternoon" | "night", string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  night: "Night",
};
const mealLabels: Record<"before_food" | "after_food" | "with_food" | "any_time", string> = {
  before_food: "Before Food",
  after_food: "After Food",
  with_food: "With Food",
  any_time: "Any Time",
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
        <Heading level={2} size="sm">
          <Pill aria-hidden="true" focusable="false" size="var(--icon-regular)" /> Current medications
        </Heading>
        <Button variant="primary" type="button" onClick={() => setAdding(true)}>
          <Plus aria-hidden="true" focusable="false" size="var(--icon-regular)" /> Add
        </Button>
      </div>
      <div   className="lp-health-med-list">
        {medications.length ? (
          medications.map((item) => {
            const detail = medicationDetail(item);
            const stopped = item.medication?.status === "stopped";
            return (
              <div className={`lp-health-med-row${stopped ? " stopped" : ""}`} key={item.id}>
                <Button size="sm" iconOnly variant="tertiary"
                  type="button"
                  aria-label={`Edit ${item.title}`}
                  onClick={() => setEditing(item)}
                >
                  <Pill aria-hidden="true" focusable="false" size="var(--icon-regular)" />
                </Button>
                <span className="lp-health-med-main">
                  <Text as="b" size="md" weight="semibold">
                    {item.title}
                    {detail.dose ? <em>{detail.dose}</em> : null}
                  </Text>
                </span>
                <Text size="md" className="lp-health-med-frequency">{detail.frequency || "Not set"}</Text>
                <Text size="md" className="lp-health-med-confirmation">{detail.confirmation}</Text>
                <span className="lp-health-med-actions">
                  <Choice aria-pressed={!stopped}
                    type="button"

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
                    {!stopped ? <Check aria-hidden="true" focusable="false" size={14} /> : null}
                    Still taking
                  </Choice>
                  <Choice aria-pressed={stopped}
                    type="button"

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
                  </Choice>
                </span>
                <Button size="sm" tone="danger" iconOnly variant="tertiary"
                  type="button"
                  aria-label={`Delete ${item.title}`}
                  disabled={deletingId === item.id}
                  onClick={() => setDeleteTarget(item)}
                >
                  <Trash2 aria-hidden="true" focusable="false" size="var(--icon-regular)" />
                </Button>
              </div>
            );
          })
        ) : (
          <Text as="p" size="sm" className="lp-health-muted">No medications recorded.</Text>
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
  const when = medication?.whenToTake?.length ? medication.whenToTake.map((item) => timeLabels[item]).join(", ") : medication?.frequency ?? "";
  const mealTiming = medication?.mealTiming ? mealLabels[medication.mealTiming] : "";
  return {
    dose: medication?.dose ?? "",
    frequency: [when, mealTiming].filter(Boolean).join(" · "),
    confirmation: [stoppedLabel, repeatDue].filter(Boolean).join(" · "),
  };
}

function formFromMedication(item: HealthTimelineEvent): MedicationForm {
  const medication = item.medication;
  return {
    name: medication?.name ?? item.title,
    dose: medication?.dose ?? "",
    whenToTake: medication?.whenToTake?.length ? medication.whenToTake : inferWhenToTake(medication?.frequency),
    mealTiming: medication?.mealTiming ?? inferMealTiming(medication?.frequency),
    repeatRunsOut: (medication?.repeatRunsOut ?? medication?.runsOutAt)?.slice(0, 10) ?? "",
    status: medication?.status === "stopped" ? "stopped" : "continuing",
    stoppedAt: medication?.stoppedAt?.slice(0, 10) ?? "",
  };
}

function inferWhenToTake(frequency: string | null | undefined): Array<"morning" | "afternoon" | "night"> {
  if (!frequency) return [];
  const text = frequency.toLowerCase();
  return (["morning", "afternoon", "night"] as const).filter((item) => new RegExp(`\\b${item}\\b`, "i").test(text));
}

function inferMealTiming(frequency: string | null | undefined): MedicationForm["mealTiming"] {
  if (!frequency) return "";
  const text = frequency.toLowerCase();
  if (/\bbefore\s+(food|meal|meals)\b/.test(text)) return "before_food";
  if (/\bafter\s+(food|meal|meals)\b/.test(text)) return "after_food";
  if (/\bwith\s+(food|meal|meals)\b/.test(text)) return "with_food";
  if (/\bany\s*time\b/.test(text)) return "any_time";
  return "";
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
    <ModalBackdrop  style={{ zIndex: "var(--layer-nestedDialog)" }}>
      <ModalPanel onDismiss={onClose} className="lp-health-add-dialog" role="dialog" aria-modal="true" aria-label="Delete medication">
        <header className="lp-health-dialog-head">
          <div>
            <Heading level={2} size="md">Delete medication?</Heading>
            <Text as="p" size="md">{medicationName} will be permanently removed from this Health profile.</Text>
          </div>
        </header>
        <footer>
          <Button variant="secondary" type="button" disabled={deleting} onClick={onClose}>
            Cancel
          </Button>
          <Button tone="danger" variant="primary" type="button" disabled={deleting} onClick={() => void onConfirm()}>
            {deleting ? "Deleting..." : "Delete medication"}
          </Button>
        </footer>
      </ModalPanel>
    </ModalBackdrop>
  );
}

export default MedicationSummary;
