// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PackSummary } from "@/lib/api";

const { refresh, dispatch, clearCache } = vi.hoisted(() => ({ refresh: vi.fn(), dispatch: vi.fn(), clearCache: vi.fn(async () => undefined) }));
vi.mock("@/lib/api", () => ({ api: { packages: { refresh } } }));
vi.mock("@/store/hooks", () => ({ useAppDispatch: () => dispatch }));
vi.mock("@/packages/packageCatalogueCache", () => ({ clearPackageCatalogueCache: clearCache }));
vi.mock("@/store/slices/packagesSlice", () => ({ updateRefreshedPackage: (payload: unknown) => ({ type: "upsert", payload }), invalidatePackagePages: () => ({ type: "invalidate" }) }));
vi.mock("@/store/slices/usageSlice", () => ({ refreshUsage: () => ({ type: "usage" }) }));
import Header from "./pack-detail-header";

const pack: PackSummary = { id: "id-1", slug: "process", title: "Process", category: "Category", description: "Description", requirements: [], source: { lastCheckedAt: "2026-10-04" } };
const header = () => <Header pack={pack} completion={50} isComplete={false} readyCount={1} totalCount={2} onClose={vi.fn()} />;

describe("existing package refresh control", () => {
  afterEach(cleanup);
  beforeEach(() => { vi.clearAllMocks(); });
  it("spins the existing icon, blocks repeated clicks and updates the open package", async () => {
    let finish!: (value: unknown) => void;
    refresh.mockReturnValue(new Promise(resolve => { finish = resolve; }));
    render(header());
    const button = screen.getByRole("button", { name: "Check again now" }) as HTMLButtonElement;
    fireEvent.click(button); fireEvent.click(button);
    expect(button.disabled).toBe(true);
    expect(button.querySelector("svg")?.classList.contains("lp-pack-refresh-spinning")).toBe(true);
    expect(refresh).toHaveBeenCalledExactlyOnceWith("process");
    const latest = { ...pack, source: { lastCheckedAt: "2026-10-05" } };
    await act(async () => finish({ package: latest, changed: true, message: "Updated with the latest requirements" }));
    expect(screen.getByRole("status").textContent).toBe("Updated with the latest requirements");
    expect(dispatch).toHaveBeenCalledWith({ type: "upsert", payload: latest });
    expect(dispatch).toHaveBeenCalledWith({ type: "invalidate" });
    expect(clearCache).toHaveBeenCalledOnce();
    expect(button.disabled).toBe(false);
  });
  it("shows the no-change result without closing the panel", async () => {
    refresh.mockResolvedValue({ package: pack, changed: false, message: "Checked — no changes found" });
    render(header()); fireEvent.click(screen.getByRole("button", { name: "Check again now" }));
    await waitFor(() => expect(screen.getByRole("status").textContent).toBe("Checked — no changes found"));
    expect(screen.getByRole("heading", { name: "Process" })).toBeTruthy();
  });
  it("leaves requirements/cache unchanged on research failure", async () => {
    refresh.mockRejectedValue(new Error("Sources could not be validated"));
    render(header()); fireEvent.click(screen.getByRole("button", { name: "Check again now" }));
    await waitFor(() => expect(screen.getByRole("alert").textContent).toBe("Sources could not be validated"));
    expect(dispatch.mock.calls.some(([action]) => action.type === "upsert")).toBe(false);
    expect(clearCache).not.toHaveBeenCalled();
  });
});
