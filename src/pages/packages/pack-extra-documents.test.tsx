// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
const uploadProps = vi.hoisted(() => vi.fn());
vi.mock("@/components/UploadDocumentModal", () => ({ default: (props: { scanByDefault: boolean; unknownAsOther: boolean; onSaved: (document: unknown) => void }) => { uploadProps(props); return <button onClick={() => props.onSaved({ id: "new-file", documentType: "Other" })}>Save scanned upload</button>; } }));
import PackExtraDocuments from "./pack-extra-documents";
afterEach(() => { cleanup(); vi.clearAllMocks(); });
it("offers scanning a new upload even with no existing vault documents", () => {
  const uploaded = vi.fn();
  render(<PackExtraDocuments documents={[]} selected={new Set()} onChange={vi.fn()} onClose={vi.fn()} onUploaded={uploaded} />);
  fireEvent.click(screen.getByRole("button", { name: "Upload and scan a document" }));
  expect(uploadProps).toHaveBeenCalledWith(expect.objectContaining({ scanByDefault: true, unknownAsOther: true }));
  fireEvent.click(screen.getByRole("button", { name: "Save scanned upload" }));
  expect(uploaded).toHaveBeenCalledWith({ id: "new-file", documentType: "Other" });
});
