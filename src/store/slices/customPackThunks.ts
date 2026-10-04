import { createAsyncThunk } from "@reduxjs/toolkit";

import { api, type CustomPackPayload } from "@/lib/api";
import { clearPackageCatalogueCache } from "@/packages/packageCatalogueCache";

export const createCustomPack = createAsyncThunk(
  "packages/createCustomPack",
  async (payload: CustomPackPayload) => {
    const response = await api.packages.createCustom(payload);
    await clearPackageCatalogueCache();
    return response.package;
  },
);

export const updateCustomPack = createAsyncThunk(
  "packages/updateCustomPack",
  async (input: { payload: CustomPackPayload; slug: string }) => {
    const response = await api.packages.updateCustom(input.slug, input.payload);
    await clearPackageCatalogueCache();
    return response.package;
  },
);

export const deleteCustomPack = createAsyncThunk(
  "packages/deleteCustomPack",
  async (slug: string) => {
    await api.packages.deleteCustom(slug);
    await clearPackageCatalogueCache();
    return slug;
  },
);
