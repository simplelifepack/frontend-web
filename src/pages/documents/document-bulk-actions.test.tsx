import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { afterEach, describe, expect, it, vi } from "vitest";
import { api, type DocumentRecord } from "@/lib/api";
import reducer from "@/store/slices/documentsSlice";
import DocumentBulkActions from "./document-bulk-actions";

vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));
const document = { id: "doc" } as DocumentRecord;
afterEach(() => vi.restoreAllMocks());

describe("document assignment control", () => {
  it("uses the shared accessible SelectMenu and assigns selected documents", async () => {
    vi.spyOn(api.documents, "assignmentOptions").mockResolvedValue([
      { id: "family", name: "Alex" },
    ]);
    const assign = vi
      .spyOn(api.documents, "bulkAssign")
      .mockResolvedValue({
        documents: [
          {
            ...document,
            fields: { assignedPerson: { id: "family", name: "Alex" } },
          },
        ],
      });
    const onClear = vi.fn();
    const store = configureStore({ reducer: { documents: reducer } });
    render(
      <Provider store={store}>
        <DocumentBulkActions
          documents={[document]}
          onClear={onClear}
          onDeleted={vi.fn()}
        />
      </Provider>,
    );
    const control = screen.getByRole("combobox", {
      name: "Assign selected documents",
    });
    await waitFor(() => expect(control.hasAttribute("disabled")).toBe(false));
    expect(control.tagName).toBe("BUTTON");
    HTMLElement.prototype.scrollIntoView = vi.fn();
    fireEvent.keyDown(control, { key: "ArrowDown" });
    const option = await screen.findByRole("option", { name: "Alex" });
    await act(async () => {
      fireEvent.click(option);
    });
    await waitFor(() => expect(assign).toHaveBeenCalledWith(["doc"], "family"));
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
