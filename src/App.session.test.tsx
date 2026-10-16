import { StrictMode } from "react";
import { configureStore } from "@reduxjs/toolkit";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Outlet, useLocation, useNavigate } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App";
import authReducer, { login } from "./store/slices/authSlice";
import { clearInMemoryAuth, getAccessToken } from "./lib/auth";
import { request } from "./lib/http-client";

vi.mock("@/pages/settings", () => ({ default: () => null }));
vi.mock("@/pages/landing", () => ({ default: () => <div>Public landing</div> }));
vi.mock("@/pages/home", () => ({ default: () => <div>Signed in home</div> }));
vi.mock("@/components/AppShell", () => ({ default: () => <Outlet /> }));
vi.mock("@/components/BootstrapSkeleton", () => ({ default: () => <div>Initializing session</div> }));
vi.mock("@/components/PinSetupGate", () => ({ default: () => <div>Set up PIN</div> }));
vi.mock("@/lib/preferences-api", () => ({ preferencesApi: { get: vi.fn().mockResolvedValue({}) } }));
vi.mock("@/store/slices/packagesSlice", () => ({ fetchPackages: () => ({ type: "test/packages" }) }));
vi.mock("@/store/slices/documentsSlice", () => ({ fetchDocuments: () => ({ type: "test/documents" }) }));

const user = { id: "u", name: "Member", email: "u@example.com", pinConfigured: true };
const authResult = { token: "fresh-access", accessToken: "fresh-access", user };
let validRefreshSession: boolean;
let refreshResponse: () => Promise<Response>;
let fetchMock: ReturnType<typeof vi.fn>;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

function LocationProbe() {
  const location = useLocation();
  const navigate = useNavigate();
  return <><div data-testid="path">{location.pathname}</div><button onClick={() => navigate("/")}>Open root</button></>;
}

function openPage(path: string) {
  const store = configureStore({ reducer: {
    auth: authReducer,
    documents: () => ({ status: "succeeded" }),
  } });
  render(<StrictMode><Provider store={store}><MemoryRouter initialEntries={[path]}><LocationProbe /><App /></MemoryRouter></Provider></StrictMode>);
  return store;
}

beforeEach(() => {
  clearInMemoryAuth();
  localStorage.clear();
  sessionStorage.clear();
  validRefreshSession = true;
  refreshResponse = async () => validRefreshSession
    ? json(authResult)
    : json({ message: "Session expired." }, 401);
  fetchMock = vi.fn(async (url, options) => {
    if (String(url).endsWith("/auth/refresh")) {
      expect(options.credentials).toBe("include");
      expect(options.headers.Authorization).toBeUndefined();
      return refreshResponse();
    }
    if (String(url).endsWith("/auth/login")) {
      validRefreshSession = true;
      return json(authResult);
    }
    if (String(url).endsWith("/bootstrap")) return json({ user, documentCount: 0, version: "test" });
    if (String(url).endsWith("/private")) {
      return options.headers.Authorization === "Bearer fresh-access"
        ? json({ ok: true }) : json({ message: "Access token expired." }, 401);
    }
    throw new Error(`Unexpected request: ${url}`);
  });
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => { cleanup(); vi.unstubAllGlobals(); clearInMemoryAuth(); });

describe("session restoration and entry routing", () => {
  it("login → home → root returns to /home, including a fresh navigation to root", async () => {
    validRefreshSession = false;
    const store = openPage("/");
    await screen.findByText("Public landing");
    await act(async () => { await store.dispatch(login({ email: user.email, password: "password" })); });
    await screen.findByText("Signed in home");
    expect(screen.getByTestId("path").textContent).toBe("/home");
    fireEvent.click(screen.getByText("Open root"));
    await screen.findByText("Signed in home");
    expect(screen.getByTestId("path").textContent).toBe("/home");
    cleanup();
    clearInMemoryAuth();
    openPage("/");
    await screen.findByText("Signed in home");
    expect(screen.getByTestId("path").textContent).toBe("/home");
  });

  it.each(["/", "/home"])("restores %s on reload and in a new tab with fresh auth memory", async (path) => {
    for (let tab = 0; tab < 2; tab += 1) {
      clearInMemoryAuth();
      openPage(path);
      await screen.findByText("Signed in home");
      expect(screen.getByTestId("path").textContent).toBe("/home");
      expect(getAccessToken()).toBe("fresh-access");
      for (const storage of [localStorage, sessionStorage]) {
        expect(storage.getItem("lifepack_token")).toBeNull();
        expect(storage.getItem("lifepack_refresh_token")).toBeNull();
        expect(storage.getItem("lifepack_auth_user")).toBeNull();
        expect(Object.values(storage)).not.toContain("fresh-access");
      }
      cleanup();
    }
    expect(fetchMock.mock.calls.filter(([url]) => String(url).endsWith("/auth/refresh"))).toHaveLength(2);
  });

  it.each(["/", "/home", "/login"])("waits for refresh before showing login or redirecting %s", async (path) => {
    let resolveRefresh!: (response: Response) => void;
    refreshResponse = () => new Promise((resolve) => { resolveRefresh = resolve; });
    openPage(path);
    expect(screen.getByText("Initializing session")).toBeTruthy();
    expect(screen.queryByText("Public landing")).toBeNull();
    await act(async () => { resolveRefresh(json(authResult)); });
    await screen.findByText("Signed in home");
    expect(screen.getByTestId("path").textContent).toBe("/home");
  });

  it("refreshes an expired access token and retries the authenticated request", async () => {
    openPage("/home");
    await screen.findByText("Signed in home");
    // The in-memory access token can expire while the shared refresh cookie stays valid.
    const { setAccessToken } = await import("./lib/auth");
    setAccessToken("expired-access");
    await expect(request("/private", { requiresAuth: true, dedupeMs: 0 })).resolves.toEqual({ ok: true });
    expect(getAccessToken()).toBe("fresh-access");
    expect(screen.queryByText("Public landing")).toBeNull();
  });

  it.each(["/", "/home"])("shows the landing page when %s has no valid refresh session", async (path) => {
    validRefreshSession = false;
    openPage(path);
    await screen.findByText("Public landing");
    expect(screen.getByTestId("path").textContent).toBe("/");
    expect(screen.queryByText("Signed in home")).toBeNull();
  });

  it.each([0, 429, 503])("offers retry for a temporary refresh failure (%s) without asking for login", async (status) => {
    refreshResponse = async () => {
      if (status === 0) throw new TypeError("Failed to fetch");
      return json({ message: "Service unavailable." }, status);
    };
    openPage("/");
    await screen.findByRole("alert");
    expect(screen.queryByText("Public landing")).toBeNull();
    refreshResponse = async () => json(authResult);
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await screen.findByText("Signed in home");
  });
});
