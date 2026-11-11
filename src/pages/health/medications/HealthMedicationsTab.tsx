import { useState } from "react";
import { api } from "@/lib/api";
import type { HealthMember, HealthRecord, HealthTimelineEvent } from "@/lib/api.types";
import ReminderDialog from "../overview/ReminderDialog";
import type { MedicationForm } from "./AddMedicationDialog";
import MedicationSummary from "./MedicationSummary";

function details(form: MedicationForm) {
  return {
    route: form.route.trim() || null, instructions: form.instructions.trim() || null,
    courseStartDate: form.courseStartDate || null, courseEndDate: form.courseEndDate || null,
    prescribingDoctor: form.prescribingDoctor.trim() || null, sourceDocumentId: form.sourceDocumentId || null,
  };
}

function HealthMedicationsTab({
  selectedMember,
  timeline,
  records,
  onViewOriginal,
  refreshHealth,
  addRequested,
  onAddClosed,
}: {
  selectedMember: HealthMember;
  timeline: HealthTimelineEvent[];
  records: HealthRecord[];
  onViewOriginal: (id: string) => void;
  refreshHealth: (memberId: string) => Promise<void>;
  addRequested: boolean;
  onAddClosed: () => void;
}) {
  const [reminderMedicineId, setReminderMedicineId] = useState("");
  return (<>
    <MedicationSummary
      prescriptions={records.filter(record => record.type === "prescription")}
      onSchedule={setReminderMedicineId}
      onViewOriginal={onViewOriginal}
      events={timeline}
      addRequested={addRequested}
      onAddClosed={onAddClosed}
      onCreate={async (form) => {
        await api.health.createMedication(selectedMember.id, {
          ...Object.fromEntries(Object.entries(details(form)).filter(([, value]) => value !== null)),
          ...(form.frequency.trim() ? { frequency: form.frequency.trim() } : {}),
          name: form.name.trim(),
          dose: form.dose.trim(),
          whenToTake: form.whenToTake,
          mealTiming: form.mealTiming || "any_time",
          repeatRunsOut: form.repeatRunsOut || null,
        });
        await refreshHealth(selectedMember.id);
      }}
      onUpdate={async (medicationId, form) => {
        await api.health.updateMedication(medicationId, {
          ...details(form),
          frequency: form.frequency.trim() || null,
          name: form.name.trim(),
          dose: form.dose.trim() || null,
          whenToTake: form.whenToTake.length ? form.whenToTake : undefined,
          mealTiming: form.mealTiming || null,
          repeatRunsOut: form.repeatRunsOut || null,
          status: form.status,
          stoppedAt: form.status === "stopped" ? form.stoppedAt || null : null,
        });
        await refreshHealth(selectedMember.id);
      }}
      onDelete={async (medicationId) => {
        await api.health.deleteMedication(medicationId);
        await refreshHealth(selectedMember.id);
      }}
    />
    {reminderMedicineId && <ReminderDialog memberId={selectedMember.id} timeline={timeline} initialMedicationId={reminderMedicineId}
      onClose={() => setReminderMedicineId("")} onSaved={() => refreshHealth(selectedMember.id)} />}
  </>);
}

export default HealthMedicationsTab;
