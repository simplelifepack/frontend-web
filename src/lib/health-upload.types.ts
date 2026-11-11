import type { HealthMember, HealthMemberResolution } from "./api.types";

export type HealthExtraction = {
  documentType: "lab_report" | "medical_report" | "prescription";
  patient?: HealthMemberResolution["patient"];
  documentDate?: string | null;
  provider?: string | null;
  doctor?: string | null;
  measurements: Array<{ name: string; metricKey?: string | null; value: number; secondaryValue?: number | null; unit: string; referenceMin?: number | null; referenceMax?: number | null; referenceText?: string | null; context?: string | null; bodySite?: string | null }>;
  medications: Array<{ name: string; dose?: string | null; frequency?: string | null; duration?: string | null; quantity?: string | null }>;
  followUps: Array<{ title: string; explicitDate?: string | null; recommendedAfter?: { value: number; unit: "days" | "weeks" | "months" | "years" } | null; sourceText?: string | null }>;
  prescriptionAnalysis?: { isHandwritten: boolean; hasUnreadableMedicationText: boolean; outcome: "not_prescription" | "medications_detected" | "partial_medications_detected" | "handwriting_unreadable" | "no_medications_detected"; message?: string | null } | null;
};
export type HealthProfileInput = { name: string; relation: string; dateOfBirth?: string | null; age?: number | null; gender?: string | null; emergencyContactRelationship?: string | null; bloodGroup?: string | null; conditions?: string | null; allergies?: string | null };
export type HealthUploadReview = {
  extraction: HealthExtraction;
  memberId?: string;
  automaticMemberId?: string;
  newMember?: HealthProfileInput;
};
export type HealthUploadMatch = { status: "missing" | "unmatched" | "ambiguous" | "matched"; candidates: HealthMember[] };
export function initialHealthReview(extraction?: HealthExtraction | null, match?: HealthUploadMatch, type: HealthExtraction["documentType"] = "medical_report"): HealthUploadReview {
  const review: HealthUploadReview = { extraction: extraction ?? { documentType: type, patient: null, measurements: [], medications: [], followUps: [] }, ...(match?.status === "matched" ? { automaticMemberId: match.candidates[0]?.id } : {}) };
  if (match?.status === "unmatched" && extraction?.patient?.name && !extraction.patient.identityConflicting) {
    const { identityConflicting: _conflict, ...patient } = extraction.patient;
    review.newMember = { ...patient, name: patient.name!, relation: patient.relation ?? "" };
  }
  return review;
}

export function reviewedHealthPayload(review: HealthUploadReview): HealthUploadReview {
  const { automaticMemberId, ...payload } = review;
  if (!automaticMemberId && !payload.memberId && !payload.newMember) throw new Error("Select a patient profile or create one before saving.");
  if (!payload.newMember) return payload;
  const { identityConflicting: _conflict, relation: _relation, ...patient } = review.extraction.patient ?? {};
  const newMember = { ...payload.newMember, ...patient, name: patient.name ?? "" };
  if (!newMember.name.trim() || !newMember.relation.trim()) throw new Error("Enter the patient's name and relationship.");
  return { ...payload, newMember };
}
