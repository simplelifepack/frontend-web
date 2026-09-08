import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "@/lib/api";
import type { AccountUsage } from "@/lib/api.types";
import { initializeApp } from "../bootstrap";

export const refreshUsage = createAsyncThunk("usage/refresh", () => api.usage());
const usageSlice = createSlice({
  name: "usage",
  initialState: { data: null as AccountUsage | null, error: false },
  reducers: {},
  extraReducers: builder => {
    builder.addCase(initializeApp.fulfilled, (state, { payload }) => {
      if (payload.accountTier && payload.storage && payload.aiUsage) state.data = {
        accountTier: payload.accountTier, storage: payload.storage, aiUsage: payload.aiUsage,
      };
    });
    builder.addCase(refreshUsage.fulfilled, (state, action) => { state.data = action.payload; state.error = false; });
    builder.addCase(refreshUsage.rejected, state => { state.error = true; });
  },
});
export default usageSlice.reducer;
