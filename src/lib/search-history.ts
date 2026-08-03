export type SearchHistoryItem = {
  queryHash: string;
  query?: string;
  createdAt: string;
  updatedAt: string;
};

const SEARCH_HISTORY_KEY = "lifepack_readiness_search_history";
const MAX_SEARCH_HISTORY = 4;
const HASH_VERSION = "sha256:v1";

function storageKey(userKey?: string | null) {
  return userKey ? `${SEARCH_HISTORY_KEY}:${userKey}` : SEARCH_HISTORY_KEY;
}

function normalizeQuery(query: string) {
  return query.trim().replace(/\s+/g, " ");
}

function hashFallback(input: string) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `${HASH_VERSION}:fallback:${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

async function hashQuery(query: string) {
  const normalized = normalizeQuery(query).toLowerCase();
  if (!normalized) return "";

  if (globalThis.crypto?.subtle) {
    const digest = await globalThis.crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(normalized),
    );
    const hash = [...new Uint8Array(digest)]
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
    return `${HASH_VERSION}:${hash}`;
  }

  return hashFallback(normalized);
}

function isStoredSearchHistoryItem(
  value: unknown,
): value is SearchHistoryItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.queryHash === "string" &&
    (item.query === undefined || typeof item.query === "string") &&
    typeof item.createdAt === "string" &&
    typeof item.updatedAt === "string"
  );
}

function isLegacySearchHistoryItem(
  value: unknown,
): value is { query: string; createdAt: string; updatedAt: string } {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.query === "string" &&
    typeof item.createdAt === "string" &&
    typeof item.updatedAt === "string"
  );
}

function persistSearchHistory(
  userKey: string | null | undefined,
  items: SearchHistoryItem[],
) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey(userKey), JSON.stringify(items));
}

export async function getSearchHistory(
  userKey?: string | null,
): Promise<SearchHistoryItem[]> {
  if (typeof window === "undefined") return [];

  const raw = window.localStorage.getItem(storageKey(userKey));
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const storedItems = parsed.filter(isStoredSearchHistoryItem).filter((item) => item.query);
    if (storedItems.length) return storedItems.slice(0, MAX_SEARCH_HISTORY);

    const legacyItems = parsed.filter(isLegacySearchHistoryItem);
    if (!legacyItems.length) return [];

    const migrated = await Promise.all(
      legacyItems.slice(0, MAX_SEARCH_HISTORY).map(async (item) => ({
        queryHash: await hashQuery(item.query),
        query: normalizeQuery(item.query),
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
    );
    persistSearchHistory(userKey, migrated);
    return migrated;
  } catch {
    return [];
  }
}

export async function recordSearch(
  query: string,
  userKey?: string | null,
): Promise<SearchHistoryItem[]> {
  if (typeof window === "undefined") return [];

  const cleaned = normalizeQuery(query);
  if (!cleaned) return getSearchHistory(userKey);

  const queryHash = await hashQuery(cleaned);
  const now = new Date().toISOString();
  const existing = await getSearchHistory(userKey);
  const match = existing.find((item) => item.queryHash === queryHash);
  const nextItem: SearchHistoryItem = {
    queryHash,
    query: cleaned,
    createdAt: match?.createdAt ?? now,
    updatedAt: now,
  };
  const next = [
    nextItem,
    ...existing.filter((item) => item.queryHash !== queryHash),
  ].slice(0, MAX_SEARCH_HISTORY);

  persistSearchHistory(userKey, next);
  return next;
}
