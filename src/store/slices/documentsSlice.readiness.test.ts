import { describe, expect, it } from "vitest";

import type { DocumentRecord } from "@/lib/api";
import reducer, {
  assignDocuments,
  fetchDocumentById,
  saveDocument,
} from "./documentsSlice";

const savedPan: DocumentRecord = {
  id: "pan-1",
  ownerProfileId: "user-1",
  originalName: "pan.jpg",
  mimeType: "image/jpeg",
  size: 100,
  documentType: "PAN Card",
  normalizedType: "pan",
  category: "identity",
  analysisSource: "ai",
  confidence: 95,
  classificationStatus: "verified",
  classificationConfidence: 95,
  ownershipStatus: "verified",
  readinessEligible: true,
  fields: { owner: "unknown", verified: true, capabilities: ["pan"] },
  source: "MANUAL_UPLOAD",
  createdAt: "2026-07-29T00:00:00.000Z",
  updatedAt: "2026-07-29T00:00:00.000Z",
};

describe("document readiness source updates", () => {
  it("adds the normalized save response immediately without requiring bootstrap", () => {
    const action = {
      type: saveDocument.fulfilled.type,
      payload: { document: savedPan },
    };
    const state = reducer(undefined, action);
    expect(state.items).toEqual([savedPan]);
    expect(state.items[0]?.ownerProfileId).toBe("user-1");
  });
  it("updates list and detail after assignment without dropping other documents or changing the count", () => {
    let state = reducer(undefined, {
      type: saveDocument.fulfilled.type,
      payload: { document: savedPan },
    });
    state = reducer(state, {
      type: saveDocument.fulfilled.type,
      payload: { document: { ...savedPan, id: "other" } },
    });
    state = reducer(state, {
      type: fetchDocumentById.fulfilled.type,
      payload: savedPan,
    });
    const assigned = {
      ...savedPan,
      fields: {
        ...(savedPan.fields as object),
        assignedPerson: { id: "family", name: "Family" },
      },
    };
    const updated = reducer(state, {
      type: assignDocuments.fulfilled.type,
      payload: [assigned],
    });
    expect(
      updated.items.find((document) => document.id === savedPan.id),
    ).toEqual(assigned);
    expect(updated.selected).toEqual(assigned);
    expect(updated.items.find((document) => document.id === "other")).toEqual(
      state.items[0],
    );
    expect(updated.documentCount).toBe(2);
  });
});
