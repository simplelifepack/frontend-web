export type ThemePreference = "dark" | "light" | "system";
export type AppliedAppearance = "dark" | "light";

export const themeStorageKey = "readiness-theme";
export const defaultTheme: ThemePreference = "dark";

export function getStoredTheme(): ThemePreference {
  if (typeof window === "undefined") return defaultTheme;
  const theme = window.localStorage.getItem(themeStorageKey);
  return theme === "light" || theme === "dark" || theme === "system" ? theme : defaultTheme;
}

export function resolveAppearance(theme: ThemePreference): AppliedAppearance {
  if (theme !== "system") return theme;
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme: ThemePreference) {
  const appearance = resolveAppearance(theme);
  document.documentElement.classList.toggle("dark", appearance === "dark");
  document.documentElement.style.colorScheme = appearance;
  window.dispatchEvent(new Event("readiness:appearance"));
}

export function persistTheme(theme: ThemePreference) {
  window.localStorage.setItem(themeStorageKey, theme);
  applyTheme(theme);
}

export function subscribeAppearance(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === themeStorageKey || event.key === null) applyTheme(getStoredTheme());
  };
  const media = window.matchMedia?.("(prefers-color-scheme: dark)");
  const onSystemChange = () => { if (getStoredTheme() === "system") applyTheme("system"); };
  media?.addEventListener("change", onSystemChange);
  window.addEventListener("readiness:appearance", onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    media?.removeEventListener("change", onSystemChange);
    window.removeEventListener("readiness:appearance", onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function getAppliedAppearance(): AppliedAppearance {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}
