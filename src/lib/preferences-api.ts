import { request } from "./http-client";
import type { ThemePreference } from "./theme";

export type UserPreferences = {
  country: string | null;
  passportCountry: string | null;
  homeCurrency: string | null;
  appearance: ThemePreference;
  aiProcessingEnabled: boolean;
};

export const preferencesApi = {
  get: () => request<UserPreferences>("/api/preferences", { requiresAuth: true, dedupeMs: 0 }),
  update: (payload: Partial<UserPreferences>) =>
    request<UserPreferences>("/api/preferences", {
      method: "PATCH",
      body: payload,
      requiresAuth: true,
      dedupeMs: 0,
    }),
};
