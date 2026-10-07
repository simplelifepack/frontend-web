import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "@/lib/api";
import type { AccountUsage } from "@/lib/api.types";
import { initializeApp } from "../bootstrap";
import type { RootState } from "../index";

const USAGE_FRESH_MS = 30_000;

type UsageState = {
  data: AccountUsage | null;
  error: boolean;
  lastFetchedAt: number;
  status: "idle" | "loading" | "succeeded" | "failed";
};

export const refreshUsage = createAsyncThunk(
  "usage/refresh",
  async () => api.usage(),
  {
    condition: (force: boolean | undefined, { getState }) => {
      if (force) return true;
      const usage = (getState() as RootState).usage;
      if (usage.status === "loading") return false;
      if (!usage.data || !usage.lastFetchedAt) return true;
      return Date.now() - usage.lastFetchedAt > USAGE_FRESH_MS;
    },
  },
);

const usageSlice = createSlice({
  name: "usage",
  initialState: {
    data: null,
    error: false,
    lastFetchedAt: 0,
    status: "idle",
  } as UsageState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(initializeApp.fulfilled, (state, { payload }) => {
      if (payload.accountTier && payload.storage && payload.aiUsage) {
        state.data = {
          accountTier: payload.accountTier, storage: payload.storage, aiUsage: payload.aiUsage,
        };
        state.lastFetchedAt = Date.now();
        state.status = "succeeded";
      }
    });
    builder.addCase(refreshUsage.pending, state => { state.status = "loading"; });
    builder.addCase(refreshUsage.fulfilled, (state, action) => {
      state.data = action.payload;
      state.error = false;
      state.lastFetchedAt = Date.now();
      state.status = "succeeded";
    });
    builder.addCase(refreshUsage.rejected, state => { state.error = true; state.status = "failed"; });
  },
});
export default usageSlice.reducer;
