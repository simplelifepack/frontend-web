import { describe, expect, it, vi } from "vitest";

import { api } from "./api";

const status = {
  connected: false,
  account: null,
  lastScannedAt: null,
  scanning: false,
};

describe("Gmail status requests", () => {
  it("deduplicates normal reads but allows an explicit refresh", async () => {
    const fetchMock = vi.fn(async () => ({
      json: async () => status,
      ok: true,
      status: 200,
    }));
    vi.stubGlobal("fetch", fetchMock);

    const results = await Promise.all([
      api.gmail.status(),
      api.gmail.status(),
      api.gmail.status(),
      api.gmail.status(),
    ]);
    await api.gmail.status();

    expect(results).toEqual([status, status, status, status]);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await api.gmail.status(true);

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
