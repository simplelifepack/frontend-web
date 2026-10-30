import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AddRecordDialog from "./AddRecordDialog";

HTMLElement.prototype.scrollIntoView ??= vi.fn();

function healthFile() {
  return new File(["health"], "record.pdf", { type: "application/pdf" });
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("AddRecordDialog", () => {
  it("hides document type and submits without type when AI processing is on", async () => {
    const onCreate = vi.fn().mockResolvedValue(undefined);
    const file = healthFile();

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

    await waitFor(() =>
      expect(onCreate).toHaveBeenCalledWith({ file, type: undefined }),
    );
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
