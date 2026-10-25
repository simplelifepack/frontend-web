// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { AnalyzeDocumentResponse } from "@/lib/api";
const state = vi.hoisted(() => ({ pending: null as AnalyzeDocumentResponse | null, enabled: true }));
const actions = vi.hoisted(() => ({ analyze: vi.fn(), save: vi.fn() }));
vi.mock("@/lib/preferences-api", () => ({ preferencesApi: { get: async () => ({ aiProcessingEnabled: state.enabled }) } }));
vi.mock("@/store/hooks", () => ({
  useAppDispatch: () => (action: { kind: string }) => action.kind === "save" ? { unwrap: async () => ({ document: { id: "saved-document" } }) } : {},
  useAppSelector: (select: (value: unknown) => unknown) => select({ documents: { pendingAnalysis: state.pending, analyzeStatus: "idle", uploadStatus: "idle", error: null } }),
}));
vi.mock("@/store/slices/documentsSlice", () => ({ analyzeDocument: (input: unknown) => { actions.analyze(input); return { kind: "analyze" }; }, saveDocument: (input: unknown) => { actions.save(input); return { kind: "save" }; }, clearPendingAnalysis: () => ({ kind: "clear" }) }));
import UploadDocumentModal from "./UploadDocumentModal";
beforeEach(() => { state.pending = null; state.enabled = true; vi.stubGlobal("URL", class extends URL { static createObjectURL() { return "blob:test"; } static revokeObjectURL() {} }); });
afterEach(() => { cleanup(); vi.clearAllMocks(); vi.unstubAllGlobals(); });
const analysis = (documentType: string, category: string): AnalyzeDocumentResponse => ({ success: true, document: { title: "Extra document", documentType, category: category as AnalyzeDocumentResponse["document"]["category"], ownership: "unknown", uniqueNumber: null, nameOnDocument: null, expiryDate: null, extractedText: "Scanned page contents", fields: { issuer: "Example issuer" } }, files: [{ tempFileId: "temporary", originalName: "extra.pdf", mimeType: "application/pdf", size: 100 }], warnings: [] });
it.each([["Unknown", "Identity", "Other", "Other", 0], ["PAN", "Identity", "PAN", "Identity", 90]])("scans package uploads and saves %s as %s", async (detected, category, expectedType, expectedCategory, confidence) => {
  const onSaved = vi.fn(), onClose = vi.fn();
  const ui = () => <UploadDocumentModal open scanByDefault unknownAsOther onSaved={onSaved} onClose={onClose} />;
  const view = render(ui());
  await waitFor(() => expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(true));
  const file = new File(["%PDF-1.4 synthetic"], "extra.pdf", { type: "application/pdf" });
  fireEvent.change(view.baseElement.querySelector('input[type="file"]')!, { target: { files: [file] } });
  fireEvent.click(screen.getByRole("button", { name: "Scan document" }));
  expect(actions.analyze).toHaveBeenCalledWith({ files: [file], aiAnalysisConsent: true });
  state.pending = analysis(String(detected), String(category)); view.rerender(ui());
  await waitFor(() => expect((screen.getByLabelText("Document type") as HTMLInputElement).value).toBe(expectedType));
  fireEvent.click(screen.getByRole("button", { name: "Confirm & Save" }));
  await waitFor(() => expect(onSaved).toHaveBeenCalledWith({ id: "saved-document" }));
  expect(actions.save).toHaveBeenCalledWith(expect.objectContaining({ category: expectedCategory, documentType: expectedType, confidence, analysisSource: "ai", rawExtractedText: "Scanned page contents", userConfirmedUnknown: true }));
});
it("respects account-level AI processing settings", async () => {
  state.enabled = false;
  render(<UploadDocumentModal open scanByDefault unknownAsOther onClose={vi.fn()} />);
  await waitFor(() => expect(screen.getByText(/AI processing is off or unavailable/)).toBeTruthy());
  expect(screen.queryByRole("checkbox")).toBeNull();
});
