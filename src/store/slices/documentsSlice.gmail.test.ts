import { describe, expect, it } from "vitest";

import type { AnalyzeDocumentResponse } from "@/lib/api";
import reducer, { clearPendingAnalysis, setImportedAnalyses } from "./documentsSlice";

function analysis(id: string): AnalyzeDocumentResponse {
  return {
    title: id, extractedText: "", preview: null, reviewFields: [], tempFileId: id,
    file: { originalName: `${id}.pdf`, mimeType: "application/pdf", size: 10 },
    analysis: { category: "Finance", documentType: "Bank Statement", uniqueNumber: null, nameOnDocument: null },
    extractedTextPreview: null, analysisSource: "rules",
  };
}

describe("Gmail import review queue", () => {
  it("queues selected imports without auto-saving them", () => {
    const state = reducer(undefined, setImportedAnalyses([analysis("first"), analysis("second")]));
    expect(state.pendingAnalysis?.tempFileId).toBe("first");
    expect(state.pendingAnalysisQueue.map((item) => item.tempFileId)).toEqual(["second"]);
    expect(state.items).toEqual([]);
  });

  it("clears all pending Gmail reviews when cancelled", () => {
    const queued = reducer(undefined, setImportedAnalyses([analysis("first"), analysis("second")]));
    const cleared = reducer(queued, clearPendingAnalysis());
    expect(cleared.pendingAnalysis).toBeNull();
    expect(cleared.pendingAnalysisQueue).toEqual([]);
  });
});
