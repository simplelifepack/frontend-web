import { describe, expect, it } from "vitest";

import type { DocumentRecord, PackSummary } from "@/lib/api";
import { calculatePackageReadiness } from "./calculatePackageReadiness";

const packageData: PackSummary = {
  id: "pack-1",
  slug: "bike-loan",
  title: "Bike Loan",
  category: "Finance",
  description: "Loan documents",
  aliases: [],
  keywords: [],
  version: 1,
  requirements: [
    {
      id: "identity",
      title: "Identity Proof",
      description: "",
      required: true,
      group: "KYC",
      documentType: "aadhaar",
      owner: "self",
      metadata: null,
      acceptedDocumentTypes: ["aadhaar"],
      alternativeLabels: [],
      sortOrder: 0,
    },
    {
      id: "photo",
      title: "Photograph",
      description: "",
      required: false,
      group: "KYC",
      documentType: "passport_photo",
      owner: "self",
      metadata: null,
      acceptedDocumentTypes: ["passport_size_photo"],
      alternativeLabels: [],
      sortOrder: 1,
    },
  ],
};

function document(overrides: Partial<DocumentRecord> = {}): DocumentRecord {
  return {
    id: "document-1",
    originalName: "aadhaar.pdf",
    mimeType: "application/pdf",
    size: 100,
    documentType: "Aadhaar",
    normalizedType: "aadhaar",
    category: "identity",
    analysisSource: "rules",
    confidence: 95,
    classificationStatus: "verified",
    classificationConfidence: 95,
    ownershipStatus: "verified",
    readinessEligible: true,
    fields: { owner: "self", verified: true, capabilities: ["aadhaar"] },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    source: "MANUAL_UPLOAD",
    ownerProfileId: "user-1",
    ...overrides,
  };
}

describe("calculatePackageReadiness", () => {
  it("matches normalized types and capabilities without mutating source data", () => {
    const documents = [document()];
    const snapshot = JSON.stringify({ packageData, documents });
    const readiness = calculatePackageReadiness({
      packageData,
      documents,
      user: { id: "user-1", name: "User", email: "user@example.com" },
      familyMembers: [],
    });
    expect(readiness.requiredReadyCount).toBe(1);
    expect(readiness.percentage).toBe(100);
    expect(readiness.optionalReadyCount).toBe(0);
    expect(JSON.stringify({ packageData, documents })).toBe(snapshot);
  });

  it("rejects another user's, expired, and unverified documents", () => {
    const documents = [
      document({ ownerProfileId: "user-2" }),
      document({ id: "expired", fields: { owner: "self", verified: true, expiresAt: "2020-01-01" } }),
      document({ id: "unverified", fields: { owner: "self", verified: false } }),
    ];
    const readiness = calculatePackageReadiness({
      packageData,
      documents,
      user: { id: "user-1", name: "User", email: "user@example.com" },
      familyMembers: [],
    });
    expect(readiness.requiredReadyCount).toBe(0);
    expect(readiness.missingRequirements.map((requirement) => requirement.id)).toContain("identity");
  });

  it("does not count unknown ownership, even for the current profile", () => {
    const currentProfile = calculatePackageReadiness({
      packageData,
      documents: [document({
        ownershipStatus: "unknown",
        readinessEligible: false,
        fields: { owner: "unknown", verified: true, capabilities: ["aadhaar"] },
      })],
      user: { id: "user-1", name: "User", email: "user@example.com" },
      familyMembers: [],
    });
    const differentProfile = calculatePackageReadiness({
      packageData,
      documents: [document({
        ownerProfileId: "user-2",
        ownershipStatus: "unknown",
        readinessEligible: false,
        fields: { owner: "unknown", verified: true, capabilities: ["aadhaar"] },
      })],
      user: { id: "user-1", name: "User", email: "user@example.com" },
      familyMembers: [],
    });
    expect(currentProfile.requiredReadyCount).toBe(0);
    expect(differentProfile.requiredReadyCount).toBe(0);
  });
});
