import type {
  AuthUser,
  DocumentRecord,
  FamilyMember,
  PackageRequirement,
  PackSummary,
  ReadinessMatchedDocument,
  ReadinessRequirement,
  ReadinessResult,
} from "@/lib/api";

export type PackageReadiness = {
  requiredReadyCount: number;
  requiredTotalCount: number;
  optionalReadyCount: number;
  optionalTotalCount: number;
  percentage: number;
  isReady: boolean;
  matchedRequirements: PackageRequirement[];
  missingRequirements: PackageRequirement[];
  result: ReadinessResult;
};

function normalize(value: string | null | undefined) {
  const normalized = (value ?? "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  const aliases: Record<string, string> = {
    driving_license: "driving_licence",
    passport_size_photo: "passport_photo",
    passport_size_photograph: "passport_photo",
    id_photo: "passport_photo",
    photograph: "passport_photo",
  };
  return aliases[normalized] ?? normalized;
}

function fieldsOf(document: DocumentRecord) {
  return document.fields && typeof document.fields === "object"
    ? document.fields as Record<string, unknown>
    : {};
}

function stringField(fields: Record<string, unknown>, names: string[]) {
  for (const name of names) {
    const value = fields[name];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function isUsable(document: DocumentRecord) {
  if (
    document.readinessEligible !== true ||
    document.classificationStatus !== "verified" ||
    document.ownershipStatus !== "verified"
  ) return false;
  const fields = fieldsOf(document);
  const status = stringField(fields, ["status", "documentStatus"])?.toLowerCase();
  if (status && ["deleted", "rejected", "invalid", "expired"].includes(status)) return false;
  if (fields.verified === false || fields.valid === false) return false;
  const expiry = stringField(fields, ["expiresAt", "expiry", "dateOfExpiry", "validTill", "validUpto"]);
  return !expiry || Number.isNaN(Date.parse(expiry)) || Date.parse(expiry) >= Date.now();
}

function documentOwner(document: DocumentRecord) {
  return normalize(stringField(fieldsOf(document), ["owner", "relationship"]) ?? "self");
}

function documentTypes(document: DocumentRecord) {
  const fields = fieldsOf(document);
  const capabilities = Array.isArray(fields.capabilities)
    ? fields.capabilities.filter((value): value is string => typeof value === "string")
    : [];
  return new Set([
    normalize(document.normalizedType),
    normalize(document.documentType),
    ...capabilities.map(normalize),
  ].filter(Boolean));
}

function ownerMatches(
  requirement: PackageRequirement,
  document: DocumentRecord,
  user: AuthUser,
  familyMembers: FamilyMember[],
) {
  const owner = normalize(requirement.owner || "self");
  if (user.id && document.ownerProfileId && document.ownerProfileId !== user.id) return false;
  if (owner === "self") {
    const storedOwner = documentOwner(document);
    return storedOwner === "self" ||
      (storedOwner === "unknown" && Boolean(user.id) && document.ownerProfileId === user.id);
  }
  const knownRelationship = familyMembers.some((member) =>
    normalize(member.relationship) === owner || member.id === document.ownerProfileId);
  return documentOwner(document) === owner && (knownRelationship || !familyMembers.length);
}

function toMatchedDocument(document: DocumentRecord): ReadinessMatchedDocument {
  return {
    id: document.id,
    originalName: document.originalName,
    displayName: document.displayName,
    uniqueIdentifier: document.uniqueIdentifier,
    normalizedType: normalize(document.normalizedType ?? document.documentType),
    owner: documentOwner(document),
    confidence: document.confidence,
  };
}

export function calculatePackageReadiness(input: {
  packageData: PackSummary;
  documents: DocumentRecord[];
  user: AuthUser;
  familyMembers: FamilyMember[];
}): PackageReadiness {
  const usableDocuments = input.documents.filter(isUsable);
  const statuses: ReadinessRequirement[] = input.packageData.requirements.map((requirement) => {
    const accepted = new Set([
      normalize(requirement.documentType),
      ...requirement.acceptedDocumentTypes.map(normalize),
    ].filter(Boolean));
    const matches = usableDocuments
      .filter((document) => ownerMatches(requirement, document, input.user, input.familyMembers))
      .filter((document) => [...documentTypes(document)].some((type) => accepted.has(type)))
      .sort((left, right) => right.confidence - left.confidence);
    return {
      id: requirement.id,
      key: requirement.id,
      label: requirement.title,
      title: requirement.title,
      description: requirement.description,
      required: requirement.required,
      documentType: normalize(requirement.documentType),
      owner: requirement.owner,
      status: matches.length ? "ready" : "missing",
      reason: matches.length ? null : "No valid matching document is loaded.",
      matchedDocument: matches[0] ? toMatchedDocument(matches[0]) : null,
      matchedDocuments: matches.map(toMatchedDocument),
      alternatives: matches.slice(1).map(toMatchedDocument),
      acceptedDocumentTypes: requirement.acceptedDocumentTypes,
      alternativeLabels: requirement.alternativeLabels,
    };
  });
  const required = input.packageData.requirements.filter((requirement) => requirement.required);
  const optional = input.packageData.requirements.filter((requirement) => !requirement.required);
  const readyIds = new Set(statuses.filter((status) => status.status === "ready").map((status) => status.id));
  const requiredReadyCount = required.filter((requirement) => readyIds.has(requirement.id)).length;
  const optionalReadyCount = optional.filter((requirement) => readyIds.has(requirement.id)).length;
  const percentage = required.length ? Math.round((requiredReadyCount / required.length) * 100) : 0;
  const groups = [...new Set(input.packageData.requirements.map((requirement) => requirement.group))].map((group) => ({
    group,
    requirements: statuses.filter((status) =>
      input.packageData.requirements.find((requirement) => requirement.id === status.id)?.group === group),
  }));
  const missingRequirements = input.packageData.requirements.filter((requirement) => !readyIds.has(requirement.id));

  return {
    requiredReadyCount,
    requiredTotalCount: required.length,
    optionalReadyCount,
    optionalTotalCount: optional.length,
    percentage,
    isReady: required.length > 0 && requiredReadyCount === required.length,
    matchedRequirements: input.packageData.requirements.filter((requirement) => readyIds.has(requirement.id)),
    missingRequirements,
    result: {
      query: input.packageData.slug,
      matchedPack: {
        id: input.packageData.id,
        slug: input.packageData.slug,
        title: input.packageData.title,
        category: input.packageData.category,
        description: input.packageData.description,
        requiredSlots: statuses.filter((status) => status.required),
        optionalSlots: statuses.filter((status) => !status.required),
      },
      readiness: {
        totalRequired: required.length,
        satisfiedRequired: requiredReadyCount,
        missingRequired: required.length - requiredReadyCount,
        percentage,
      },
      groups,
      missing: statuses.filter((status) => status.required && status.status !== "ready"),
      suggestions: [],
    },
  };
}
