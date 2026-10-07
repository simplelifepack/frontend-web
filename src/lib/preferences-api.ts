import { getAccessToken } from "./auth";
import { request } from "./http-client";
import { invalidateRequests } from "./request-deduper";
import type { ThemePreference } from "./theme";

export type UserPreferences = {
  country: string | null;
  passportCountry: string | null;
  homeCurrency: string | null;
  appearance: ThemePreference;
  aiProcessingEnabled: boolean;
};

let cachedPreferences: UserPreferences | null = null;
let cachedPreferencesToken: string | null = null;

function cacheKey() {
  return getAccessToken() ?? "";
}

function setCachedPreferences(preferences: UserPreferences) {
  cachedPreferences = preferences;
  cachedPreferencesToken = cacheKey();
}

export const preferencesApi = {
  get: async () => {
    const token = cacheKey();
    if (cachedPreferences && cachedPreferencesToken === token) return cachedPreferences;
    const preferences = await request<UserPreferences>("/api/preferences", { requiresAuth: true, dedupeMs: 2_000 });
    setCachedPreferences(preferences);
    return preferences;
  },
  update: async (payload: Partial<UserPreferences>) => {
    const preferences = await request<UserPreferences>("/api/preferences", {
      method: "PATCH",
      body: payload,
      requiresAuth: true,
      dedupeMs: 0,
    });
    setCachedPreferences(preferences);
    invalidateRequests("GET:/api/preferences");
    return preferences;
  },
};
