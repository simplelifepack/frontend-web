import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { api, type AuthUser } from "@/lib/api";
import {
  clearInMemoryAuth,
  setAccessToken,
} from "@/lib/auth";
import { initializeApp } from "../bootstrap";

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  initialized: boolean;
  initializationStatus: "idle" | "loading" | "succeeded" | "failed" | "degraded";
  sessionStatus: "idle" | "loading" | "authenticated" | "anonymous" | "failed";
};

const initialState: AuthState = {
  token: null,
  user: null,
  status: "idle",
  error: null,
  initialized: false,
  initializationStatus: "idle",
  sessionStatus: "idle",
};

export const restoreSession = createAsyncThunk(
  "auth/restoreSession",
  async (_, { rejectWithValue }) => {
    try {
      return await api.auth.refresh();
    } catch (error) {
      // Only an explicit rejection of the refresh session means login is needed.
      if ((error as { status?: number }).status === 401) return rejectWithValue("anonymous");
      throw error;
    }
  },
  {
    condition: (_, { getState }) =>
      ["idle", "failed"].includes((getState() as { auth: AuthState }).auth.sessionStatus),
  },
);

export const login = createAsyncThunk(
  "auth/login",
  async (payload: { email: string; password: string }) => api.auth.login(payload),
);

export const loginWithPin = createAsyncThunk(
  "auth/loginWithPin",
  async (payload: { email: string; pin: string }) => api.auth.loginWithPin(payload),
);

export const signup = createAsyncThunk(
  "auth/signup",
  async (payload: { name: string; email: string; password: string; otp: string }) => api.auth.signup(payload),
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (payload: { email: string }) => api.auth.forgotPassword(payload),
);

export const fetchMe = createAsyncThunk("auth/fetchMe", async () => api.auth.me());

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    acknowledgeInitializationFailure(state) {
      if (state.initializationStatus === "failed") state.initializationStatus = "degraded";
    },
    updateCurrentUser(state, action: { payload: AuthUser }) {
      state.user = action.payload;
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.status = "idle";
      state.error = null;
      state.initialized = false;
      state.initializationStatus = "idle";
      state.sessionStatus = "anonymous";
      clearInMemoryAuth();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.accessToken ?? action.payload.token;
        state.user = action.payload.user;
        setAccessToken(state.token);
        state.sessionStatus = "authenticated";
        state.initialized = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Unable to sign in.";
      })
      .addCase(loginWithPin.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginWithPin.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.accessToken ?? action.payload.token;
        state.user = action.payload.user;
        setAccessToken(state.token);
        state.sessionStatus = "authenticated";
        state.initialized = false;
      })
      .addCase(loginWithPin.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Unable to sign in with PIN.";
      })
      .addCase(signup.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.accessToken ?? action.payload.token;
        state.user = action.payload.user;
        setAccessToken(state.token);
        state.sessionStatus = "authenticated";
        state.initialized = false;
      })
      .addCase(signup.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Unable to sign up.";
      })
      .addCase(fetchMe.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.status = "failed";
        state.token = null;
        state.user = null;
        state.error = action.error.message ?? "Unable to load profile.";
        clearInMemoryAuth();
      })
      .addCase(initializeApp.pending, (state) => {
        state.initializationStatus = "loading";
      })
      .addCase(initializeApp.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload.user };
        state.initialized = true;
        state.initializationStatus = "succeeded";
      })
      .addCase(initializeApp.rejected, (state) => {
        if (state.token) state.initializationStatus = "failed";
      })
      .addCase(restoreSession.pending, (state) => {
        state.sessionStatus = "loading";
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.token = action.payload.accessToken ?? action.payload.token;
        state.user = action.payload.user;
        state.sessionStatus = "authenticated";
        state.status = "succeeded";
        setAccessToken(state.token);
      })
      .addCase(restoreSession.rejected, (state, action) => {
        state.token = null;
        state.user = null;
        state.sessionStatus = action.payload === "anonymous" ? "anonymous" : "failed";
        clearInMemoryAuth();
      });
  },
});

export const { acknowledgeInitializationFailure, logout, updateCurrentUser } = authSlice.actions;
export default authSlice.reducer;
