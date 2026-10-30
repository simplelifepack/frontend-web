import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import CustomPackModal from "./custom-pack-modal";
import { api } from "@/lib/api";
vi.mock("@/lib/api", () => ({ api: { packages: { createCustomGenerationJob: vi.fn(), getCustomGenerationJob: vi.fn() } } }));
vi.mock("@/components/UploadDocumentModal", () => ({ default: () => null }));
afterEach(() => { cleanup(); vi.useRealTimers(); vi.resetAllMocks(); });
it("stops queued generation polling when the modal unmounts", async () => {
  vi.useFakeTimers();
  vi.mocked(api.packages.createCustomGenerationJob).mockResolvedValue({ job: { id: "job-a", status: "queued", statusMessage: "Queued" } } as never);
  vi.mocked(api.packages.getCustomGenerationJob).mockResolvedValue({ job: { id: "job-a", status: "failed" } } as never);
  const view = render(<CustomPackModal initialDescription="School admission" documentLabels={[]} supportedDocumentTypes={[]} onClose={vi.fn()} onSave={vi.fn()} />);
  await act(async () => fireEvent.click(screen.getByText("Look it up for me")));
  view.unmount();
  await act(async () => { await vi.advanceTimersByTimeAsync(3000); });
  expect(api.packages.getCustomGenerationJob).not.toHaveBeenCalled();
});
it("aborts an active generation request when the modal closes", async () => {
  vi.mocked(api.packages.createCustomGenerationJob).mockImplementation(() => new Promise(() => {}));
  const view = render(<CustomPackModal initialDescription="School admission" documentLabels={[]} supportedDocumentTypes={[]} onClose={vi.fn()} onSave={vi.fn()} />);
  fireEvent.click(screen.getByText("Look it up for me"));
  const signal = vi.mocked(api.packages.createCustomGenerationJob).mock.calls[0][2];
  expect(signal?.aborted).toBe(false);
  view.unmount();
  expect(signal?.aborted).toBe(true);
});
it("paces running jobs instead of issuing an immediate request loop", async () => {
  vi.useFakeTimers();
  const job = { id: "job-a", status: "researching", statusMessage: "Working" };
  vi.mocked(api.packages.createCustomGenerationJob).mockResolvedValue({ job } as never);
  vi.mocked(api.packages.getCustomGenerationJob).mockResolvedValue({ job } as never);
  const view = render(<CustomPackModal initialDescription="School admission" documentLabels={[]} supportedDocumentTypes={[]} onClose={vi.fn()} onSave={vi.fn()} />);
  await act(async () => fireEvent.click(screen.getByText("Look it up for me")));
  await act(async () => { await vi.advanceTimersByTimeAsync(1499); });
  expect(api.packages.getCustomGenerationJob).not.toHaveBeenCalled();
  await act(async () => { await vi.advanceTimersByTimeAsync(1); });
  expect(api.packages.getCustomGenerationJob).toHaveBeenCalledTimes(1);
  view.unmount();
});
