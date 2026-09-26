import { useState } from "react";
import { X } from "lucide-react";
import { btnPrimary } from "@/constants/theme";
import { isoDateInput, validateDateOfBirth } from "../healthUtils";

function AddMemberDialog({
  initial,
  onClose,
  onCreate,
}: {
  initial?: { name?: string; dateOfBirth?: string | null };
  onClose: () => void;
  onCreate: (payload: {
    name: string;
    relation: string;
    bloodGroup?: string | null;
    dateOfBirth?: string | null;
  }) => Promise<void>;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [relation, setRelation] = useState("");
  const [customRelation, setCustomRelation] = useState("");
  const [bloodGroup, setBloodGroup] = useState("Unknown");
  const [dateOfBirth, setDateOfBirth] = useState(initial?.dateOfBirth ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const today = isoDateInput(new Date());
  const minimumDob = (() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 120);
    return isoDateInput(date);
  })();

  const submit = async () => {
    if (submitting) return;
    const nextErrors: Record<string, string> = {};
    const trimmedName = name.trim();
    const resolvedRelation =
      relation === "Other" ? customRelation.trim() : relation;
    const dobError = validateDateOfBirth(dateOfBirth);
    if (!trimmedName) nextErrors.name = "Name is required";
    if (!resolvedRelation) nextErrors.relation = "Relation is required";
    if (dobError) nextErrors.dateOfBirth = dobError;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSubmitting(true);
    try {
      await onCreate({
        name: trimmedName,
        relation: resolvedRelation,
        bloodGroup: bloodGroup || "Unknown",
        dateOfBirth: dateOfBirth || null,
      });
    } catch {
      setErrors({ form: "Unable to create profile. Try again." });
      setSubmitting(false);
    }
  };

  return (
    <div
      className="lp-modal-backdrop"
      style={{ zIndex: 100 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="lp-modal-panel lp-health-add-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="health-member-title"
      >
        <header className="lp-health-dialog-head">
          <h2 id="health-member-title">Add family member</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>
        <div className="lp-health-form">
          <label>
            <span>Name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder=""
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name ? <small>{errors.name}</small> : null}
          </label>
          <label>
            <span>Relation</span>
            <select
              value={relation}
              onChange={(event) => setRelation(event.target.value)}
              aria-invalid={Boolean(errors.relation)}
            >
              <option value="">Select relation</option>
              {[
                "Spouse",
                "Mother",
                "Father",
                "Son",
                "Daughter",
                "Brother",
                "Sister",
                "Grandfather",
                "Grandmother",
                "Other",
              ].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {relation === "Other" ? (
              <input
                value={customRelation}
                onChange={(event) => setCustomRelation(event.target.value)}
                placeholder="Custom relation"
              />
            ) : null}
            {errors.relation ? <small>{errors.relation}</small> : null}
          </label>
          <label>
            <span>Blood group</span>
            <select
              value={bloodGroup}
              onChange={(event) => setBloodGroup(event.target.value)}
            >
              <option>A+</option>
              <option>A-</option>
              <option>B+</option>
              <option>B-</option>
              <option>AB+</option>
              <option>AB-</option>
              <option>O+</option>
              <option>O-</option>
              <option>Unknown</option>
            </select>
          </label>
          <label>
            <span>Date of birth</span>
            <input
              value={dateOfBirth}
              onChange={(event) => setDateOfBirth(event.target.value)}
              type="date"
              min={minimumDob}
              max={today}
              aria-invalid={Boolean(errors.dateOfBirth)}
            />
            {errors.dateOfBirth ? <small>{errors.dateOfBirth}</small> : null}
          </label>
          {errors.form ? (
            <div className="lp-health-form-error">{errors.form}</div>
          ) : null}
        </div>
        <footer>
          <button
            type="button"
            style={btnPrimary}
            disabled={submitting}
            onClick={submit}
          >
            Create profile
          </button>
        </footer>
      </div>
    </div>
  );
}

export default AddMemberDialog;
