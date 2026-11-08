import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AddRecordDialog from "./AddRecordDialog";
import { api } from "@/lib/api";

vi.mock("@/lib/api", () => ({ api: {
  documents: { analyze: vi.fn() },
  health: { members: vi.fn().mockResolvedValue([]) },
} }));

HTMLElement.prototype.scrollIntoView ??= vi.fn();

function healthFile() {
  return new File(["health"], "record.pdf", { type: "application/pdf" });
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("AddRecordDialog", () => {
  it("scans once and saves the extraction automatically when AI processing is on", async () => {
    const onCreate = vi.fn().mockResolvedValue(undefined);
    const file = healthFile();

    const analysis = {
      success: true as const,
      document: {
        title: "Lab report", category: "Medical" as const, documentType: "Lab Report", ownership: "other" as const,
        uniqueNumber: null, nameOnDocument: "Pat Example", expiryDate: null,
        healthExtraction: { documentType: "lab_report" as const, patient: { name: "Pat Example" }, measurements: [], medications: [], followUps: [] },
      },
      files: [{ tempFileId: "upload", originalName: file.name, mimeType: file.type, size: file.size }],
      warnings: [],
      healthProfileMatch: { status: "unmatched" as const, candidates: [] },
    };
    vi.mocked(api.documents.analyze).mockResolvedValue(analysis);

    const { baseElement } = render(
      <AddRecordDialog
        aiProcessingEnabled={true}
        onClose={vi.fn()}
        onCreate={onCreate}
      />,
    );

    expect(screen.queryByLabelText(/Document type/i)).toBeNull();
    fireEvent.change(baseElement.querySelector("input[type='file']")!, {
      target: { files: [file] },
    });
    fireEvent.click(screen.getByRole("button", { name: /Process/i }));

    await waitFor(() => expect(onCreate).toHaveBeenCalledWith({ file, type: "lab_report", analysis }));
    expect(screen.queryByLabelText(/Relationship/i)).toBeNull();
    expect(api.documents.analyze).toHaveBeenCalledTimes(1);
  });

  it("shows document type and submits the selected type when AI processing is off", async () => {
    const onCreate = vi.fn().mockResolvedValue(undefined);
    const file = healthFile();

    const { baseElement } = render(
      <AddRecordDialog
        aiProcessingEnabled={false}
        onClose={vi.fn()}
        onCreate={onCreate}
      />,
    );

    fireEvent.keyDown(screen.getByLabelText(/Document type/i), { key: "ArrowDown" });
    fireEvent.click(await screen.findByRole("option", { name: "Prescription" }));
    fireEvent.change(baseElement.querySelector("input[type='file']")!, {
      target: { files: [file] },
    });
    fireEvent.click(screen.getByRole("button", { name: /Process/i }));

    await waitFor(() =>
      expect(onCreate).toHaveBeenCalledWith({ file, type: "prescription" }),
    );
  });
});
