import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api", () => ({ api: { auth: { refresh: vi.fn(), login: vi.fn(), signup: vi.fn(), google: vi.fn(), me: vi.fn(), forgotPassword: vi.fn() } } }));

describe("memory-only browser authentication", () => {
  beforeEach(() => {
    localStorage.clear(); sessionStorage.clear(); vi.resetModules();
  });

  it("deletes legacy access, refresh, and user storage", async () => {
    localStorage.setItem("lifepack_token", "access");
    localStorage.setItem("lifepack_refresh_token", "refresh");
    localStorage.setItem("lifepack_auth_user", "user");
    sessionStorage.setItem("lifepack_refresh_token", "refresh");
    await import("@/lib/auth");
    expect(localStorage.getItem("lifepack_token")).toBeNull();
    expect(localStorage.getItem("lifepack_refresh_token")).toBeNull();
    expect(localStorage.getItem("lifepack_auth_user")).toBeNull();
    expect(sessionStorage.getItem("lifepack_refresh_token")).toBeNull();
  });

  it("keeps a login access token in memory without writing browser storage", async () => {
    const { default: reducer, login } = await import("./authSlice");
    const { getAccessToken } = await import("@/lib/auth");
    const payload = { token: "access", accessToken: "access", user: { id: "u", name: "User", email: "u@example.com" } };
    const state = reducer(undefined, login.fulfilled(payload, "request", { email: "u@example.com", password: "password" }));
    expect(state.token).toBe("access"); expect(getAccessToken()).toBe("access");
    expect(localStorage.length).toBe(0); expect(sessionStorage.length).toBe(0);
  });

  it("restores and clears the in-memory session", async () => {
    const { default: reducer, logout, restoreSession } = await import("./authSlice");
    const payload = { token: "restored", accessToken: "restored", user: { id: "u", name: "User", email: "u@example.com" } };
    const restored = reducer(undefined, restoreSession.fulfilled(payload, "request"));
    expect(restored.sessionStatus).toBe("authenticated");
    const cleared = reducer(restored, logout());
    expect(cleared.token).toBeNull(); expect(cleared.user).toBeNull();
  });

  it("treats an expired or revoked refresh session as logged out", async () => {
    const { default: reducer, restoreSession } = await import("./authSlice");
    const state = reducer(undefined, restoreSession.rejected(new Error("401"), "request"));
    expect(state.sessionStatus).toBe("anonymous"); expect(state.token).toBeNull();
  });

  it("keeps recent searches only in memory", async () => {
    const { recordSearch, getSearchHistory } = await import("@/lib/search-history");
    await recordSearch("Car Loan", "u");
    expect(await getSearchHistory("u")).toHaveLength(1);
    expect([...Array(localStorage.length)].map((_, index) => localStorage.key(index))).not.toContain(expect.stringContaining("search_history"));
  });
});


it("only restores once when startup dispatches twice", async () => {
  const { configureStore } = await import("@reduxjs/toolkit");
  const { default: reducer, restoreSession } = await import("./authSlice");
  const { api } = await import("@/lib/api");
  const refresh = vi.mocked(api.auth.refresh);
  refresh.mockClear();
  refresh.mockRejectedValue(new Error("Session expired."));
  const store = configureStore({ reducer: { auth: reducer } });
  await Promise.all([store.dispatch(restoreSession()), store.dispatch(restoreSession())]);
  await store.dispatch(restoreSession());
  expect(refresh).toHaveBeenCalledTimes(1);
  expect(store.getState().auth.sessionStatus).toBe("anonymous");
});
