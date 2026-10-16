export type ThemePreference = "dark" | "light";

export const themeStorageKey = "readiness-theme";
export const defaultTheme: ThemePreference = "dark";

export function getStoredTheme(): ThemePreference {
  if (typeof window === "undefined") return defaultTheme;
  const theme = window.localStorage.getItem(themeStorageKey);
  return theme === "light" || theme === "dark" ? theme : defaultTheme;
}

export function applyTheme(theme: ThemePreference) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
  window.dispatchEvent(new Event("readiness:appearance"));
}

export function persistTheme(theme: ThemePreference) {
  applyTheme(theme);
  window.localStorage.setItem(themeStorageKey, theme);
}

export function subscribeAppearance(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === themeStorageKey || event.key === null)
      applyTheme(getStoredTheme());
  };
  window.addEventListener("readiness:appearance", onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener("readiness:appearance", onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function getAppliedAppearance(): ThemePreference {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}
