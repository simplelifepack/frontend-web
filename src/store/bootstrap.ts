import { createAsyncThunk } from "@reduxjs/toolkit";

import { api } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import type { RootState } from "./index";
import { logout } from "./slices/authSlice";

let inFlight: Promise<unknown> | null = null;

function hasUnexpiredAccessToken() {
  const payload = getAccessToken()?.split(".")[1];
  if (!payload) return false;
  try {
    const { exp } = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof exp === "number" && exp > Date.now() / 1000;
  } catch {
    return false;
  }
}

export const initializeApp = createAsyncThunk(
  "app/initialize",
  async (_, { dispatch, getState }) => {
    const { token } = (getState() as RootState).auth;
    inFlight ??= api.bootstrap().finally(() => {
      inFlight = null;
    });
    try {
      return await (inFlight as ReturnType<typeof api.bootstrap>);
    } catch (error) {
      if (token === (getState() as RootState).auth.token &&
          ((error as { status?: number }).status === 401 || !hasUnexpiredAccessToken())) {
        dispatch(logout());
      }
      throw error;
    }
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
