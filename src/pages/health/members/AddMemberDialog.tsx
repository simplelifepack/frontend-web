import { Heading, Text, ModalBackdrop, ModalPanel, Input, SelectMenu, Button } from "@/design-system";

import { useState } from "react";
import { X } from "lucide-react";

import { familyRelationships as relations, isoDateInput, validateDateOfBirth } from "../healthUtils";

export type ProfileDraft = { name?: string; relation?: string | null; dateOfBirth?: string | null; age?: number | null; gender?: string | null; emergencyContactRelationship?: string | null; bloodGroup?: string | null; conditions?: string | null; allergies?: string | null };

function AddMemberDialog({
  initial,
  onClose,
  onCreate,
}: {
  initial?: ProfileDraft;
  onClose: () => void;
  onCreate: (payload: {
    name: string;
    relation: string;
    bloodGroup?: string | null;
    dateOfBirth?: string | null;
    age?: number | null;
    gender?: string | null;
    emergencyContactRelationship?: string | null;
    conditions?: string | null;
    allergies?: string | null;
  }) => Promise<void>;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const suggestedRelation = initial?.relation?.trim() ?? "";
  const knownRelation = relations.find(option => option.toLowerCase() === suggestedRelation.toLowerCase());
  const [relation, setRelation] = useState(knownRelation ?? (suggestedRelation ? "Other" : ""));
  const [customRelation, setCustomRelation] = useState(knownRelation ? "" : suggestedRelation);
  const [bloodGroup, setBloodGroup] = useState(initial?.bloodGroup ?? "Unknown");
  const [age, setAge] = useState(initial?.age == null ? "" : String(initial.age));
  const [contactRelationship, setContactRelationship] = useState(initial?.emergencyContactRelationship ?? "");
  const [gender, setGender] = useState(initial?.gender ?? "");
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
    if (age && (!Number.isInteger(Number(age)) || Number(age) < 0 || Number(age) > 120)) nextErrors.age = "Enter an age from 0 to 120.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSubmitting(true);
    try {
      await onCreate({
        name: trimmedName,
        relation: resolvedRelation,
        bloodGroup: bloodGroup || "Unknown",
        dateOfBirth: dateOfBirth || null,
        age: age ? Number(age) : null,
        gender: gender.trim() || null,
        ...(contactRelationship.trim() ? { emergencyContactRelationship: contactRelationship.trim() } : {}),
        conditions: initial?.conditions,
        allergies: initial?.allergies,
      });
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : "Unable to create profile. Try again." });
      setSubmitting(false);
    }
  };

  return (
    <ModalBackdrop

      style={{ zIndex: "var(--layer-confirmation)" }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <ModalPanel onDismiss={onClose}
        className="lp-health-add-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="health-member-title"
      >
        <header className="lp-health-dialog-head">
          <Heading level={2} size="md" id="health-member-title">Add family member</Heading>
          <Button size="sm" iconOnly variant="tertiary" type="button" onClick={onClose} aria-label="Close">
            <X aria-hidden="true" focusable="false" size="var(--icon-regular)" />
          </Button>
        </header>
        <div className="lp-health-form">
          <Text as="label" size="sm" weight="medium">
            <span>Name</span>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder=""
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name ? <small>{errors.name}</small> : null}
          </Text>
          <Text as="label" size="sm" weight="medium">
            <span>Relation</span>
            <SelectMenu
              value={relation}
              onValueChange={(selectedValue) => setRelation(selectedValue)}
              aria-invalid={Boolean(errors.relation)}
              options={[
                { value: "", label: "Select relation" },
                ...relations.map((option) => ({ value: option, label: option })),
              ]}
            />
            {relation === "Other" ? (
              <Input
                value={customRelation}
                onChange={(event) => setCustomRelation(event.target.value)}
                placeholder="Custom relation"
              />
            ) : null}
            {errors.relation ? <small>{errors.relation}</small> : null}
          </Text>
          <Text as="label" size="sm" weight="medium">
            <span>Age</span><Input type="number" min={0} max={120} value={age} onChange={event => setAge(event.target.value)} />
            {errors.age ? <small>{errors.age}</small> : null}
          </Text>
          <Text as="label" size="sm" weight="medium">
            <span>Sex (optional)</span><Input maxLength={80} value={gender} onChange={event => setGender(event.target.value)} />
          </Text>
          <Text as="label" size="sm" weight="medium">
            <span>Emergency contact relationship (optional)</span>
            <Input maxLength={80} value={contactRelationship} onChange={event => setContactRelationship(event.target.value)} />
          </Text>
          <Text as="label" size="sm" weight="medium">
            <span>Blood group</span>
            <SelectMenu
              value={bloodGroup}
              onValueChange={(selectedValue) => setBloodGroup(selectedValue)}
              options={[
                { value: "A+", label: "A+" },
                { value: "A-", label: "A-" },
                { value: "B+", label: "B+" },
                { value: "B-", label: "B-" },
                { value: "AB+", label: "AB+" },
                { value: "AB-", label: "AB-" },
                { value: "O+", label: "O+" },
                { value: "O-", label: "O-" },
                { value: "Unknown", label: "Unknown" },
              ]}
            />
          </Text>
          <Text as="label" size="sm" weight="medium">
            <span>Date of birth</span>
            <Input
              value={dateOfBirth}
              onChange={(event) => setDateOfBirth(event.target.value)}
              type="date"
              min={minimumDob}
              max={today}
              aria-invalid={Boolean(errors.dateOfBirth)}
            />
            {errors.dateOfBirth ? <small>{errors.dateOfBirth}</small> : null}
          </Text>
          {errors.form ? (
            <Text as="div" size="sm" weight="semibold" className="lp-health-form-error" tone="danger" role="alert">{errors.form}</Text>
          ) : null}
        </div>
        <footer>
          <Button variant="primary"
            type="button"
            disabled={submitting}
            onClick={submit}
          >
            Create profile
          </Button>
        </footer>
      </ModalPanel>
    </ModalBackdrop>
  );
}

export default AddMemberDialog;
