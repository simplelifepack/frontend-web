import { getAccessToken, getAuthGeneration } from "@/lib/auth";
import type { PackageListQuery, PackageListResponse } from "@/lib/api";

const DB_NAME = "readiness-package-catalogue";
// Compatibility: migrate the existing public package cache before deleting its old database.
const LEGACY_DB_NAME = "lifepack-package-catalogue";
const DB_VERSION = 3;
const CACHE_KEY_VERSION = "v7";
const STORE_NAME = "pages";

export type CachedPackagePage = {
  key: string;
  query: Required<Pick<PackageListQuery, "limit" | "page" | "sort">> & Omit<PackageListQuery, "limit" | "page" | "sort">;
  response: PackageListResponse;
};

function accountScope() {
  try {
    const payload = getAccessToken()?.split(".")[1];
    if (!payload) return "anonymous";
    const claims = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof claims.sub === "string" ? encodeURIComponent(claims.sub) : "anonymous";
  } catch { return "anonymous"; }
}

export function packagePageCacheKey(query: PackageListQuery = {}) {
  const params = new URLSearchParams({
    category: query.category ?? "",
    limit: String(query.limit ?? 20),
    location: query.location ?? "",
    page: String(query.page ?? 1),
    provider: query.provider ?? "",
    search: query.search ?? "",
    sort: query.sort ?? "category",
    version: CACHE_KEY_VERSION,
  });
  return `packages:account=${accountScope()}:${params.toString()}`;
}

function openDatabase(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const database = request.result;
        // Older pages mix shared catalogue data with private packages/assignments.
        if (database.objectStoreNames.contains(STORE_NAME)) database.deleteObjectStore(STORE_NAME);
        if (!database.objectStoreNames.contains(STORE_NAME)) database.createObjectStore(STORE_NAME, { keyPath: "key" });
      };
      request.onsuccess = () => {
        const database = request.result;
        void migrateLegacyCache(database).finally(() => resolve(database));
      };
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    } catch { resolve(null); }
  });
}

async function migrateLegacyCache(destination: IDBDatabase) {
  let source: IDBDatabase | null = null;
  try {
    source = await new Promise<IDBDatabase | null>((resolve) => {
      const request = indexedDB.open(LEGACY_DB_NAME);
      request.onupgradeneeded = () => request.transaction?.abort(); // Never create an empty legacy database.
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
      request.onsuccess = () => resolve(request.result);
    });
    if (!source) return;
    if (!source.objectStoreNames.contains(STORE_NAME)) return;
    const pages = await new Promise<CachedPackagePage[]>((resolve, reject) => {
      const request = source!.transaction(STORE_NAME).objectStore(STORE_NAME).getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const copied: CachedPackagePage[] = [];
    await new Promise<void>((resolve, reject) => {
      const transaction = destination.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      transaction.oncomplete = () => resolve();
      transaction.onabort = () => reject(transaction.error);
      transaction.onerror = () => reject(transaction.error);
      for (const page of pages) {
        const request = store.get(page.key);
        request.onsuccess = () => {
          if (!request.result && page.key.startsWith(`packages:account=${accountScope()}:`)) { store.put(page); copied.push(page); }
        };
      }
    });
    const verified = await new Promise<boolean>((resolve, reject) => {
      const transaction = destination.transaction(STORE_NAME);
      let matches = true;
      for (const page of copied) {
        const request = transaction.objectStore(STORE_NAME).get(page.key);
        request.onsuccess = () => { matches &&= JSON.stringify(request.result) === JSON.stringify(page); };
      }
      transaction.oncomplete = () => resolve(matches);
      transaction.onabort = () => reject(transaction.error);
    });
    if (verified) {
      source.close();
      source = null;
      // A legacy tab may block deletion; its database remains available until it closes.
      indexedDB.deleteDatabase(LEGACY_DB_NAME);
    }
  } catch { /* Keep the legacy cache intact and retry on the next open. */ }
  finally { source?.close(); }
}

async function performTransaction<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore, resolve: (value: T) => void) => void, fallback: T) {
  const database = await openDatabase();
  if (!database) return fallback;
  return new Promise<T>((resolve) => {
    try {
      const transaction = database.transaction(STORE_NAME, mode);
      let value = fallback;
      transaction.oncomplete = () => resolve(value);
      transaction.onabort = () => resolve(fallback);
      transaction.onerror = () => resolve(fallback);
      run(transaction.objectStore(STORE_NAME), result => { value = result; });
    } catch { resolve(fallback); }
  }).finally(() => database.close());
}

// Reserve ordering before opening IndexedDB: account-switch clears must finish
// before a new account can write. Resolve writes only after transaction commit.
let transactionTail: Promise<unknown> = Promise.resolve();
function transact<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore, resolve: (value: T) => void) => void, fallback: T): Promise<T> {
  const result = transactionTail.then(() => performTransaction(mode, run, fallback));
  transactionTail = result.catch(() => undefined);
  return result;
}

export function readPackagePage(key: string) {
  return transact<CachedPackagePage | null>("readonly", (store, resolve) => {
    const request = store.get(key);
    request.onsuccess = () => resolve((key.startsWith(`packages:account=${accountScope()}:`) ? request.result as CachedPackagePage | undefined : null) ?? null);
    request.onerror = () => resolve(null);
  }, null);
}

export function readAllPackagePages() {
  return transact<CachedPackagePage[]>("readonly", (store, resolve) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(Array.isArray(request.result) ? (request.result as CachedPackagePage[]).filter(page => page.key.startsWith(`packages:account=${accountScope()}:`)) : []);
    request.onerror = () => resolve([]);
  }, []);
}

export async function writePackagePage(page: CachedPackagePage) {
  const generation = getAuthGeneration();
  await transact<void>("readwrite", (store, resolve) => {
    if (generation !== getAuthGeneration() || !page.key.startsWith(`packages:account=${accountScope()}:`)) { resolve(); return; }
    const request = store.put(page);
    request.onsuccess = () => resolve();
    request.onerror = () => resolve();
  }, undefined);
}

export async function clearPackageCatalogueCache() {
  await transact<void>("readwrite", (store, resolve) => {
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => resolve();
  }, undefined);
}
