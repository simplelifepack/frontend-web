import { webcrypto } from "node:crypto";
import { afterEach, expect, it, vi } from "vitest";
import { solveChallenge, waitlistApi } from "./waitlist-api";
afterEach(() => vi.unstubAllGlobals());
it("uses anonymous requests without cookies or authorization for challenge, registration and unsubscribe", async () => {
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ message: "OK", token: "token", difficulty: 12 }) });
  vi.stubGlobal("fetch", fetchMock);
  await waitlistApi.challenge();
  await waitlistApi.register({ email: "person@example.com", website: "", challenge: "token", solution: "1" });
  await waitlistApi.unsubscribe("opaque-token");
  for (const [, options] of fetchMock.mock.calls) {
    expect(options.credentials).toBe("omit");
    expect(options.headers?.Authorization).toBeUndefined();
  }
  expect(fetchMock.mock.calls[1][0]).toContain("/api/waitlist/register");
});
it("solves the server's twelve-bit proof of work and supports cancellation", async () => {
  vi.stubGlobal("crypto", webcrypto);
  const controller = new AbortController();
  const solution = await solveChallenge({ token: "local-challenge", difficulty: 12 }, controller.signal);
  const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`local-challenge:${solution}`)));
  expect(hash[0]).toBe(0); expect(hash[1]).toBeLessThan(16);
  controller.abort();
  await expect(solveChallenge({ token: "another", difficulty: 12 }, controller.signal)).rejects.toHaveProperty("name", "AbortError");
});
