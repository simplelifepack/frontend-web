import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { api, type PackageListItem, type PackageListQuery, type PackageListResponse, type PackSummary } from "@/lib/api";
import type { RootState } from "../index";

const DEFAULT_LIMIT = 20;

type PackagesState = {
  catalogueItems: PackageListItem[];
  items: PackageListItem[];
  summariesBySlug: Record<string, PackageListItem>;
  detailsBySlug: Record<string, PackSummary>;
  pageKeys: Record<string, string[]>;
  pagination: PackageListResponse["pagination"] | null;
  searchCanGenerate: boolean;
  searchHasConfidentMatch: boolean;
  activeKey: string;
  status: "idle" | "loading" | "succeeded" | "failed";
  searchStatus: "idle" | "loading" | "succeeded" | "failed";
  generationStatus: "idle" | "loading" | "succeeded" | "failed";
  detailStatusBySlug: Record<string, "idle" | "loading" | "succeeded" | "failed">;
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
  searchCanGenerate: false,
  searchHasConfidentMatch: false,
  activeKey: "",
  status: "idle",
  searchStatus: "idle",
  generationStatus: "idle",
  detailStatusBySlug: {},
  error: null,
  loaded: false,
};

function queryKey(query: PackageListQuery = {}) {
  return JSON.stringify({
    category: query.category ?? "",
    limit: query.limit ?? DEFAULT_LIMIT,
    location: query.location ?? "",
    page: query.page ?? 1,
    provider: query.provider ?? "",
    search: query.search ?? "",
    sort: query.sort ?? "category",
  });
}

export const fetchPackages = createAsyncThunk(
  "packages/fetchPackages",
  async (query: PackageListQuery | undefined) => {
    const resolved = { limit: DEFAULT_LIMIT, page: 1, sort: "category" as const, ...query };
    return {
      key: queryKey(resolved),
      query: resolved,
      response: await api.packages.list(resolved),
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

export const fetchPackageDetail = createAsyncThunk(
  "packages/fetchPackageDetail",
  async (slug: string) => api.packages.get(slug),
  {
    condition: (slug, { getState }) => {
      const state = (getState() as RootState).packages;
      return !state.detailsBySlug[slug] && state.detailStatusBySlug[slug] !== "loading";
    },
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
    },
    upsertPackage: (state, action: PayloadAction<PackSummary>) => {
      state.detailsBySlug[action.payload.slug] = action.payload;
      const summary = toListItem(action.payload);
      state.summariesBySlug[summary.slug] = summary;
      const index = state.items.findIndex((item) => item.slug === action.payload.slug);
      if (index >= 0) {
        state.items[index] = summary;
      } else {
        state.items.unshift(summary);
      }
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
        const { key, query, response } = action.payload;
        response.items.forEach((item) => {
          state.summariesBySlug[item.slug] = item;
        });
        if (!query.search && query.page === 1) {
          state.catalogueItems = response.items;
        }
        state.pageKeys[key] = response.items.map((item) => item.slug);
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
      .addCase(fetchPackageDetail.pending, (state, action) => {
        state.detailStatusBySlug[action.meta.arg] = "loading";
      })
      .addCase(fetchPackageDetail.fulfilled, (state, action) => {
        state.detailsBySlug[action.payload.slug] = action.payload;
        state.detailStatusBySlug[action.payload.slug] = "succeeded";
      })
      .addCase(fetchPackageDetail.rejected, (state, action) => {
        state.detailStatusBySlug[action.meta.arg] = "failed";
      });
  },
});

function toListItem(pack: PackSummary): PackageListItem {
  return {
    id: pack.id,
    slug: pack.slug,
    name: pack.title,
    title: pack.title,
    subtitle: pack.subtitle ?? null,
    category: pack.category,
    provider: null,
    location: null,
    description: pack.description,
    shortDescription: pack.description,
    icon: null,
    sourceType: pack.sourceType ?? "official",
    sourceName: pack.sourceName ?? null,
    sourceTitle: pack.sourceTitle ?? null,
    sourceUrl: pack.sourceUrl ?? null,
    lastCheckedAt: pack.lastCheckedAt ?? null,
    verificationSources: pack.verificationSources ?? [],
    lastVerifiedAt: pack.lastVerifiedAt ?? null,
    verificationStatus: pack.verificationStatus ?? "verified",
    createdAt: pack.createdAt ?? new Date().toISOString(),
    requiredDocumentCount: pack.requirements.filter((requirement) => requirement.required).length,
    readyDocumentCount: 0,
    source: pack.sourceType ?? "official",
    generationSource: "ai",
    version: pack.version,
  };
}

export const { setActivePackageQuery, setPackageGenerationStatus, upsertPackage } = packagesSlice.actions;
export default packagesSlice.reducer;
