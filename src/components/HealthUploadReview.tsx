import { useEffect, useState } from "react";
import { Input, SelectMenu, Text } from "@/design-system";
import { api } from "@/lib/api";
import type { HealthMember } from "@/lib/api.types";
import type { HealthExtraction, HealthUploadReview as Review } from "@/lib/health-upload.types";
import { documentTypeLabels } from "@/pages/health/healthUtils";

const relationships = ["Spouse", "Mother", "Father", "Son", "Daughter", "Brother", "Sister", "Grandfather", "Grandmother", "Other"];
const relationshipOptions = relationships.map(label => ({ value: label, label }));

// Shared by Documents and Health. Edits remain review data, never trusted AI output.
export default function HealthUploadReview({ value, onChange }: { value: Review; onChange: (value: Review) => void }) {
  const [members, setMembers] = useState<HealthMember[]>([]);
  const [error, setError] = useState("");
  useEffect(() => { let active = true; void api.health.members().then(items => { if (active) setMembers(items); }).catch(() => { if (active) setError("Profiles could not be loaded. Try again or create a patient profile."); }); return () => { active = false; }; }, []);
  const extraction = value.extraction;
  const patient = extraction.patient ?? {};
  const profile = value.newMember ? "new" : value.memberId ?? value.automaticMemberId ?? "";
  const relationship = value.newMember?.relation.trim() ?? "";
  const selectedRelationship = relationships.find(option => option.toLowerCase() === relationship.toLowerCase()) ?? relationship;
  return <section className="lp-health-form lp-health-upload-review" aria-label="Review medical information">
    <Text as="label" size="sm"><span>Medical document type</span><SelectMenu value={extraction.documentType} options={Object.entries(documentTypeLabels).map(([key, label]) => ({ value: key, label }))} onValueChange={type => onChange({ ...value, extraction: { ...extraction, documentType: type as HealthExtraction["documentType"] } })} /></Text>
    {extraction.patient?.identityConflicting ? <Text as="p" tone="danger" size="sm">Patient information conflicts across pages. Check the original before choosing a profile.</Text> : null}
    {!value.newMember && patient.name ? <Text as="p" size="sm">Detected patient: {patient.name}{patient.dateOfBirth ? ` · DOB ${patient.dateOfBirth}` : ""}</Text> : null}
    <Text as="label" size="sm"><span>Patient profile</span><SelectMenu value={profile} options={[{ value: "", label: "Select a patient profile" }, ...members.map(member => ({ value: member.id, label: `${member.name} (${member.relation})` })), { value: "new", label: "Create profile from patient details" }]} onValueChange={selection => {
      const { identityConflicting: _conflict, ...details } = patient;
      onChange({ ...value, automaticMemberId: undefined, memberId: selection && selection !== "new" ? selection : undefined, newMember: selection === "new" ? { ...details, name: patient.name ?? "", relation: patient.relation ?? "" } : undefined });
    }} /></Text>
    {value.newMember ? <>
      <Text as="label" size="sm"><span>Patient name *</span><Input required value={patient.name ?? ""} onChange={event => onChange({ ...value, extraction: { ...extraction, patient: { ...patient, name: event.target.value } } })} /></Text>
      <Text as="label" size="sm"><span>Relationship *</span><SelectMenu
        value={selectedRelationship}
        options={[
          { value: "", label: "Select a relationship" },
          ...relationshipOptions,
          ...(selectedRelationship && !relationships.includes(selectedRelationship) ? [{ value: selectedRelationship, label: selectedRelationship }] : []),
        ]}
        onValueChange={relation => onChange({ ...value, newMember: { ...value.newMember!, relation } })}
      /></Text>
    </> : null}
    <Text as="p" size="sm" tone="muted">Extracted results will appear in Health after saving.</Text>
    {error ? <Text as="p" size="sm" role="status">{error}</Text> : null}
  </section>;
}
