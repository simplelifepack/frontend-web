// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { digilocker } from "./digilocker-api";
import { setAccessToken, clearInMemoryAuth } from "./auth";
afterEach(() => { vi.unstubAllGlobals(); clearInMemoryAuth(); });
it("uses real backend contracts and existing authentication for selection, import and cancellation", async () => {
  setAccessToken("test-access");
  const fetch = vi.fn(async () => Response.json({ id: "session-a", progress: [] }));
  vi.stubGlobal("fetch", fetch);
  await digilocker.start();
  await digilocker.documents("session/a");
  await digilocker.import("session/a", ["selected-reference"]);
  await digilocker.cancel("session/a");
  for (const [, options] of fetch.mock.calls as unknown as [string, RequestInit][]) {
    expect(options.credentials).toBe("include");
    expect(options.headers).toMatchObject({ Authorization: "Bearer test-access" });
  }
  const calls = fetch.mock.calls as unknown as [string, RequestInit][];
  expect(calls[0][0]).toMatch(/\/api\/integrations\/digilocker\/sessions$/);
  expect(JSON.parse(calls[0][1].body as string)).toEqual({});
  expect(calls[1][0]).toMatch(/sessions\/session%2Fa\/documents$/);
  expect(calls[2][0]).toMatch(/sessions\/session%2Fa\/import$/);
  expect(JSON.parse(calls[2][1].body as string)).toEqual({ references: ["selected-reference"], consent: true, consentVersion: "digilocker-copy-v1" });
  expect(calls[3][0]).toMatch(/sessions\/session%2Fa\/cancel$/);
});
it("refreshes expired authentication before retrying the import without changing its consent or selection", async () => {
  setAccessToken("expired-access");
  const fetch = vi.fn(async (url: string, options: RequestInit) => {
    if (url.endsWith("/auth/refresh")) return Response.json({ user: { id: "owner" }, accessToken: "new-access" });
    return (options.headers as Record<string, string>).Authorization === "Bearer new-access"
      ? Response.json({ id: "session-a", status: "AUTHENTICATED", progress: [] })
      : Response.json({ message: "Expired" }, { status: 401 });
  });
  vi.stubGlobal("fetch", fetch);
  await digilocker.import("session-a", ["selected-reference"]);
  expect(fetch).toHaveBeenCalledTimes(3);
  expect(fetch.mock.calls[0][1].body).toBe(fetch.mock.calls[2][1].body);
  expect(fetch.mock.calls[2][1].headers).toMatchObject({ Authorization: "Bearer new-access" });
});
