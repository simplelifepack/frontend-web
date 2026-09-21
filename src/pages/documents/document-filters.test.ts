import { describe, expect, it } from "vitest";
import type { DocumentRecord } from "@/lib/api";
import {
  documentPerson,
  documentSource,
  filterDocuments,
  matchesQuickFilter,
} from "./document-filters";

const makeDocument = (
  id: string,
  overrides: Partial<DocumentRecord> = {},
): DocumentRecord => ({
  id,
  originalName: `${id}.pdf`,
  documentType: "Report",
  category: "medical",
  title: id,
  mimeType: "application/pdf",
  size: 1,
  analysisSource: "ai",
  confidence: 1,
  classificationStatus: "verified",
  classificationConfidence: 1,
  ownershipStatus: "verified",
  readinessEligible: true,
  fields: {},
  createdAt: "2026-09-18T12:00:00Z",
  updatedAt: "2026-09-18T12:00:00Z",
  source: "MANUAL_UPLOAD",
  ...overrides,
});

const documents = [
  makeDocument("alex-medical", {
    title: "Lab Report",
    fields: { patientName: "Alex" },
    createdAt: "2026-09-19T12:00:00Z",
  }),
  makeDocument("alex-employment", {
    title: "Employment Offer",
    category: "employment",
    fields: { employeeName: "Alex" },
    createdAt: "2026-09-20T12:00:00Z",
  }),
  makeDocument("jordan-medical", {
    title: "Lab Report",
    fields: { patientName: "Jordan" },
    source: "GMAIL",
    createdAt: "2026-09-21T12:00:00Z",
  }),
  makeDocument("alex-drive", {
    title: "Insurance Proof",
    category: "insurance",
    fields: { nameOnDocument: "Alex" },
    source: "GOOGLE_DRIVE",
    createdAt: "2026-09-17T12:00:00Z",
  }),
];

describe("Documents filters", () => {
  it("combines search, category, person, source and sort without discarding historical imports", () => {
    const options = {
      query: "lab",
      category: "medical",
      person: "Alex",
      source: "uploaded",
      sort: "newest" as const,
      quick: "all" as const,
      currentUserName: "Ranjith",
    };
    expect(
      filterDocuments(documents, options).map((document) => document.id),
    ).toEqual(["alex-medical"]);
    expect(
      filterDocuments(documents, {
        ...options,
        query: "",
        category: "all",
        person: "all",
        source: "all",
      }).map((document) => document.id),
    ).toEqual([
      "jordan-medical",
      "alex-employment",
      "alex-medical",
      "alex-drive",
    ]);
    expect(
      filterDocuments(documents, {
        ...options,
        query: "",
        category: "all",
        person: "all",
        source: "gmail",
      }).map((document) => document.id),
    ).toEqual(["jordan-medical"]);
    expect(
      filterDocuments(documents, {
        ...options,
        query: "",
        category: "all",
        person: "all",
        source: "all",
        sort: "name-asc",
      }).map((document) => document.title),
    ).toEqual([
      "Employment Offer",
      "Insurance Proof",
      "Lab Report",
      "Lab Report",
    ]);
  });

  it("derives people and sources from actual document fields and counts dates dynamically", () => {
    expect(documentPerson(makeDocument("self"), "Ranjith")).toBe("Ranjith");
    expect(documentPerson(documents[2]!, "Ranjith")).toBe("Jordan");
    expect(documentSource(documents[3]!)).toBe("drive");
    const now = new Date("2026-09-21T00:00:00Z").getTime();
    expect(
      matchesQuickFilter(
        makeDocument("soon", { fields: { dateOfExpiry: "2026-09-25" } }),
        "soon",
        now,
      ),
    ).toBe(true);
    expect(
      matchesQuickFilter(
        makeDocument("expired", { fields: { dateOfExpiry: "2026-09-20" } }),
        "expired",
        now,
      ),
    ).toBe(true);
  });
});
