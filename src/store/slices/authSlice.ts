import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { api, type AuthUser } from "@/lib/api";
import {
  clearStoredAuth,
  getStoredRefreshToken,
  getStoredToken,
  getStoredUser,
  setStoredAuth,
  setStoredUser,
} from "@/lib/auth";
import { initializeApp } from "../bootstrap";

type AuthState = {
  token: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  initialized: boolean;
  initializationStatus: "idle" | "loading" | "succeeded" | "failed";
  initializationError: string | null;
};

const initialState: AuthState = {
  token: getStoredToken(),
  refreshToken: getStoredRefreshToken(),
  user: getStoredUser(),
  status: "idle",
  error: null,
  initialized: false,
  initializationStatus: "idle",
  initializationError: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async (payload: { email: string; password: string }) => api.auth.login(payload),
);

export const signup = createAsyncThunk(
  "auth/signup",
  async (payload: { name: string; email: string; password: string }) => api.auth.signup(payload),
);

export const googleLogin = createAsyncThunk(
  "auth/googleLogin",
  async (payload: { credential: string }) => api.auth.google(payload),
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (payload: { email: string }) => api.auth.forgotPassword(payload),
);

export const fetchMe = createAsyncThunk("auth/fetchMe", async () => {
  const response = await api.auth.me();

  return {
    ...response,
    token: getStoredToken(),
    refreshToken: getStoredRefreshToken(),
  };
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.status = "idle";
      state.error = null;
      state.initialized = false;
      state.initializationStatus = "idle";
      state.initializationError = null;
      clearStoredAuth();
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
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        setStoredAuth(state.token, action.payload.refreshToken, action.payload.user);
        state.initialized = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Unable to sign in.";
      })
      .addCase(signup.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.accessToken ?? action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        setStoredAuth(state.token, action.payload.refreshToken, action.payload.user);
        state.initialized = false;
      })
      .addCase(signup.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Unable to sign up.";
      })
      .addCase(googleLogin.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.accessToken ?? action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        setStoredAuth(state.token, action.payload.refreshToken, action.payload.user);
        state.initialized = false;
      })
      .addCase(googleLogin.rejected, (state) => {
        state.status = "failed";
        state.error = "Unable to sign in with Google.";
      })
      .addCase(fetchMe.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        setStoredUser(action.payload.user);
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.status = "failed";
        state.token = null;
        state.refreshToken = null;
        state.user = null;
        state.error = action.error.message ?? "Unable to load profile.";
        clearStoredAuth();
      })
      .addCase(initializeApp.pending, (state) => {
        state.initializationStatus = "loading";
        state.initializationError = null;
      })
      .addCase(initializeApp.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.initialized = true;
        state.initializationStatus = "succeeded";
        setStoredUser(action.payload.user);
      })
      .addCase(initializeApp.rejected, (state, action) => {
        state.initializationStatus = "failed";
        state.initializationError = action.error.message ?? "Unable to initialize LifePack.";
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
