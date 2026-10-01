import { useState } from "react";
import { X } from "lucide-react";
import { btnGhost, btnPrimary } from "@/constants/theme";

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
type FrequencyUnit = "hours" | "days" | "weeks" | "months" | "years";

const frequencyCounts = ["", "1", "2", "3", "4", "6", "8", "12"];

function formatFrequency(count: string, unit: FrequencyUnit) {
  if (!count) return "";
  const singular = unit.slice(0, -1);
  return `Every ${count} ${count === "1" ? singular : unit}`;
}

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
      frequency: "",
      duration: "",
      quantity: "",
      repeats: false,
      runsOutAt: "",
      status: "continuing",
      stoppedAt: "",
    },
  );
  const [frequencyCount, setFrequencyCount] = useState("");
  const [frequencyUnit, setFrequencyUnit] = useState<FrequencyUnit>("days");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const update = <K extends keyof MedicationForm>(key: K, value: MedicationForm[K]) =>
    setForm((current) => ({ ...current, [key]: value }));
  const submit = async () => {
    if (!form.name.trim() || (!editing && !form.dose.trim())) {
      setError(editing ? "Name is required." : "Name and dose are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onCreate({ ...form, frequency: formatFrequency(frequencyCount, frequencyUnit) || form.frequency });
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
          <label>
            <span>Name</span>
            <input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Medication name" />
          </label>
          <label>
            <span>Dose</span>
            <input value={form.dose} onChange={(event) => update("dose", event.target.value)} placeholder="500 mg, 10 ml, 1 tablet" />
          </label>
          <label>
            <span>Frequency</span>
            <input value={form.frequency} onChange={(event) => update("frequency", event.target.value)} placeholder="Twice daily, after food" />
          </label>
          <fieldset className="lp-health-frequency-row">
            <span>Quick frequency</span>
            <label>
              <span>Every</span>
              <select value={frequencyCount} onChange={(event) => setFrequencyCount(event.target.value)}>
                <option value="">Not set</option>
                {frequencyCounts.filter(Boolean).map((count) => <option key={count} value={count}>{count}</option>)}
              </select>
            </label>
            <label>
              <span>Frequency unit</span>
              <select value={frequencyUnit} onChange={(event) => setFrequencyUnit(event.target.value as FrequencyUnit)}>
                <option value="hours">Hours</option>
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
            </label>
          </fieldset>
          <label>
            <span>Duration</span>
            <input value={form.duration} onChange={(event) => update("duration", event.target.value)} placeholder="5 days, 3 months" />
          </label>
          <label>
            <span>Quantity</span>
            <input value={form.quantity} onChange={(event) => update("quantity", event.target.value)} placeholder="30 tablets, 1 bottle" />
          </label>
          <label>
            <span>Runs out</span>
            <input type="date" value={form.runsOutAt} onChange={(event) => update("runsOutAt", event.target.value)} />
          </label>
          <label>
            <span>Status</span>
            <select value={form.status} onChange={(event) => update("status", event.target.value as MedicationForm["status"])}>
              <option value="continuing">Still continuing</option>
              <option value="stopped">Stopped</option>
            </select>
          </label>
          {form.status === "stopped" ? (
            <label>
              <span>Stopped date</span>
              <input type="date" value={form.stoppedAt} onChange={(event) => update("stoppedAt", event.target.value)} />
            </label>
          ) : null}
          <label className="lp-health-check-row">
            <input type="checkbox" checked={form.repeats} onChange={(event) => update("repeats", event.target.checked)} />
            <span>Repeats / ongoing</span>
          </label>
        </div>
        {error ? <div className="lp-health-form-error">{error}</div> : null}
        <footer>
          <button type="button" style={btnGhost} disabled={saving} onClick={onClose}>Cancel</button>
          <button type="button" style={btnPrimary} disabled={saving} onClick={submit}>
            {saving ? (editing ? "Saving..." : "Adding...") : editing ? "Save changes" : "Add medication"}
          </button>
        </footer>
      </div>
    </div>
  );
}

export default AddMedicationDialog;
