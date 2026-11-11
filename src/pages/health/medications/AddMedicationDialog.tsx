import { Heading, Text, ChoiceGroup, Choice, ModalBackdrop, ModalPanel, Input, Button, SelectMenu, Textarea } from "@/design-system";

import { useState } from "react";
import { X } from "lucide-react";

import type { HealthRecord } from "@/lib/api.types";

export type MedicationForm = {
  route: string;
  instructions: string;
  courseStartDate: string;
  courseEndDate: string;
  prescribingDoctor: string;
  frequency: string;
  sourceDocumentId: string;
  name: string;
  dose: string;
  whenToTake: MedicationTime[];
  mealTiming: MealTiming | "";
  repeatRunsOut: string;
  status: "continuing" | "stopped";
  stoppedAt: string;
};
type MedicationTime = "morning" | "afternoon" | "night";
type MealTiming = "before_food" | "after_food" | "with_food" | "any_time";

const timeOptions: Array<{ value: MedicationTime; label: string }> = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "night", label: "Night" },
];
const mealOptions: Array<{ value: MealTiming; label: string }> = [
  { value: "before_food", label: "Before Food" },
  { value: "after_food", label: "After Food" },
  { value: "with_food", label: "With Food" },
  { value: "any_time", label: "Any Time" },
];

function AddMedicationDialog({
  onClose,
  onCreate,
  initialMedication,
  prescriptions,
}: {
  onClose: () => void;
  onCreate: (form: MedicationForm) => Promise<void>;
  initialMedication?: MedicationForm;
  prescriptions: HealthRecord[];
}) {
  const editing = Boolean(initialMedication);
  const [form, setForm] = useState<MedicationForm>(
    initialMedication ?? {
      route: "", instructions: "", courseStartDate: "", courseEndDate: "",
      prescribingDoctor: "", frequency: "", sourceDocumentId: "",
      name: "",
      dose: "",
      whenToTake: [],
      mealTiming: "",
      repeatRunsOut: "",
      status: "continuing",
      stoppedAt: "",
    },
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isValid = form.name.trim() && (editing || Boolean(form.dose.trim() && form.whenToTake.length && form.mealTiming));
  const update = <K extends keyof MedicationForm>(key: K, value: MedicationForm[K]) =>
    setForm((current) => ({ ...current, [key]: value }));
  const toggleTime = (value: MedicationTime) =>
    setForm((current) => ({
      ...current,
      whenToTake: current.whenToTake.includes(value)
        ? current.whenToTake.filter((item) => item !== value)
        : [...current.whenToTake, value],
    }));
  const submit = async () => {
    if (!isValid) {
      setError(editing ? "Name is required." : "Name, dose, when to take it, and meal timing are required.");
      return;
    }
    if (form.courseStartDate && form.courseEndDate && form.courseEndDate < form.courseStartDate) {
      setError("Course end date must be on or after the start date.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onCreate(form);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : editing ? "Medication could not be saved." : "Medication could not be added.");
      setSaving(false);
    }
  };
  return (
    <ModalBackdrop  style={{ zIndex: "var(--layer-nestedDialog)" }}>
      <ModalPanel onDismiss={onClose} className="lp-health-add-dialog lp-health-medication-dialog" role="dialog" aria-modal="true" aria-label={editing ? "Edit medication" : "Add medication"}>
        <header className="lp-health-dialog-head lp-health-medication-head">
          <div>
            <Heading level={2} size="md">{editing ? "Edit medication" : "Add medication"}</Heading>
            <Text as="p" size="md">{editing ? "Correct the saved medication details." : "Save this medication to the selected Health profile."}</Text>
          </div>
          <Button size="sm" iconOnly variant="tertiary" type="button" onClick={onClose} aria-label="Close">
            <X aria-hidden="true" focusable="false" size="var(--icon-regular)" />
          </Button>
        </header>
        <div className="lp-health-form-grid lp-health-medication-form">
          <Text as="label" size="sm" weight="medium" className="lp-health-med-name">
            <span>Name</span>
            <Input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="e.g. Metformin" />
          </Text>
          <Text as="label" size="sm" weight="medium" className="lp-health-med-dose">
            <span>Dose</span>
            <Input value={form.dose} onChange={(event) => update("dose", event.target.value)} placeholder="500 mg" />
          </Text>
          <fieldset className="lp-health-med-when">
            <Text size="md">When to take it</Text>
            <ChoiceGroup  aria-label="When to take it">
              {timeOptions.map((option) => (
                <Choice key={option.value} type="button" aria-pressed={form.whenToTake.includes(option.value)} onClick={() => toggleTime(option.value)}>
                  {option.label}
                </Choice>
              ))}
            </ChoiceGroup>
          </fieldset>
          <Text as="label" size="sm" weight="medium" className="lp-health-med-repeat">
            <span>Repeat runs out</span>
            <Input type="date" value={form.repeatRunsOut} onChange={(event) => update("repeatRunsOut", event.target.value)} placeholder="dd/mm/yyyy" />
          </Text>
          <fieldset className="lp-health-med-meals">
            <Text size="md">With meals</Text>
            <ChoiceGroup  aria-label="With meals">
              {mealOptions.map((option) => (
                <Choice key={option.value} type="button" aria-pressed={form.mealTiming === option.value} onClick={() => update("mealTiming", option.value)}>
                  {option.label}
                </Choice>
              ))}
            </ChoiceGroup>
          </fieldset>
          <Text as="label" size="sm" weight="medium">Frequency (optional)
            <Input maxLength={160} value={form.frequency} onChange={event => update("frequency", event.target.value)} placeholder="e.g. Twice daily" />
          </Text>
          <Text as="label" size="sm" weight="medium">Route (optional)
            <Input value={form.route} onChange={event => update("route", event.target.value)} placeholder="e.g. Oral" />
          </Text>
          <Text as="label" size="sm" weight="medium">Course start (optional)
            <Input type="date" value={form.courseStartDate} onChange={event => update("courseStartDate", event.target.value)} />
          </Text>
          <Text as="label" size="sm" weight="medium">Course end (optional)
            <Input type="date" min={form.courseStartDate || undefined} value={form.courseEndDate} onChange={event => update("courseEndDate", event.target.value)} />
          </Text>
          <Text as="label" size="sm" weight="medium">Prescribing doctor (optional)
            <Input value={form.prescribingDoctor} onChange={event => update("prescribingDoctor", event.target.value)} />
          </Text>
          <Text as="label" size="sm" weight="medium">Prescription (optional)
            <SelectMenu aria-label="Prescription" value={form.sourceDocumentId} onValueChange={value => update("sourceDocumentId", value)}
              options={[
                { value: "", label: "No prescription" },
                ...prescriptions.map(record => ({ value: record.id, label: ["Prescription", record.doctor, record.documentDate].filter(Boolean).join(" · ") })),
              ]} />
          </Text>
          <Text as="label" size="sm" weight="medium">Instructions (optional)
            <Textarea value={form.instructions} onChange={event => update("instructions", event.target.value)} />
          </Text>
        </div>
        {error ? <Text as="div" size="sm" weight="semibold" className="lp-health-form-error" tone="danger" role="alert">{error}</Text> : null}
        <footer>
          <Button variant="secondary" type="button" disabled={saving} onClick={onClose}>Cancel</Button>
          <Button loading={saving} variant="primary" type="button" disabled={saving || !isValid} onClick={submit}>
            {saving ? (editing ? "Saving..." : "Adding...") : editing ? "Save changes" : "Add medication"}
          </Button>
        </footer>
      </ModalPanel>
    </ModalBackdrop>
  );
}

export default AddMedicationDialog;
