export type SearchHistoryItem = {
  queryHash: string;
  query?: string;
  createdAt: string;
  updatedAt: string;
};

const SEARCH_HISTORY_KEY = "readiness_readiness_search_history";
const MAX_SEARCH_HISTORY = 4;
const HASH_VERSION = "sha256:v1";
const memoryHistory = new Map<string, SearchHistoryItem[]>();

function storageKey(userKey?: string | null) { return userKey ? `${SEARCH_HISTORY_KEY}:${userKey}` : SEARCH_HISTORY_KEY; }

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

function persistSearchHistory(
  userKey: string | null | undefined,
  items: SearchHistoryItem[],
) {
  memoryHistory.set(storageKey(userKey), items);
}

export async function getSearchHistory(
  userKey?: string | null,
): Promise<SearchHistoryItem[]> {
  return memoryHistory.get(storageKey(userKey)) ?? [];
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
