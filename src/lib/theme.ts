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
}

export function persistTheme(theme: ThemePreference) {
  applyTheme(theme);
  window.localStorage.setItem(themeStorageKey, theme);
}
