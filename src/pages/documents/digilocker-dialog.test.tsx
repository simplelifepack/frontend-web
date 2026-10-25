// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import DigiLockerDialog from "./digilocker-dialog";
import { digilocker, type LockerDocument } from "@/lib/digilocker-api";
const dispatch = vi.fn();
vi.mock("@/store/hooks", () => ({ useAppDispatch: () => dispatch }));
vi.mock("@/store/slices/documentsSlice", () => ({ fetchDocuments: () => ({ type: "refresh" }) }));
vi.mock("@/lib/digilocker-api", () => ({ digilocker: { status: vi.fn(), session: vi.fn(), documents: vi.fn(), start: vi.fn(), cancel: vi.fn(), import: vi.fn() } }));
const docs: LockerDocument[] = [
  { reference: "cert-1", name: "Certificate one", type: "Certificate", issuer: "Board", issueDate: null, modifiedAt: null, reason: null, available: true },
  { reference: "cert-2", name: "Certificate two", type: "Certificate", issuer: "Board", issueDate: null, modifiedAt: null, reason: null, available: true },
  { reference: "aadhaar", name: "Aadhaar", type: "Aadhaar", issuer: null, issueDate: null, modifiedAt: null, available: false, reason: "Restricted" },
];
beforeEach(() => {
  vi.resetAllMocks(); sessionStorage.clear(); window.history.replaceState(null, "", "/documents");
  vi.mocked(digilocker.status).mockResolvedValue({ configured: true, message: null });
  vi.mocked(digilocker.session).mockResolvedValue({ id: "session-a", status: "AUTHENTICATED", expiresAt: null, progress: [] });
  vi.mocked(digilocker.documents).mockResolvedValue({ documents: docs, session: { id: "session-a", status: "AUTHENTICATED", expiresAt: null, progress: [] } });
  vi.mocked(digilocker.cancel).mockResolvedValue({ id: "session-a", status: "CANCELLED", expiresAt: null, progress: [] });
});
afterEach(cleanup);
async function connected() {
  sessionStorage.setItem("readines.digilocker.session", "session-a");
  window.history.replaceState(null, "", "/documents#digilocker=session-a&result=AUTHENTICATED");
  render(<DigiLockerDialog />);
  await screen.findByLabelText("Select Certificate one");
}
it("requires Allow & Import after selection; declining copy consent never imports", async () => {
  await connected();
  fireEvent.click(screen.getByLabelText("Select Certificate one"));
  fireEvent.click(screen.getByText("Import Selected"));
  expect(screen.getByText("Copy documents to ReadiNes?")).toBeTruthy();
  expect(digilocker.import).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText("Cancel"));
  expect(digilocker.import).not.toHaveBeenCalled();
  expect(screen.getByLabelText("Select Aadhaar").getAttribute("disabled")).not.toBeNull();
});
it("select all includes only supported documents; partial failure retries only failed selection", async () => {
  await connected();
  vi.mocked(digilocker.import).mockResolvedValue({ id: "session-a", status: "AUTHENTICATED", expiresAt: null, progress: [{ reference: "cert-1", phase: "Completed", documentId: "document-a" }, { reference: "cert-2", phase: "Failed", message: "Try again" }] });
  fireEvent.click(screen.getByText("Select All"));
  fireEvent.click(screen.getByText("Import Selected"));
  fireEvent.click(screen.getByText("Allow & Import"));
  await waitFor(() => expect(digilocker.import).toHaveBeenCalledWith("session-a", ["cert-1", "cert-2"]));
  await screen.findByText("Retry Selected");
  fireEvent.click(screen.getByText("Retry Selected")); fireEvent.click(screen.getByText("Allow & Import"));
  await waitFor(() => expect(digilocker.import).toHaveBeenLastCalledWith("session-a", ["cert-2"]));
});
it("unconfigured provider remains unavailable and cannot simulate a connection", async () => {
  vi.mocked(digilocker.status).mockResolvedValue({ configured: false, message: "DigiLocker is not configured." });
  render(<DigiLockerDialog />); fireEvent.click(screen.getByText("DigiLocker"));
  await screen.findByText("DigiLocker is not configured.");
  expect((screen.getByText("Connect DigiLocker") as HTMLButtonElement).disabled).toBe(true);
  expect(digilocker.start).not.toHaveBeenCalled();
});
it("denied authorization is shown and closing cancels the server session", async () => {
  vi.mocked(digilocker.session).mockResolvedValue({ id: "session-a", status: "CONSENT_DENIED", expiresAt: null, progress: [] });
  sessionStorage.setItem("readines.digilocker.session", "session-a");
  window.history.replaceState(null, "", "/documents#digilocker=session-a&result=CONSENT_DENIED");
  render(<DigiLockerDialog />);
  await screen.findByText(/DigiLocker consent was declined/);
  fireEvent.click(screen.getByText("Cancel"));
  await waitFor(() => expect(digilocker.cancel).toHaveBeenCalledWith("session-a"));
});
