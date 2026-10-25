// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { DocumentRecord } from "@/lib/api";
import type { DerivedRequirement } from "@/readiness/calculatePackageReadiness";
import { PackDownloadCard } from "./pack-download-card";
import PackExtraDocuments from "./pack-extra-documents";
afterEach(cleanup);
const document = { id: "doc", title: "Passport", originalName: "passport.pdf", fields: { assignedPerson: { name: "Alex" } } } as unknown as DocumentRecord;
const slot = { id: "req", title: "Passport", matchedDocument: { id: "doc" } } as DerivedRequirement;
it("lists one checkbox per actual file and supports selection and adding documents", () => {
  const toggle = vi.fn(), add = vi.fn();
  render(<PackDownloadCard documents={[document]} found={[slot, { ...slot, id: "second" }]} selectedCount={1} downloadIds={new Set()} downloading={false} downloadError={null} onToggle={toggle} onAddAnother={add} onDownload={vi.fn()} />);
  expect(screen.getAllByRole("checkbox")).toHaveLength(1);
  fireEvent.click(screen.getByRole("checkbox")); expect(toggle).toHaveBeenCalledWith("doc");
  fireEvent.click(screen.getByRole("button", { name: "Add another document" })); expect(add).toHaveBeenCalledOnce();
});
it("searches extra documents and selects them for download", () => {
  const change = vi.fn();
  render(<PackExtraDocuments documents={[document]} selected={new Set()} onChange={change} onClose={vi.fn()} />);
  fireEvent.click(screen.getByRole("checkbox")); expect(change).toHaveBeenCalledWith("doc");
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "unrelated" } });
  expect(screen.queryByRole("checkbox")).toBeNull();
});

it("always offers adding another document when no package requirements are ready", () => {
  const add = vi.fn();
  const view = (found: DerivedRequirement[], selectedCount: number) => <PackDownloadCard documents={[document]} found={found} selectedCount={selectedCount} downloadIds={new Set()} downloading={false} downloadError={null} onToggle={vi.fn()} onAddAnother={add} onDownload={vi.fn()} />;
  const { rerender } = render(view([], 0));
  expect((screen.getByRole("button", { name: "Download" }) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Add another document" }));
  expect(add).toHaveBeenCalledOnce();
  rerender(view([{ ...slot, id: "extra-doc" }], 1));
  expect(screen.getByRole("checkbox")).toBeTruthy();
  expect((screen.getByRole("button", { name: "Download" }) as HTMLButtonElement).disabled).toBe(false);
});
