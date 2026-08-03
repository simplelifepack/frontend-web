import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { api, type PackSummary } from "@/lib/api";
import { initializeApp } from "../bootstrap";

type PackagesState = {
  items: PackSummary[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  loaded: boolean;
};

const initialState: PackagesState = {
  items: [],
  status: "idle",
  error: null,
  loaded: false,
};

export const fetchPackages = createAsyncThunk("packages/fetchPackages", async () => {
  return api.packages.list();
});

const packagesSlice = createSlice({
  name: "packages",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPackages.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPackages.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
        state.loaded = true;
      })
      .addCase(fetchPackages.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Unable to fetch packages.";
        state.items = [];
      })
      .addCase(initializeApp.fulfilled, (state, action) => {
        state.items = action.payload.packages;
        state.loaded = true;
        state.status = "succeeded";
      });
  },
});

export default packagesSlice.reducer;
