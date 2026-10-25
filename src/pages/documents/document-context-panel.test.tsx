import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import { afterEach, describe, expect, it, vi } from "vitest";
import { api, type DocumentRecord, type PackageListResponse } from "@/lib/api";
import reducer, { documentAdded } from "@/store/slices/documentsSlice";
import DocumentContextPanel from "./document-context-panel";

vi.mock("./file-preview", () => ({ default: () => <div>File preview</div> }));
const doc = {
  id: "doc",
  originalName: "passport.pdf",
  documentType: "Passport",
  normalizedType: "passport",
  category: "identity",
  createdAt: "2026-09-11",
  size: 180 * 1024,
  fields: {
    assignedPerson: { id: "self", name: "Owner" },
    dateOfExpiry: "2027-07-02",
    documentNotes: "Existing note",
  },
} as DocumentRecord;
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
function setup() {
  vi.spyOn(api.documents, "assignmentOptions").mockResolvedValue([
    { id: "self", name: "Owner" },
    { id: "family", name: "Family" },
  ]);
  vi.spyOn(api.packages, "list").mockResolvedValue({
    items: [
      {
        id: "pack",
        slug: "travel",
        title: "Travel package",
        category: "Travel",
        requirements: [
          { id: "req", required: true, acceptedDocumentTypes: ["passport"] },
        ],
      },
    ],
    pagination: { hasNextPage: false },
  } as PackageListResponse);
  const store = configureStore({
    reducer: { documents: reducer, auth: () => ({ user: { name: "Owner" } }) },
  });
  store.dispatch(documentAdded(doc));
  const close = vi.fn();
  render(
    <MemoryRouter>
      <Provider store={store}>
        <DocumentContextPanel doc={doc} onClose={close} />
      </Provider>
    </MemoryRouter>,
  );
  return { store, close };
}
describe("document context drawer", () => {
  it("shows the reference sections using actual document and package data", async () => {
    setup();
    expect(
      screen.getByRole("dialog", { name: "Passport details" }),
    ).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Details" })).toBeTruthy();
    expect(screen.getByLabelText("Expiry").getAttribute("type")).toBe("date");
    expect((screen.getByLabelText("Notes") as HTMLTextAreaElement).value).toBe(
      "Existing note",
    );
    expect(
      await screen.findByRole("link", { name: "Travel package required" }),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Preview" })).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Delete document" }),
    ).toBeTruthy();
  });
  it("saves notes and expiry through the authenticated update API", async () => {
    const update = vi
      .spyOn(api.documents, "updateDetails")
      .mockResolvedValue({ document: doc });
    setup();
    const notes = screen.getByLabelText("Notes");
    fireEvent.change(notes, { target: { value: "New family note" } });
    await act(async () => {
      fireEvent.blur(notes);
    });
    expect(update).toHaveBeenCalledWith("doc", { notes: "New family note" });
    const expiry = screen.getByLabelText("Expiry");
    await act(async () => {
      fireEvent.change(expiry, { target: { value: "2028-01-02" } });
    });
    expect(update).toHaveBeenCalledWith("doc", { expiry: "2028-01-02" });
  });
  it("keeps the design-system assignment menu inside the focus scope and Escape closes only the menu", async () => {
    const { close } = setup();
    const select = screen.getByRole("combobox", { name: "Belongs to" });
    await waitFor(() => expect(select.hasAttribute("disabled")).toBe(false));
    HTMLElement.prototype.scrollIntoView = vi.fn();
    fireEvent.keyDown(select, { key: "ArrowDown" });
    const menu = await screen.findByRole("listbox");
    expect(screen.getByRole("dialog").contains(menu)).toBe(true);
    fireEvent.keyDown(menu, { key: "Escape" });
    expect(close).not.toHaveBeenCalled();
  });
});
