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

it("does not restore an access token when logout races refresh", async () => {
  setAccessToken("expired-access");
  let finish!: (response: Response) => void;
  const refreshing = new Promise<Response>(resolve => {finish=resolve;});
  const fetchMock = vi.fn().mockResolvedValueOnce(new Response("{}", {status:401})).mockReturnValueOnce(refreshing);
  vi.stubGlobal("fetch", fetchMock);
  const pending=request("/private-race", {requiresAuth:true,dedupeMs:0});
  await vi.waitFor(()=>expect(fetchMock).toHaveBeenCalledTimes(2));
  clearInMemoryAuth();
  finish(new Response(JSON.stringify({accessToken:"late-token",user:{id:"old-user"}})));
  await expect(pending).rejects.toThrow();
  expect((await import("./auth")).getAccessToken()).toBeNull();
});

it("rejects a successful private response that arrives after logout", async () => {
  setAccessToken("old-access"); let finish!: (response:Response)=>void;
  vi.stubGlobal("fetch", vi.fn(()=>new Promise<Response>(resolve=>{finish=resolve;})));
  const pending=request("/private-data",{requiresAuth:true,dedupeMs:0});
  clearInMemoryAuth(); finish(new Response(JSON.stringify({private:"old-user-data"})));
  await expect(pending).rejects.toMatchObject({name:"AbortError"});
});

it("does not couple independently cancellable GET requests through deduplication", async () => {
  const fetchMock=vi.fn().mockImplementation(async()=>new Response("{}"));vi.stubGlobal("fetch",fetchMock);
  await Promise.all([request("/cancel-test",{signal:new AbortController().signal}),request("/cancel-test",{signal:new AbortController().signal})]);
  expect(fetchMock).toHaveBeenCalledTimes(2);
});
