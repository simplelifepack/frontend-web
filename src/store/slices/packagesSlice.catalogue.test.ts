import { configureStore } from "@reduxjs/toolkit";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { cache, list } = vi.hoisted(() => ({
  cache: new Map<string, { key: string; query: any; response: any }>(),
  list: vi.fn(),
}));

vi.mock("@/packages/packageCatalogueCache", () => ({
  packagePageCacheKey: (query: any = {}) => `packages:limit=${query.limit ?? 20}:page=${query.page ?? 1}:sort=${query.sort ?? "category"}:search=${query.search ?? ""}`,
  readAllPackagePages: vi.fn(async () => [...cache.values()]),
  readPackagePage: vi.fn(async (key: string) => cache.get(key) ?? null),
  writePackagePage: vi.fn(async (page: any) => { cache.set(page.key, page); }),
}));
vi.mock("@/lib/api", () => ({ api: { packages: { list, get: vi.fn() } } }));

import reducer, { fetchPackages, setActivePackageQuery } from "./packagesSlice";

const key = (page: number, search = "") => `packages:limit=20:page=${page}:sort=category:search=${search}`;
const response = (page: number, start: number, count = 20) => ({
  query: "", matches: [], hasConfidentMatch: false, canGenerate: false,
  pagination: { page, limit: 20, total: 60, hasNextPage: page < 3 },
  items: Array.from({ length: count }, (_, offset) => ({
    id: `id-${start + offset}`, slug: `pack-${start + offset}`, name: `Pack ${start + offset}`,
    title: start + offset === 25 ? "Car Loan" : `Pack ${start + offset}`, subtitle: null,
    category: "Finance", provider: null, location: null, description: "Package", shortDescription: "Package",
    icon: null, sourceType: "official", sourceName: null, sourceTitle: null, sourceUrl: null,
    lastCheckedAt: null, verificationSources: [], lastVerifiedAt: null, verificationStatus: "verified" as const,
    createdAt: "2026-01-01T00:00:00.000Z", requiredDocumentCount: 1, readyDocumentCount: 0,
    source: "official", generationSource: "seed", version: 1,
  })),
});
const pageRecord = (page: number, result: ReturnType<typeof response>) => ({ key: key(page), query: { limit: 20, page, sort: "category" as const }, response: result });
const store = () => configureStore({ reducer: { packages: reducer } });

describe("persistent package catalogue", () => {
  beforeEach(() => { cache.clear(); list.mockReset(); });

  it("fetches and caches an empty first page once", async () => {
    list.mockResolvedValue(response(1, 1)); const app = store();
    await app.dispatch(fetchPackages({ page: 1 }));
    expect(list).toHaveBeenCalledTimes(1); expect(cache.has(key(1))).toBe(true);
  });

  it("uses cached page 1 after reload without API", async () => {
    cache.set(key(1), pageRecord(1, response(1, 1))); const app = store();
    await app.dispatch(fetchPackages({ page: 1 })); expect(list).not.toHaveBeenCalled();
  });

  it("uses cached page 2 and fetches uncached page 3 once", async () => {
    cache.set(key(2), pageRecord(2, response(2, 21))); list.mockResolvedValue(response(3, 41)); const app = store();
    await app.dispatch(fetchPackages({ page: 2 })); expect(list).not.toHaveBeenCalled();
    await app.dispatch(fetchPackages({ page: 3 })); expect(list).toHaveBeenCalledTimes(1); expect(cache.has(key(3))).toBe(true);
  });

  it("accumulates page 1 and page 2 into 40 Redux packages", async () => {
    list.mockResolvedValueOnce(response(1, 1)).mockResolvedValueOnce(response(2, 21)); const app = store();
    await app.dispatch(fetchPackages({ page: 1 })); await app.dispatch(fetchPackages({ page: 2 }));
    expect(app.getState().packages.catalogueItems).toHaveLength(40);
  });

  it("deduplicates overlapping package ids", async () => {
    list.mockResolvedValueOnce(response(1, 1)).mockResolvedValueOnce(response(2, 20)); const app = store();
    await app.dispatch(fetchPackages({ page: 1 })); await app.dispatch(fetchPackages({ page: 2 }));
    expect(app.getState().packages.catalogueItems).toHaveLength(39);
    expect(new Set(app.getState().packages.catalogueItems.map((item) => item.id)).size).toBe(39);
  });

  it("hydrates all stored pages into Redux on browser restart", async () => {
    cache.set(key(1), pageRecord(1, response(1, 1))); cache.set(key(2), pageRecord(2, response(2, 21))); const app = store();
    await app.dispatch(fetchPackages({ page: 1 }));
    expect(app.getState().packages.catalogueItems).toHaveLength(40);
    expect(app.getState().packages.pageKeys[key(2)]).toHaveLength(20);
  });

  it("restores the previous catalogue page and pagination after search", async () => {
    cache.set(key(2), pageRecord(2, response(2, 21))); const app = store();
    await app.dispatch(fetchPackages({ page: 2 }));
    app.dispatch(setActivePackageQuery({ page: 2, limit: 20, sort: "category" }));
    expect(app.getState().packages.pagination?.page).toBe(2);
    expect(app.getState().packages.items).toHaveLength(20);
  });

  it("falls back to API when persistent reads fail", async () => {
    const cacheModule = await import("@/packages/packageCatalogueCache");
    vi.mocked(cacheModule.readAllPackagePages).mockRejectedValueOnce(new Error("IndexedDB failed"));
    list.mockResolvedValue(response(1, 1)); const app = store();
    await app.dispatch(fetchPackages({ page: 1 }));
    expect(list).toHaveBeenCalledTimes(1);
  });
});
