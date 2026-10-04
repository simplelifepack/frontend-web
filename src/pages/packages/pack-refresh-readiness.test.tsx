// @vitest-environment jsdom
import { configureStore } from "@reduxjs/toolkit";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider, useSelector } from "react-redux";
import { afterEach, expect, it, vi } from "vitest";
import type { DocumentRecord, PackSummary } from "@/lib/api";
import { calculatePackReadiness } from "@/readiness/calculatePackageReadiness";

const { refresh, clearCache } = vi.hoisted(() => ({ refresh: vi.fn(), clearCache: vi.fn(async () => undefined) }));
vi.mock("@/lib/api", () => ({ api: { packages: { refresh }, usage: vi.fn(async () => null) } }));
vi.mock("@/packages/packageCatalogueCache", () => ({ clearPackageCatalogueCache: clearCache, packagePageCacheKey: () => "page", readAllPackagePages: vi.fn(), readPackagePage: vi.fn(), writePackagePage: vi.fn() }));
import reducer, { upsertPackage } from "@/store/slices/packagesSlice";
import Header from "./pack-detail-header";

afterEach(cleanup);
it("a refreshed checklist immediately recalculates readiness and READY on the open panel", async () => {
  const requirement = { id: "identity", title: "Identity", required: true, acceptedDocumentTypes: ["identity_proof"] };
  const pack: PackSummary = { id: "pack-1", slug: "process", title: "Process", category: "Category", description: "Description", requirements: [requirement, { id: "other", title: "Other document", required: true, acceptedDocumentTypes: ["other"] }] };
  const doc = { id: "doc-1", normalizedType: "identity_proof", owner: "self", confidence: 95, createdAt: "2026-10-04" } as DocumentRecord;
  const app = configureStore({ reducer: { packages: reducer } });
  app.dispatch(upsertPackage(pack));
  function Panel() {
    const current = useSelector((state: ReturnType<typeof app.getState>) => state.packages.detailsBySlug.process);
    const readiness = calculatePackReadiness(current.requirements, [doc]);
    return <Header pack={current} completion={readiness.percentage} isComplete={readiness.percentage === 100} readyCount={readiness.satisfiedRequired} totalCount={readiness.totalRequired} onClose={vi.fn()} />;
  }
  refresh.mockResolvedValue({ package: { ...pack, requirements: [requirement], source: { lastCheckedAt: "2026-10-05" }, verificationSources: [{ title: "Updated official checklist", organization: "Authority", type: "authority", url: "https://authority.example/process", retrievedAt: "2026-10-05" }] }, changed: true, message: "Updated with the latest requirements" });
  render(<Provider store={app}><Panel /></Provider>);
  expect(screen.getByText("50")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Check again now" }));
  await waitFor(() => expect(screen.getByText("100")).toBeTruthy());
  expect(screen.getByText("READY")).toBeTruthy();
  expect(screen.getByRole("link", { name: "Updated official checklist" })).toBeTruthy();
  expect(screen.getByText("Checked Oct 5, 2026")).toBeTruthy();
  expect(app.getState().packages.items[0]!.requirements).toHaveLength(1);
  expect(app.getState().packages.catalogueItems[0]!.requirements).toHaveLength(1);
  expect(clearCache).toHaveBeenCalled();
});
