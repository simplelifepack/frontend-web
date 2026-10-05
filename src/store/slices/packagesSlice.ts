import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { api, type PackageListItem, type PackageListQuery, type PackageListResponse, type PackSummary } from "@/lib/api";
import type { RootState } from "../index";
import { clearPackageCatalogueCache, packagePageCacheKey, readAllPackagePages, readPackagePage, writePackagePage, type CachedPackagePage } from "@/packages/packageCatalogueCache";
import { createCustomPack, deleteCustomPack, updateCustomPack } from "./customPackThunks";

const DEFAULT_LIMIT = 20;

type FetchPackagesQuery = PackageListQuery & {
  background?: boolean;
  forceRefresh?: boolean;
};

type PackagesState = {
  catalogueItems: PackageListItem[];
  items: PackageListItem[];
  summariesBySlug: Record<string, PackageListItem>;
  detailsBySlug: Record<string, PackSummary>;
  categories: string[];
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
  categories: [],
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

function applyPackSummary(state: PackagesState, pack: PackSummary, insert = true) {
  state.detailsBySlug[pack.slug] = pack;
  const summary = toListItem(pack);
  state.summariesBySlug[summary.slug] = summary;
  const index = state.items.findIndex((item) => item.slug === pack.slug);
  if (index >= 0) {
    state.items[index] = summary;
  } else if (insert) {
    state.items.unshift(summary);
  }
  state.catalogueItems = mergeUniquePackages(state.catalogueItems, [summary]);
}

function queryKey(query: PackageListQuery = {}) {
  return packagePageCacheKey(query);
}

export const fetchPackages = createAsyncThunk(
  "packages/fetchPackages",
  async (query: FetchPackagesQuery | undefined) => {
    const { background, forceRefresh, ...resolved } = { limit: DEFAULT_LIMIT, page: 1, sort: "category" as const, ...query };
    const key = queryKey(resolved);
    const hydratedPages = (await readAllPackagePages().catch(() => [])).filter(isValidCachedPage);
    const cachedPage = hydratedPages.find((page) => page.key === key) ?? await readPackagePage(key).catch(() => null);
    const cached = cachedPage && isValidCachedPage(cachedPage) ? cachedPage : null;
    if (cached && !forceRefresh && !resolved.search) {
      const response = await hydrateSearchRequirements(resolved, cached.response);
      const refreshedPages = await refreshCategoryPagesForSearch(resolved, response);
      return { key, query: resolved, response, hydratedPages, refreshedPages, background: Boolean(background), source: "cache" as const };
    }
    const response = await hydrateSearchRequirements(resolved, await api.packages.list(resolved));
    const refreshedPages = await refreshCategoryPagesForSearch(resolved, response);
    const page: CachedPackagePage = { key, query: resolved, response };
    await writePackagePage(page).catch(() => undefined);
    return {
      key,
      query: resolved,
      response,
      hydratedPages,
      refreshedPages,
      background: Boolean(background),
      source: "api" as const,
    };
  },
  {
    condition: (query, { getState }) => {
      const state = (getState() as RootState).packages;
      const { background: _background, forceRefresh, ...resolved } = { limit: DEFAULT_LIMIT, page: 1, sort: "category" as const, ...query };
      const key = queryKey(resolved);
      return state.status !== "loading" && (Boolean(forceRefresh) || !state.pageKeys[key]);
    },
  },
);

export const fetchPackageDetail = createAsyncThunk(
  "packages/fetchPackageDetail",
  async (slug: string) => api.packages.get(slug),
  {
    condition: (slug, { getState }) => {
      const state = (getState() as RootState).packages;
      return Boolean(slug && !state.detailsBySlug[slug]);
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
    updateRefreshedPackage: (state, action: PayloadAction<PackSummary>) => { applyPackSummary(state, action.payload, false); },
    invalidatePackagePages: (state) => {
      state.pageKeys = {}; state.paginationByKey = {};
    },
    setActivePackageQuery: (state, action: PayloadAction<PackageListQuery | undefined>) => {
      const key = queryKey({ limit: DEFAULT_LIMIT, page: 1, sort: "category", ...action.payload });
      state.activeKey = key;
      state.items = (state.pageKeys[key] ?? []).flatMap((slug) => state.summariesBySlug[slug] ? [state.summariesBySlug[slug]] : []);
      state.pagination = state.paginationByKey[key] ?? null;
    },
    upsertPackage: (state, action: PayloadAction<PackSummary>) => {
      applyPackSummary(state, action.payload);
      state.catalogueItems = mergeUniquePackages(state.catalogueItems, [toListItem(action.payload)]);
    },
    setPackageGenerationStatus: (state, action: PayloadAction<PackagesState["generationStatus"]>) => {
      state.generationStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPackages.pending, (state, action) => {
        state.error = null;
        const { background: _background, forceRefresh: _forceRefresh, ...resolved } = { limit: DEFAULT_LIMIT, page: 1, sort: "category" as const, ...action.meta.arg };
        if (!action.meta.arg?.background) state.activeKey = queryKey(resolved);
        const isSearch = Boolean(action.meta.arg?.search);
        state[isSearch ? "searchStatus" : "status"] = "loading";
      })
      .addCase(fetchPackages.fulfilled, (state, action) => {
        const { key, query, response, hydratedPages, refreshedPages, background } = action.payload;
        hydratePages(state, [...hydratedPages, ...refreshedPages]);
        response.items.forEach((item) => {
          state.summariesBySlug[item.slug] = item;
        });
        if (!query.search || response.items.length > 0) {
          state.catalogueItems = mergeUniquePackages(state.catalogueItems, response.items);
        }
        state.pageKeys[key] = response.items.map((item) => item.slug);
        state.paginationByKey[key] = response.pagination;
        if (Array.isArray(response.categories)) state.categories = response.categories;
        if (!background && state.activeKey === key) {
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
      .addCase(fetchPackageDetail.fulfilled, (state, action) => {
        applyPackSummary(state, action.payload, false);
      })
      .addCase(deleteCustomPack.fulfilled, (state, action) => {
        const slug = action.payload;
        delete state.summariesBySlug[slug];
        delete state.detailsBySlug[slug];
        state.items = state.items.filter((item) => item.slug !== slug);
        state.catalogueItems = state.catalogueItems.filter((item) => item.slug !== slug);
        Object.keys(state.pageKeys).forEach((key) => {
          state.pageKeys[key] = state.pageKeys[key].filter((item) => item !== slug);
        });
      })
      .addMatcher(
        (action) => [assignRequirementDocument.fulfilled.type, clearRequirementDocument.fulfilled.type, createCustomPack.fulfilled.type, updateCustomPack.fulfilled.type].includes(action.type),
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

async function refreshCategoryPagesForSearch(query: PackageListQuery, response: PackageListResponse) {
  if (!query.search) return [];
  const categories = [...new Set(response.items.map((item) => item.category).filter(Boolean))];
  const pages = await Promise.all(categories.map(async (category) => {
    const categoryQuery = { category, limit: DEFAULT_LIMIT, page: 1, sort: "category" as const };
    const categoryResponse = await api.packages.list(categoryQuery);
    const page: CachedPackagePage = { key: queryKey(categoryQuery), query: categoryQuery, response: categoryResponse };
    await writePackagePage(page).catch(() => undefined);
    return page;
  }));
  return pages.filter(isValidCachedPage);
}

function isValidCachedPage(page: CachedPackagePage | null | undefined): page is CachedPackagePage {
  if (!page?.response || !Array.isArray(page.response.items) || !page.response.pagination) return false;
  if (!page.query.search && page.response.items.length === 0) return false;
  return true;
}

function hydratePages(state: PackagesState, pages: CachedPackagePage[]) {
  pages.forEach((page) => {
    page.response.items.forEach((item) => { state.summariesBySlug[item.slug] = item; });
    state.pageKeys[page.key] = page.response.items.map((item) => item.slug);
    state.paginationByKey[page.key] = page.response.pagination;
    if (!page.query.search) state.catalogueItems = mergeUniquePackages(state.catalogueItems, page.response.items);
  });
}

export const { invalidatePackagePages, setActivePackageQuery, setPackageGenerationStatus, updateRefreshedPackage, upsertPackage } = packagesSlice.actions;
export { createCustomPack, deleteCustomPack, updateCustomPack };
export default packagesSlice.reducer;
