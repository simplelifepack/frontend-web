import { afterEach, expect, it, vi } from "vitest";
import { request, downloadBlob } from "./http-client";
import { clearInMemoryAuth, setAccessToken } from "./auth";

afterEach(() => { vi.unstubAllGlobals(); clearInMemoryAuth(); });

it("stops refreshing after a rejected refresh even when later requests fail", async () => {
  setAccessToken("expired-access");
  const fetchMock = vi.fn().mockImplementation(async () =>
    new Response(JSON.stringify({ message: "Session expired." }), { status: 401 }));
  vi.stubGlobal("fetch", fetchMock);
  await expect(request("/first", { requiresAuth: true, dedupeMs: 0 })).rejects.toThrow();
  await expect(request("/second", { requiresAuth: true, dedupeMs: 0 })).rejects.toThrow();
  await expect(downloadBlob("/download", { requiresAuth: true })).rejects.toThrow();
  expect(fetchMock.mock.calls.filter(([url]) => String(url).endsWith("/auth/refresh"))).toHaveLength(1);
});
