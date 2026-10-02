import { api } from "@/lib/api";
import type { HealthMember, HealthTimelineEvent } from "@/lib/api.types";
import MedicationSummary from "./MedicationSummary";

function HealthMedicationsTab({
  selectedMember,
  timeline,
  refreshHealth,
}: {
  selectedMember: HealthMember;
  timeline: HealthTimelineEvent[];
  refreshHealth: (memberId: string) => Promise<void>;
}) {
  return (
    <MedicationSummary
      events={timeline}
      onCreate={async (form) => {
        await api.health.createMedication(selectedMember.id, {
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
          name: form.name.trim(),
          dose: form.dose.trim() || null,
          whenToTake: form.whenToTake,
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
  );
}

export default HealthMedicationsTab;
