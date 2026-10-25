// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AnalyzeDocumentResponse } from "@/lib/api";
import { analyzeDocument, saveDocument } from "@/store/slices/documentsSlice";
import UploadDocumentModal from "./UploadDocumentModal";

let pendingAnalysis: AnalyzeDocumentResponse | null = null;
const dispatch = vi.fn((action: { kind: string }) =>
  action.kind === "save" ? { unwrap: async () => ({}) } : {},
);
vi.mock("@/lib/preferences-api", () => ({ preferencesApi: { get: async () => ({ aiProcessingEnabled: true }) } }));
vi.mock("@/store/hooks", () => ({
  useAppDispatch: () => dispatch,
  useAppSelector: (select: (state: unknown) => unknown) =>
    select({
      documents: {
        pendingAnalysis,
        analyzeStatus: "idle",
        uploadStatus: "idle",
        error: null,
      },
    }),
}));
vi.mock("@/store/slices/documentsSlice", () => ({
  analyzeDocument: vi.fn((input) => ({ kind: "analyze", input })),
  saveDocument: vi.fn((payload) => ({ kind: "save", payload })),
  clearPendingAnalysis: vi.fn(() => ({ kind: "clear" })),
}));

const analysis: AnalyzeDocumentResponse = {
  success: true,
  document: {
    title: "Detected title",
    category: "Identity",
    documentType: "PAN",
    uniqueNumber: "EXTRACTED",
    nameOnDocument: "Detected person",
    expiryDate: null,
    ownership: "unknown",
  },
  files: [
    {
      tempFileId: "temp-id",
      originalName: "manual-test.png",
      mimeType: "image/png",
      size: 10,
    },
  ],
  warnings: [],
};

function CurrentRoute() {
  return <span data-testid="route">{useLocation().pathname}</span>;
}
function renderModal(route: string) {
  const onClose = vi.fn();
  const view = render(
    <MemoryRouter initialEntries={[route]}>
      <CurrentRoute />
      <UploadDocumentModal open onClose={onClose} />
    </MemoryRouter>,
  );
  return {
    ...view,
    onClose,
    showReview: (override: AnalyzeDocumentResponse = analysis) => {
      pendingAnalysis = override;
      view.rerender(
        <MemoryRouter initialEntries={[route]}>
          <CurrentRoute />
          <UploadDocumentModal open onClose={onClose} />
        </MemoryRouter>,
      );
    },
  };
}

async function selectAI() {
  await waitFor(() => expect(screen.getByRole("checkbox")).toBeTruthy());
  fireEvent.click(screen.getByRole("checkbox"));
}

afterEach(() => {
  cleanup();
  pendingAnalysis = null;
  vi.clearAllMocks();
});

describe("manual document upload review", () => {
  it("retains original-file AI text and structured fields when confirming a successful analysis", async () => {
    const view = renderModal("/documents");
    await selectAI();
    view.showReview({ ...analysis, document: { ...analysis.document, extractedText: "Synthetic extracted page content", fields: { issuer: "Synthetic issuer" } } });
    fireEvent.click(screen.getByRole("button", { name: "Confirm & Save" }));
    await waitFor(() => expect(view.onClose).toHaveBeenCalledOnce());
    expect(vi.mocked(saveDocument).mock.calls[0]![0]).toMatchObject({ analysisSource: "ai", rawExtractedText: "Synthetic extracted page content", fields: { issuer: "Synthetic issuer" } });
  });
  it("failed AI supports manual entry without retaining untrusted extracted content", async () => {
    const view = renderModal("/documents");
    view.showReview({ ...analysis, document: { ...analysis.document, extractedText: "discard failed content", fields: { issuer: "discard" } }, warnings: [{ code: "AI_ANALYSIS_UNAVAILABLE", message: "Unavailable" }] });
    expect(screen.getByText(/AI could not read this document/)).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Category"), { target: { value: "Identity" } });
    fireEvent.click(screen.getByRole("button", { name: "Confirm & Save" }));
    await waitFor(() => expect(view.onClose).toHaveBeenCalledOnce());
    const payload = vi.mocked(saveDocument).mock.calls[0]![0];
    expect(payload.analysisSource).toBe("manual"); expect(payload.rawExtractedText).toBe(""); expect(payload.fields.issuer).toBeUndefined();
  });

  it("allows selecting and dropping PDF files alongside images", async () => {
    const view = renderModal("/documents");
    await selectAI();
    const input = view.baseElement.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input.accept).toContain("application/pdf");
    expect(input.accept).toContain(".pdf");
    const pdf = new File(["%PDF-1.4\n%%EOF"], "statement.pdf", { type: "application/pdf" });
    fireEvent.change(input, { target: { files: [pdf] } });
    expect(screen.getByText("statement.pdf")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Continue with 1 page" }));
    expect(analyzeDocument).toHaveBeenCalledWith({ files: [pdf], aiAnalysisConsent: true });

    const dropped = new File(["%PDF-1.4\n%%EOF"], "drop.pdf", { type: "application/pdf" });
    fireEvent.drop(screen.getByTestId("document-drop-zone"), { dataTransfer: { files: [dropped] } });
    expect(screen.getByText("drop.pdf")).toBeTruthy();
  });

  it.each([
    ["/health", "Vehicle"],
    ["/documents", "Identity"],
  ])(
    "saves from %s with only %s and stays on its opening route",
    async (route, category) => {
      const view = renderModal(route);
      view.showReview({ ...analysis, warnings: [{ code: "AI_PROCESSING_DISABLED", message: "AI processing is disabled for this account." }] });
      expect((screen.getByLabelText("Title") as HTMLInputElement).value).toBe(
        "",
      );
      expect(
        (screen.getByLabelText("Document type") as HTMLInputElement).value,
      ).toBe("");
      fireEvent.click(screen.getByRole("button", { name: "Confirm & Save" }));
      expect(screen.getByRole("alert").textContent).toBe(
        "Please select a category.",
      );
      expect(saveDocument).not.toHaveBeenCalled();
      fireEvent.change(screen.getByLabelText("Category"), {
        target: { value: category },
      });
      fireEvent.click(screen.getByRole("button", { name: "Confirm & Save" }));
      await waitFor(() => expect(view.onClose).toHaveBeenCalledOnce());
      const payload = vi.mocked(saveDocument).mock.calls[0]![0];
      expect(payload).toMatchObject({
        category,
        analysisSource: "manual",
        documentType: "",
        confidence: 0,
      });
      expect(payload.title).toBeUndefined();
      expect(payload.fields.uniqueNumber).toBeUndefined();
      expect(screen.getByTestId("route").textContent).toBe(route);
    },
  );

  it("keeps optional PAN number and AI-consent metadata distinct", async () => {
    const manual = renderModal("/documents");
    manual.showReview({ ...analysis, warnings: [{ code: "AI_PROCESSING_DISABLED", message: "AI processing is disabled for this account." }] });
    fireEvent.change(screen.getByLabelText("Category"), {
      target: { value: "Identity" },
    });
    fireEvent.change(screen.getByLabelText("Document type"), {
      target: { value: "PAN" },
    });
    fireEvent.change(screen.getByLabelText("Unique number"), {
      target: { value: "ABCDE1234F" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Confirm & Save" }));
    await waitFor(() => expect(manual.onClose).toHaveBeenCalledOnce());
    expect(vi.mocked(saveDocument).mock.calls[0]![0].fields.uniqueNumber).toBe(
      "ABCDE1234F",
    );
    manual.unmount();
    pendingAnalysis = null;
    const ai = renderModal("/documents");
    await selectAI();
    ai.showReview(analysis);
    fireEvent.click(screen.getByRole("button", { name: "Confirm & Save" }));
    await waitFor(() => expect(ai.onClose).toHaveBeenCalledOnce());
    expect(vi.mocked(saveDocument).mock.calls[1]![0]).toMatchObject({
      analysisSource: "ai",
      documentType: "PAN",
      title: "Detected person",
    });
  });
});
