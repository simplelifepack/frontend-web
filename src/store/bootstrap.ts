import { createAsyncThunk } from "@reduxjs/toolkit";

import { api } from "@/lib/api";
import type { RootState } from "./index";

let inFlight: Promise<unknown> | null = null;

export const initializeApp = createAsyncThunk(
  "app/initialize",
  async () => {
    inFlight ??= api.bootstrap().finally(() => {
      inFlight = null;
    });
    return inFlight as ReturnType<typeof api.bootstrap>;
  },
  {
    condition: (_argument, { getState }) => {
      const state = getState() as RootState;
      return Boolean(state.auth.token) &&
        !state.auth.initialized &&
        state.auth.initializationStatus !== "loading";
    },
  },
);
