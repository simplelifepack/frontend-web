import type { DocumentRecord, PackageRequirement, ReadinessMatchedDocument } from "@/lib/api";

export type DerivedRequirement = PackageRequirement & {
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

function normalize(value: string | null | undefined) {
  const key = (value ?? "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  const aliases: Record<string, string> = {
    driving_license: "driving_licence",
    photograph: "photo",
    recent_photograph: "photo",
    profile_photo: "photo",
    passport_size_photo: "passport_photo",
    passport_size_photograph: "passport_photo",
    id_photo: "passport_photo",
  };
  return aliases[key] ?? key;
}

function isUsable(document: DocumentRecord, now: number) {
  if (document.classificationStatus === "rejected" || document.ownershipStatus === "mismatch") return false;
  if (document.expiryDate && !Number.isNaN(Date.parse(document.expiryDate)) && Date.parse(document.expiryDate) < now) return false;
  return Boolean(document.normalizedType && document.normalizedType !== "unknown");
}

function ownerMatches(requirement: PackageRequirement, document: DocumentRecord) {
  return normalize(requirement.owner ?? "self") === normalize(document.owner ?? "self");
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
    normalizedType: normalize(document.normalizedType ?? document.documentType),
    owner: document.owner ?? "self",
    confidence: document.confidence,
  };
}

export function calculatePackReadiness(requirements: PackageRequirement[], documents: DocumentRecord[], now = Date.now()): PackReadiness {
  const usable = documents.filter((document) => isUsable(document, now));
  const derived = requirements.map((requirement): DerivedRequirement => {
    const accepted = new Set(requirement.acceptedDocumentTypes.map(normalize));
    const matched = usable
      .filter((document) => ownerMatches(requirement, document))
      .filter((document) => [normalize(document.normalizedType), ...(document.capabilities ?? []).map(normalize)].some((type) => accepted.has(type)))
      .filter((document) => metadataMatches(requirement, document, now))
      .sort((left, right) => right.confidence - left.confidence)[0];
    return { ...requirement, status: matched ? "ready" : "missing", ...(matched ? { matchedDocument: toMatchedDocument(matched) } : {}) };
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
