import { Heading, Text, Choice, Button, Card } from "@/design-system";

import { useState } from "react";
import { Check, Pill, Plus, Trash2 } from "lucide-react";

import type { HealthRecord, HealthTimelineEvent } from "@/lib/api.types";

import { formatDate } from "../healthUtils";
import DeleteMedicationDialog from "./DeleteMedicationDialog";
import AddMedicationDialog, { type MedicationForm } from "./AddMedicationDialog";

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
  prescriptions,
  onSchedule,
  onViewOriginal,
  onCreate,
  onUpdate,
  onDelete,
  addRequested,
  onAddClosed,
}: {
  events: HealthTimelineEvent[];
  prescriptions: HealthRecord[];
  onSchedule: (id: string) => void;
  onViewOriginal: (id: string) => void;
  onCreate: (form: MedicationForm) => Promise<void>;
  onUpdate: (medicationId: string, form: MedicationForm) => Promise<void>;
  onDelete: (medicationId: string) => Promise<void>;
  addRequested: boolean;
  onAddClosed: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<HealthTimelineEvent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HealthTimelineEvent | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusId, setStatusId] = useState<string | null>(null);
  const medications = events.filter(
    (event) => event.eventType === "medication",
  );
  const groups = [
    { title: "Current", items: medications.filter((item) => item.medication?.status !== "stopped") },
    { title: "Past", items: medications.filter((item) => item.medication?.status === "stopped") },
  ];
  return (
    <Card className="lp-health-med-card">
      <div className="lp-health-med-head">
        <Heading level={2} size="sm">
          <Pill aria-hidden="true" focusable="false" size="var(--icon-regular)" /> Medications
        </Heading>
        <Button variant="primary" type="button" onClick={() => setAdding(true)}>
          <Plus aria-hidden="true" focusable="false" size="var(--icon-regular)" /> Add a medicine
        </Button>
      </div>
      {groups.filter((group) => group.items.length).map(({ title, items }) => (
        <section key={title} className="lp-health-med-list">
          <Heading level={3} size="sm">{title}</Heading>
          {items.map((item) => {
            const detail = medicationDetail(item);
            const prescription = prescriptions.find(record => record.id === (item.medication?.sourceDocumentId ?? item.recordId));
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
                  <Button size="sm" variant="tertiary" aria-label={"Schedule reminder for " + item.title} onClick={() => onSchedule(item.id)}>
                    {item.medication?.reminderIds?.length ? "Add another reminder" : "Schedule reminder"}
                  </Button>
                  {prescription && <Button variant="tertiary" size="sm" onClick={() => onViewOriginal(prescription.documentId)}>View prescription</Button>}
                  {item.medication?.route && <Text size="sm">{item.medication.route}</Text>}
                  {item.medication?.instructions && <Text size="sm">{item.medication.instructions}</Text>}
                  {item.medication?.prescribingDoctor && <Text size="sm">{item.medication.prescribingDoctor}</Text>}
                  {(item.medication?.courseStartDate || item.medication?.courseEndDate) && <Text size="sm">
                    {[item.medication.courseStartDate, item.medication.courseEndDate].filter(Boolean).map(date => formatDate(date)).join(" – ")}
                  </Text>}
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
                    {stopped ? "Mark as current" : "Still taking"}
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
                    {stopped ? "Stopped" : "Mark as stopped"}
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
          })}
        </section>
      ))}
      {!medications.length && (
        <>
          <Heading level={3} size="sm">No medicines yet</Heading>
          <Text as="p" size="sm">Medicines arrive from prescriptions you add. You can also add one by hand.</Text>
        </>
      )}
      {adding || addRequested ? (
        <AddMedicationDialog
          prescriptions={prescriptions}
          onClose={() => {
            setAdding(false);
            onAddClosed();
          }}
          onCreate={onCreate}
        />
      ) : null}
      {editing ? (
        <AddMedicationDialog
          prescriptions={prescriptions}
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
    frequency: [...new Set([medication?.frequency, when, mealTiming].filter(Boolean))].join(" · "),
    confirmation: [stoppedLabel, repeatDue].filter(Boolean).join(" · "),
  };
}

function formFromMedication(item: HealthTimelineEvent): MedicationForm {
  const medication = item.medication;
  return {
    route: medication?.route ?? "",
    instructions: medication?.instructions ?? "",
    courseStartDate: medication?.courseStartDate?.slice(0, 10) ?? "",
    courseEndDate: medication?.courseEndDate?.slice(0, 10) ?? "",
    prescribingDoctor: medication?.prescribingDoctor ?? "",
    frequency: medication?.frequency ?? "",
    sourceDocumentId: medication?.sourceDocumentId ?? item.recordId ?? "",
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

export default MedicationSummary;
