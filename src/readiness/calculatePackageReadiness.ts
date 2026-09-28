import type { DocumentRecord, PackageRequirement, ReadinessMatchedDocument } from "@/lib/api";

export type DerivedRequirement = PackageRequirement & {
  assignmentSource: "AUTO" | "USER_SELECTED" | "USER_OVERRIDE" | null;
  status: "ready" | "missing";
  matchedDocument?: ReadinessMatchedDocument;
};

export type PackReadiness = {
  totalRequired: number;
  satisfiedRequired: number;
  missingRequired: number;
  percentage: number;
  requirements: DerivedRequirement[];
};

export function normalizeRequirementValue(value: string | null | undefined) {
  const key = (value ?? "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  const aliases: Record<string, string> = {
    driving_license: "driving_licence",
    aadhar: "aadhaar",
    aadhaar_card: "aadhaar",
    photograph: "photo",
    recent_photograph: "photo",
    profile_photo: "photo",
    passport_size_photo: "passport_photo",
    passport_size_photograph: "passport_photo",
    id_photo: "passport_photo",
  };
  return aliases[key] ?? key;
}

function usableDocumentType(document: DocumentRecord) {
  return normalizeRequirementValue(document.normalizedType ?? document.documentType);
}

function documentRequirementTypes(document: DocumentRecord) {
  const type = usableDocumentType(document);
  const implied: Record<string, string[]> = {
    aadhaar: ["identity_proof", "address_proof", "date_of_birth_proof"],
    pan: ["identity_proof", "tax_identifier", "financial_identity"],
    passport: ["identity_proof", "nationality_proof", "travel_document", "photo_id", "date_of_birth_proof", "address_proof"],
    driving_licence: ["identity_proof", "address_proof", "photo_id", "age_proof", "driving_authorization"],
    voter_id: ["identity_proof", "address_proof", "photo_id"],
    birth_certificate: ["date_of_birth_proof", "identity_proof"],
  };
  return [type, ...(implied[type] ?? []), ...(document.capabilities ?? []).map(normalizeRequirementValue)];
}

function isUsable(document: DocumentRecord, now: number) {
  if (document.classificationStatus === "rejected" || document.ownershipStatus === "mismatch") return false;
  if (document.expiryDate && !Number.isNaN(Date.parse(document.expiryDate)) && Date.parse(document.expiryDate) < now) return false;
  const type = usableDocumentType(document);
  return Boolean(type && type !== "unknown");
}

function ownerMatches(requirement: PackageRequirement, document: DocumentRecord) {
  return normalizeRequirementValue(requirement.owner ?? "self") === normalizeRequirementValue(document.owner ?? "self");
}

function metadataMatches(requirement: PackageRequirement, document: DocumentRecord, now: number) {
  const maxAgeDays = requirement.metadata?.maxAgeDays;
  if (typeof maxAgeDays !== "number") return true;
  const date = document.documentDate ?? document.createdAt;
  const timestamp = Date.parse(date);
  return Number.isNaN(timestamp) || (now - timestamp) / 86_400_000 <= maxAgeDays;
}

function toMatchedDocument(document: DocumentRecord): ReadinessMatchedDocument {
  return {
    id: document.id,
    originalName: document.originalName,
    displayName: document.displayName,
    uniqueIdentifier: document.uniqueIdentifier,
    normalizedType: usableDocumentType(document),
    owner: document.owner ?? "self",
    confidence: document.confidence,
  };
}

export function documentMatchesRequirement(requirement: PackageRequirement, document: DocumentRecord, now = Date.now()) {
  if (!isUsable(document, now)) return false;
  const accepted = new Set(requirement.acceptedDocumentTypes.map(normalizeRequirementValue));
  return ownerMatches(requirement, document)
    && documentRequirementTypes(document).some((type) => accepted.has(type))
    && metadataMatches(requirement, document, now);
}

export function calculatePackReadiness(requirements: PackageRequirement[], documents: DocumentRecord[], now = Date.now()): PackReadiness {
  const usable = documents.filter((document) => isUsable(document, now));
  const derived = requirements.map((requirement): DerivedRequirement => {
    const assigned = requirement.assignment
      ? usable.find((document) => document.id === requirement.assignment?.documentId)
      : undefined;
    if (assigned) {
      return {
        ...requirement,
        assignmentSource: requirement.assignment.assignmentSource,
        matchedDocument: toMatchedDocument(assigned),
        status: "ready",
      };
    }
    const accepted = new Set(requirement.acceptedDocumentTypes.map(normalizeRequirementValue));
    const matched = usable
      .filter((document) => ownerMatches(requirement, document))
      .filter((document) => documentRequirementTypes(document).some((type) => accepted.has(type)))
      .filter((document) => metadataMatches(requirement, document, now))
      .sort((left, right) => right.confidence - left.confidence)[0];
    return { ...requirement, assignmentSource: matched ? "AUTO" : null, status: matched ? "ready" : "missing", ...(matched ? { matchedDocument: toMatchedDocument(matched) } : {}) };
  });
  const required = derived.filter((requirement) => requirement.required);
  const satisfiedRequired = required.filter((requirement) => requirement.status === "ready").length;
  return {
    totalRequired: required.length,
    satisfiedRequired,
    missingRequired: required.length - satisfiedRequired,
    percentage: required.length ? Math.round((satisfiedRequired / required.length) * 100) : 0,
    requirements: derived,
  };
}
