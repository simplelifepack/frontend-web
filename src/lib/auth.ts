const LEGACY_AUTH_KEYS = ["lifepack_token", "lifepack_refresh_token", "lifepack_auth_user"];
const LEGACY_SEARCH_PREFIX = "lifepack_readiness_search_history";
let accessToken: string | null = null;

export function clearLegacyBrowserAuth() {
  if (typeof window === "undefined") return;
  for (const storage of [window.localStorage, window.sessionStorage]) {
    try {
      LEGACY_AUTH_KEYS.forEach((key) => storage.removeItem(key));
      for (let index = storage.length - 1; index >= 0; index -= 1) {
        const key = storage.key(index);
        if (key?.startsWith(LEGACY_SEARCH_PREFIX)) storage.removeItem(key);
      }
    } catch { /* unavailable storage must not block session startup */ }
  }
}

export function getAccessToken() { return accessToken; }
export function setAccessToken(token: string | null) { accessToken = token; }
export function clearInMemoryAuth() { accessToken = null; clearLegacyBrowserAuth(); }

clearLegacyBrowserAuth();
