import { useState } from "react";
import { X } from "lucide-react";
import { btnGhost, btnPrimary } from "@/constants/theme";

type MedicationForm = {
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
}: {
  onClose: () => void;
  onCreate: (form: MedicationForm) => Promise<void>;
  initialMedication?: MedicationForm;
}) {
  const editing = Boolean(initialMedication);
  const [form, setForm] = useState<MedicationForm>(
    initialMedication ?? {
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
  const isValid = form.name.trim() && form.dose.trim() && form.whenToTake.length > 0 && form.mealTiming;
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
      setError("Name, dose, when to take it, and meal timing are required.");
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
    <div className="lp-modal-backdrop" style={{ zIndex: 90 }}>
      <div className="lp-modal-panel lp-health-add-dialog lp-health-medication-dialog" role="dialog" aria-modal="true" aria-label={editing ? "Edit medication" : "Add medication"}>
        <header className="lp-health-dialog-head lp-health-medication-head">
          <div>
            <h2>{editing ? "Edit medication" : "Add medication"}</h2>
            <p>{editing ? "Correct the saved medication details." : "Save this medication to the selected Health profile."}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>
        <div className="lp-health-form-grid lp-health-medication-form">
          <label className="lp-health-med-name">
            <span>Name</span>
            <input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="e.g. Metformin" />
          </label>
          <label className="lp-health-med-dose">
            <span>Dose</span>
            <input value={form.dose} onChange={(event) => update("dose", event.target.value)} placeholder="500 mg" />
          </label>
          <fieldset className="lp-health-med-when">
            <span>When to take it</span>
            <div className="lp-health-segmented" aria-label="When to take it">
              {timeOptions.map((option) => (
                <button key={option.value} type="button" className={form.whenToTake.includes(option.value) ? "selected" : ""} onClick={() => toggleTime(option.value)}>
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="lp-health-med-repeat">
            <span>Repeat runs out</span>
            <input type="date" value={form.repeatRunsOut} onChange={(event) => update("repeatRunsOut", event.target.value)} placeholder="dd/mm/yyyy" />
          </label>
          <fieldset className="lp-health-med-meals">
            <span>With meals</span>
            <div className="lp-health-segmented" aria-label="With meals">
              {mealOptions.map((option) => (
                <button key={option.value} type="button" className={form.mealTiming === option.value ? "selected" : ""} onClick={() => update("mealTiming", option.value)}>
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>
          <p className="lp-health-med-note">Repeat date is optional.</p>
        </div>
        {error ? <div className="lp-health-form-error">{error}</div> : null}
        <footer>
          <button type="button" style={btnGhost} disabled={saving} onClick={onClose}>Cancel</button>
          <button type="button" style={btnPrimary} disabled={saving || !isValid} onClick={submit}>
            {saving ? (editing ? "Saving..." : "Adding...") : editing ? "Save changes" : "Add medication"}
          </button>
        </footer>
      </div>
    </div>
  );
}

export default AddMedicationDialog;
