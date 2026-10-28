// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import DigiLockerDialog from "./digilocker-dialog";
import { digilocker, type LockerDocument } from "@/lib/digilocker-api";
const dispatch = vi.fn();
vi.mock("@/store/hooks", () => ({ useAppDispatch: () => dispatch, useAppSelector: (selector: (state: unknown) => unknown) => selector({auth:{user:{id:"owner-a"}}}) }));
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
  sessionStorage.setItem("readines.digilocker.session:owner-a", "session-a");
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
  sessionStorage.setItem("readines.digilocker.session:owner-a", "session-a");
  window.history.replaceState(null, "", "/documents#digilocker=session-a&result=CONSENT_DENIED");
  render(<DigiLockerDialog />);
  await screen.findByText(/DigiLocker consent was declined/);
  fireEvent.click(screen.getByText("Cancel"));
  await waitFor(() => expect(digilocker.cancel).toHaveBeenCalledWith("session-a"));
});
it("rejects a mismatched callback without reading either session's documents", async () => {
  sessionStorage.setItem("readines.digilocker.session:owner-a", "session-a");
  window.history.replaceState(null, "", "/documents#digilocker=other-session&result=AUTHENTICATED");
  render(<DigiLockerDialog />);
  await screen.findByText(/authorization could not be verified/);
  await waitFor(() => expect((screen.getByText("Connect DigiLocker") as HTMLButtonElement).disabled).toBe(false));
  expect(digilocker.session).not.toHaveBeenCalled();
  expect(digilocker.documents).not.toHaveBeenCalled();
  expect(window.location.hash).toBe("");
});
it("expired sessions allow reconnecting and never list or import documents", async () => {
  vi.mocked(digilocker.session).mockResolvedValue({ id: "session-a", status: "EXPIRED", expiresAt: null, progress: [] });
  sessionStorage.setItem("readines.digilocker.session:owner-a", "session-a");
  window.history.replaceState(null, "", "/documents#digilocker=session-a");
  render(<DigiLockerDialog />);
  await screen.findByText("Your DigiLocker session expired. Connect again.");
  expect(digilocker.documents).not.toHaveBeenCalled();
  expect(digilocker.import).not.toHaveBeenCalled();
});
it("Deselect All disables import and an empty provider list is explained", async () => {
  await connected();
  fireEvent.click(screen.getByText("Select All"));
  fireEvent.click(screen.getByText("Deselect All"));
  expect((screen.getByText("Import Selected") as HTMLButtonElement).disabled).toBe(true);
});
it("an empty provider list is not replaced with fabricated documents", async () => {
  vi.mocked(digilocker.documents).mockResolvedValue({ documents: [], session: { id: "session-a", status: "AUTHENTICATED", expiresAt: null, progress: [] } });
  sessionStorage.setItem("readines.digilocker.session:owner-a", "session-a");
  window.history.replaceState(null, "", "/documents#digilocker=session-a");
  render(<DigiLockerDialog />);
  await screen.findByText(/DigiLocker returned no issued documents/);
  expect((screen.getByText("Import Selected") as HTMLButtonElement).disabled).toBe(true);
});
it("missing sessions do not trap the user in an uncloseable dialog", async () => {
  vi.mocked(digilocker.session).mockRejectedValue(Object.assign(new Error("Session not found"), { status: 404 }));
  vi.mocked(digilocker.cancel).mockRejectedValue(Object.assign(new Error("Session not found"), { status: 404 }));
  sessionStorage.setItem("readines.digilocker.session:owner-a", "deleted-session");
  render(<DigiLockerDialog />); fireEvent.click(screen.getByText("DigiLocker"));
  await screen.findByText("Session not found");
  fireEvent.click(screen.getByText("Cancel"));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(sessionStorage.getItem("readines.digilocker.session:owner-a")).toBeNull();

});
it("recovers a pending authorization and loads its documents when the backend completes consent", async () => {
  vi.mocked(digilocker.session)
    .mockResolvedValueOnce({ id: "session-a", status: "PENDING", expiresAt: null, progress: [] })
    .mockResolvedValue({ id: "session-a", status: "AUTHENTICATED", expiresAt: null, progress: [] });
  let finishListing!: (value: Awaited<ReturnType<typeof digilocker.documents>>) => void;
  vi.mocked(digilocker.documents).mockImplementation(() => new Promise(resolve => { finishListing = resolve; }));
  sessionStorage.setItem("readines.digilocker.session:owner-a", "session-a");
  render(<DigiLockerDialog />); fireEvent.click(screen.getByText("DigiLocker"));
  await waitFor(() => expect(digilocker.documents).toHaveBeenCalledWith("session-a", expect.any(AbortSignal)));
  finishListing({ documents: docs, session: { id: "session-a", status: "AUTHENTICATED", expiresAt: null, progress: [] } });
  await screen.findByLabelText("Select Certificate one");
  expect(screen.queryByText(/Authorization was not completed/)).toBeNull();
});
it("resumes a running import and refreshes the normal Documents library on completion", async () => {
  vi.mocked(digilocker.session)
    .mockResolvedValueOnce({ id: "session-a", status: "IMPORTING", expiresAt: null, progress: [{ reference: "cert-1", phase: "Encrypting" }] })
    .mockResolvedValue({ id: "session-a", status: "AUTHENTICATED", expiresAt: null, progress: [{ reference: "cert-1", phase: "Completed", documentId: "saved-document" }] });
  await connected();
  await screen.findByText("Completed");
  expect(dispatch).toHaveBeenCalledWith({ type: "refresh" });
  expect((screen.getByLabelText("Select Certificate one") as HTMLInputElement).disabled).toBe(true);
});
it("allows retrying an initial connection check before any session exists", async () => {
  vi.mocked(digilocker.status).mockRejectedValueOnce(new Error("Network interrupted"));
  render(<DigiLockerDialog />); fireEvent.click(screen.getByText("DigiLocker"));
  await screen.findByText("Network interrupted");
  fireEvent.click(screen.getByText("Refresh Status"));
  await waitFor(() => expect((screen.getByText("Connect DigiLocker") as HTMLButtonElement).disabled).toBe(false));
  expect(digilocker.status).toHaveBeenCalledTimes(2);
  expect(digilocker.session).not.toHaveBeenCalled();
});
it("aborts a pending initialization request when the dialog unmounts", async () => {
  let signal: AbortSignal | undefined;
  vi.mocked(digilocker.status).mockImplementation(current => { signal = current; return new Promise(() => {}); });
  const view = render(<DigiLockerDialog />); fireEvent.click(screen.getByText("DigiLocker"));
  expect(signal?.aborted).toBe(false);
  view.unmount();
  expect(signal?.aborted).toBe(true);
});

it("discards another account's pending session before loading private status", async () => {
  sessionStorage.setItem("readines.digilocker.session:other-owner", "other-session");
  render(<DigiLockerDialog />); fireEvent.click(screen.getByText("DigiLocker"));
  await waitFor(() => expect((screen.getByText("Connect DigiLocker") as HTMLButtonElement).disabled).toBe(false));
  expect(digilocker.session).not.toHaveBeenCalled();
  expect(digilocker.documents).not.toHaveBeenCalled();
  expect(sessionStorage.getItem("readines.digilocker.session:owner-a")).toBeNull();
  expect(sessionStorage.getItem("readines.digilocker.session:other-owner")).toBe("other-session");
});

it("a timed-out initialization releases controls and offers retry", async () => {
  vi.useFakeTimers();
  try {
    vi.mocked(digilocker.status).mockImplementation(signal => new Promise((_resolve, reject) => {
      signal?.addEventListener("abort", () => reject(signal.reason), {once:true});
    }));
    render(<DigiLockerDialog />); fireEvent.click(screen.getByText("DigiLocker"));
    await act(async () => { await vi.advanceTimersByTimeAsync(20_000); });
    expect(screen.getByText(/Connection check timed out/)).toBeTruthy();
    expect((screen.getByText("Cancel") as HTMLButtonElement).disabled).toBe(false);
    expect((screen.getByText("Refresh Status") as HTMLButtonElement).disabled).toBe(false);
  } finally { vi.useRealTimers(); }
});
it("renders provider documents in bounded pages and caps batch selection at fifty", async () => {
  const many = Array.from({length:120},(_,index)=>({...docs[0],reference:`fixture-${index}`,name:`Fixture ${index}`}));
  vi.mocked(digilocker.documents).mockResolvedValue({documents:many,session:{id:"session-a",status:"AUTHENTICATED",expiresAt:null,progress:[]}});
  sessionStorage.setItem("readines.digilocker.session:owner-a", "session-a");
  render(<DigiLockerDialog />); fireEvent.click(screen.getByText("DigiLocker"));
  await screen.findByLabelText("Select Fixture 0");
  expect(screen.getAllByRole("checkbox")).toHaveLength(50);
  fireEvent.click(screen.getByText("Show More Documents (70)"));
  expect(screen.getAllByRole("checkbox")).toHaveLength(100);
  fireEvent.click(screen.getByText("Select First 50"));
  expect(screen.getAllByRole("checkbox").filter(input=>(input as HTMLInputElement).checked)).toHaveLength(50);
});
it("traps keyboard focus, supports Escape and returns focus to the opener", async () => {
  const rectangles = vi.spyOn(HTMLElement.prototype,"getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
  try {
    render(<DigiLockerDialog />);
    const opener = screen.getByText("DigiLocker"); opener.focus(); fireEvent.click(opener);
    await waitFor(()=>expect((screen.getByText("Connect DigiLocker") as HTMLButtonElement).disabled).toBe(false));
    screen.getByText("Connect DigiLocker").focus(); fireEvent.keyDown(document,{key:"Tab"});
    expect(document.activeElement).toBe(screen.getByText("Cancel"));
    fireEvent.keyDown(document,{key:"Tab",shiftKey:true});
    expect(document.activeElement).toBe(screen.getByText("Connect DigiLocker"));
    fireEvent.keyDown(document,{key:"Escape"});
    await waitFor(()=>expect(screen.queryByRole("dialog")).toBeNull());
    expect(document.activeElement).toBe(opener);
  } finally { rectangles.mockRestore(); }
});
it("defers background polling until the document becomes visible", async () => {
  const hidden = vi.spyOn(document,"hidden","get").mockReturnValue(true);
  try {
    vi.mocked(digilocker.session).mockResolvedValue({id:"session-a",status:"IMPORTING",expiresAt:null,progress:[]});
    await connected();
    expect(digilocker.session).toHaveBeenCalledTimes(1);
    hidden.mockReturnValue(false); fireEvent(document,new Event("visibilitychange"));
    await waitFor(()=>expect(digilocker.session).toHaveBeenCalledTimes(2));
  } finally { hidden.mockRestore(); }
});
