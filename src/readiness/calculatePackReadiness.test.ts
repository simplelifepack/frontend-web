import { describe, expect, it } from "vitest";

import type { DocumentRecord, PackageRequirement } from "@/lib/api";
import { calculatePackReadiness } from "./calculatePackageReadiness";

const requirements: PackageRequirement[] = [
  { id: "identity", title: "Identity Proof", required: true, group: "KYC", acceptedDocumentTypes: ["aadhaar", "pan", "passport"] },
  { id: "photo", title: "Photograph", required: true, group: "KYC", acceptedDocumentTypes: ["passport_photo", "photo"] },
];

function document(normalizedType: string, overrides: Partial<DocumentRecord> = {}): DocumentRecord {
  return {
    id: normalizedType,
    originalName: `${normalizedType}.png`,
    mimeType: "image/png",
    size: 100,
    documentType: normalizedType,
    normalizedType,
    category: "photo",
    analysisSource: "ai",
    confidence: 95,
    classificationStatus: "detected",
    classificationConfidence: 95,
    ownershipStatus: "unknown",
    owner: "self",
    readinessEligible: false,
    fields: {},
    capabilities: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    source: "MANUAL_UPLOAD",
    ...overrides,
  };
}

describe("calculatePackReadiness", () => {
  it("derives readiness without mutating API data", () => {
    const documents = [document("passport_photo")];
    const snapshot = JSON.stringify({ requirements, documents });
    const readiness = calculatePackReadiness(requirements, documents);
    expect(readiness).toMatchObject({ totalRequired: 2, satisfiedRequired: 1, missingRequired: 1, percentage: 50 });
    expect(readiness.requirements.find((item) => item.id === "photo")?.matchedDocument?.normalizedType).toBe("passport_photo");
    expect(JSON.stringify({ requirements, documents })).toBe(snapshot);
  });

  it("matches explicit photo aliases but rejects unrelated and identity matches", () => {
    expect(calculatePackReadiness([requirements[1]!], [document("photo")]).satisfiedRequired).toBe(1);
    expect(calculatePackReadiness([requirements[1]!], [document("bank_statement")]).satisfiedRequired).toBe(0);
    expect(calculatePackReadiness([requirements[0]!], [document("passport_photo")]).satisfiedRequired).toBe(0);
  });

  it("applies ownership, expiry, and max-age rules", () => {
    const recent: PackageRequirement = { id: "bank", title: "Bank Statement", required: true, acceptedDocumentTypes: ["bank_statement"], metadata: { maxAgeDays: 180 } };
    expect(calculatePackReadiness([recent], [document("bank_statement", { owner: "other" })]).satisfiedRequired).toBe(0);
    expect(calculatePackReadiness([recent], [document("bank_statement", { expiryDate: "2020-01-01" })], Date.parse("2026-01-01")).satisfiedRequired).toBe(0);
    expect(calculatePackReadiness([recent], [document("bank_statement", { documentDate: "2025-01-01" })], Date.parse("2026-01-01")).satisfiedRequired).toBe(0);
  });
});
