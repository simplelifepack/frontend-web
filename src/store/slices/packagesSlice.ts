import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { api, type PackageListItem, type PackageListQuery, type PackageListResponse, type PackSummary } from "@/lib/api";
import type { RootState } from "../index";
import { clearPackageCatalogueCache, packagePageCacheKey, readAllPackagePages, readPackagePage, writePackagePage, type CachedPackagePage } from "@/packages/packageCatalogueCache";

const DEFAULT_LIMIT = 20;

type PackagesState = {
  catalogueItems: PackageListItem[];
  items: PackageListItem[];
  summariesBySlug: Record<string, PackageListItem>;
  detailsBySlug: Record<string, PackSummary>;
  pageKeys: Record<string, string[]>;
  pagination: PackageListResponse["pagination"] | null;
  paginationByKey: Record<string, PackageListResponse["pagination"]>;
  searchCanGenerate: boolean;
  searchHasConfidentMatch: boolean;
  activeKey: string;
  status: "idle" | "loading" | "succeeded" | "failed";
  searchStatus: "idle" | "loading" | "succeeded" | "failed";
  generationStatus: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  loaded: boolean;
};

const initialState: PackagesState = {
  items: [],
  catalogueItems: [],
  summariesBySlug: {},
  detailsBySlug: {},
  pageKeys: {},
  pagination: null,
  paginationByKey: {},
  searchCanGenerate: false,
  searchHasConfidentMatch: false,
  activeKey: "",
  status: "idle",
  searchStatus: "idle",
  generationStatus: "idle",
  error: null,
  loaded: false,
};

function applyPackSummary(state: PackagesState, pack: PackSummary) {
  state.detailsBySlug[pack.slug] = pack;
  const summary = toListItem(pack);
  state.summariesBySlug[summary.slug] = summary;
  const index = state.items.findIndex((item) => item.slug === pack.slug);
  if (index >= 0) {
    state.items[index] = summary;
  } else {
    state.items.unshift(summary);
  }
}

function queryKey(query: PackageListQuery = {}) {
  return packagePageCacheKey(query);
}

export const fetchPackages = createAsyncThunk(
  "packages/fetchPackages",
  async (query: PackageListQuery | undefined) => {
    const resolved = { limit: DEFAULT_LIMIT, page: 1, sort: "category" as const, ...query };
    const key = queryKey(resolved);
    const hydratedPages = (await readAllPackagePages().catch(() => [])).filter(isValidCachedPage);
    const cachedPage = hydratedPages.find((page) => page.key === key) ?? await readPackagePage(key).catch(() => null);
    const cached = cachedPage && isValidCachedPage(cachedPage) ? cachedPage : null;
    if (cached) {
      const response = await hydrateSearchRequirements(resolved, cached.response);
      return { key, query: resolved, response, hydratedPages, source: "cache" as const };
    }
    const response = await hydrateSearchRequirements(resolved, await api.packages.list(resolved));
    const page: CachedPackagePage = { key, query: resolved, response };
    await writePackagePage(page).catch(() => undefined);
    return {
      key,
      query: resolved,
      response,
      hydratedPages,
      source: "api" as const,
    };
  },
  {
    condition: (query, { getState }) => {
      const state = (getState() as RootState).packages;
      const key = queryKey({ limit: DEFAULT_LIMIT, page: 1, sort: "category", ...query });
      return state.status !== "loading" && !state.pageKeys[key];
    },
  },
);

export const assignRequirementDocument = createAsyncThunk(
  "packages/assignRequirementDocument",
  async (input: { assignmentSource: "USER_SELECTED" | "USER_OVERRIDE"; documentId: string; requirementId: string; slug: string }) => {
    const response = await api.packages.assignRequirementDocument(input.slug, input.requirementId, {
      documentId: input.documentId,
      assignmentSource: input.assignmentSource,
    });
    await clearPackageCatalogueCache();
    return response.package;
  },
);

export const clearRequirementDocument = createAsyncThunk(
  "packages/clearRequirementDocument",
  async (input: { requirementId: string; slug: string }) => {
    const response = await api.packages.clearRequirementDocument(input.slug, input.requirementId);
    await clearPackageCatalogueCache();
    return response.package;
  },
);

const packagesSlice = createSlice({
  name: "packages",
  initialState,
  reducers: {
    setActivePackageQuery: (state, action: PayloadAction<PackageListQuery | undefined>) => {
      const key = queryKey({ limit: DEFAULT_LIMIT, page: 1, sort: "category", ...action.payload });
      state.activeKey = key;
      state.items = (state.pageKeys[key] ?? []).flatMap((slug) => state.summariesBySlug[slug] ? [state.summariesBySlug[slug]] : []);
      state.pagination = state.paginationByKey[key] ?? null;
    },
    upsertPackage: (state, action: PayloadAction<PackSummary>) => {
      applyPackSummary(state, action.payload);
    },
    setPackageGenerationStatus: (state, action: PayloadAction<PackagesState["generationStatus"]>) => {
      state.generationStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPackages.pending, (state, action) => {
        state.error = null;
        state.activeKey = queryKey({ limit: DEFAULT_LIMIT, page: 1, sort: "category", ...action.meta.arg });
        const isSearch = Boolean(action.meta.arg?.search);
        state[isSearch ? "searchStatus" : "status"] = "loading";
      })
      .addCase(fetchPackages.fulfilled, (state, action) => {
        const { key, query, response, hydratedPages } = action.payload;
        hydratePages(state, hydratedPages);
        response.items.forEach((item) => {
          state.summariesBySlug[item.slug] = item;
          state.detailsBySlug[item.slug] = item;
        });
        if (!query.search) {
          state.catalogueItems = mergeUniquePackages(state.catalogueItems, response.items);
        }
        state.pageKeys[key] = response.items.map((item) => item.slug);
        state.paginationByKey[key] = response.pagination;
        if (state.activeKey === key) {
          state.items = response.items;
          state.pagination = response.pagination;
          state.searchCanGenerate = response.canGenerate;
          state.searchHasConfidentMatch = response.hasConfidentMatch;
        }
        state.loaded = true;
        state.status = "succeeded";
        state.searchStatus = "succeeded";
      })
      .addCase(fetchPackages.rejected, (state, action) => {
        state.status = "failed";
        state.searchStatus = "failed";
        state.error = action.error.message ?? "Unable to fetch packages.";
      })
      .addMatcher(
        (action) => [assignRequirementDocument.fulfilled.type, clearRequirementDocument.fulfilled.type].includes(action.type),
        (state, action: { payload: PackSummary }) => {
          applyPackSummary(state, action.payload);
        },
      )
      ;
  },
});

function toListItem(pack: PackSummary): PackageListItem {
  return pack;
}

function mergeUniquePackages(existing: PackageListItem[], incoming: PackageListItem[]) {
  const byId = new Map(existing.map((item) => [item.id, item]));
  incoming.forEach((item) => byId.set(item.id, item));
  return [...byId.values()];
}

async function hydrateSearchRequirements(query: PackageListQuery, response: PackageListResponse): Promise<PackageListResponse> {
  if (!query.search) return response;
  const hydratedItems = await Promise.all(response.items.map(async (item) => {
    if (Array.isArray(item.requirements) && item.requirements.length > 0) return item;
    return api.packages.get(item.slug);
  }));
  return { ...response, items: hydratedItems };
}

function isValidCachedPage(page: CachedPackagePage | null | undefined): page is CachedPackagePage {
  if (!page?.response || !Array.isArray(page.response.items) || !page.response.pagination) return false;
  if (!page.query.search && page.response.items.length === 0) return false;
  return true;
}

function hydratePages(state: PackagesState, pages: CachedPackagePage[]) {
  pages.forEach((page) => {
    page.response.items.forEach((item) => { state.summariesBySlug[item.slug] = item; state.detailsBySlug[item.slug] = item; });
    state.pageKeys[page.key] = page.response.items.map((item) => item.slug);
    state.paginationByKey[page.key] = page.response.pagination;
    if (!page.query.search) state.catalogueItems = mergeUniquePackages(state.catalogueItems, page.response.items);
  });
}

export const { setActivePackageQuery, setPackageGenerationStatus, upsertPackage } = packagesSlice.actions;
export default packagesSlice.reducer;
