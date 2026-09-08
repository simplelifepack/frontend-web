import { describe, expect, it } from "vitest";

import type { AnalyzeDocumentResponse } from "@/lib/api";
import reducer, { clearPendingAnalysis, setImportedAnalyses } from "./documentsSlice";

function analysis(id: string): AnalyzeDocumentResponse {
  return {
    success: true,
    document: { title: id, category: "Finance", documentType: "Bank Statement", uniqueNumber: null, nameOnDocument: null, expiryDate: null, ownership: "unknown" },
    files: [{ tempFileId: id, originalName: `${id}.pdf`, mimeType: "application/pdf", size: 10 }],
    warnings: [],
  };
}

describe("Gmail import review queue", () => {
  it("queues selected imports without auto-saving them", () => {
    const state = reducer(undefined, setImportedAnalyses([analysis("first"), analysis("second")]));
    expect(state.pendingAnalysis?.files[0]?.tempFileId).toBe("first");
    expect(state.pendingAnalysisQueue.map((item) => item.files[0]?.tempFileId)).toEqual(["second"]);
    expect(state.items).toEqual([]);
  });

  it("clears all pending Gmail reviews when cancelled", () => {
    const queued = reducer(undefined, setImportedAnalyses([analysis("first"), analysis("second")]));
    const cleared = reducer(queued, clearPendingAnalysis());
    expect(cleared.pendingAnalysis).toBeNull();
    expect(cleared.pendingAnalysisQueue).toEqual([]);
  });
});
