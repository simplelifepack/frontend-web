// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { clearInMemoryAuth, setAccessToken } from "@/lib/auth";
import { clearPackageCatalogueCache, packagePageCacheKey, writePackagePage, type CachedPackagePage } from "./packageCatalogueCache";

afterEach(() => { vi.unstubAllGlobals(); clearInMemoryAuth(); });
it("waits for an old account's clear transaction to commit before writing the new account", async () => {
  await clearPackageCatalogueCache();
  const operations: string[] = [];
  let commitClear!: () => void;
  const database = {
    close() {},
    transaction() {
      const transaction = { oncomplete: undefined as (() => void) | undefined, objectStore: () => ({
        clear() {
          operations.push("clear-start"); const request: { onsuccess?: () => void } = {};
          commitClear = () => { operations.push("clear-commit"); request.onsuccess?.(); transaction.oncomplete?.(); };
          return request;
        },
        put() {
          operations.push("write"); const request: { onsuccess?: () => void } = {};
          queueMicrotask(() => { request.onsuccess?.(); transaction.oncomplete?.(); }); return request;
        },
      }) };
      return transaction;
    },
  };
  vi.stubGlobal("indexedDB", { open(name: string) {
    const request: { result?: unknown; onsuccess?: () => void; onerror?: () => void } = {};
    queueMicrotask(() => { if (name.startsWith("lifepack")) request.onerror?.(); else { request.result = database; request.onsuccess?.(); } });
    return request;
  } });
  const clearing = clearPackageCatalogueCache();
  await vi.waitFor(() => expect(operations).toEqual(["clear-start"]));
  setAccessToken(`header.${btoa(JSON.stringify({ sub: "new-account" }))}.signature`);
  const writing = writePackagePage({ key: packagePageCacheKey() } as CachedPackagePage);
  await Promise.resolve(); expect(operations).toEqual(["clear-start"]);
  commitClear(); await clearing; await writing;
  expect(operations).toEqual(["clear-start", "clear-commit", "write"]);
});
