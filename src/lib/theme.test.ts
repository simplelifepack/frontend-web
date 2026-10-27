import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { getAppliedAppearance, getStoredTheme, persistTheme, subscribeAppearance } from "./theme";
let dark = false;
const listeners = new Set<() => void>();
let unsubscribe: (() => void) | undefined;
beforeEach(() => {
  dark = false;
  listeners.clear();
  localStorage.clear();
  vi.stubGlobal("matchMedia", () => ({ get matches() { return dark; }, addEventListener: (_event: string, listener: () => void) => listeners.add(listener), removeEventListener: (_event: string, listener: () => void) => listeners.delete(listener) }));
});
afterEach(() => { unsubscribe?.(); unsubscribe = undefined; vi.unstubAllGlobals(); localStorage.clear(); });
it("keeps the System preference while reacting to OS changes in both directions", () => {
  const changed = vi.fn();
  unsubscribe = subscribeAppearance(changed);
  persistTheme("system");
  expect(getStoredTheme()).toBe("system");
  expect(getAppliedAppearance()).toBe("light");
  dark = true; listeners.forEach(listener => listener());
  expect(getAppliedAppearance()).toBe("dark");
  expect(document.documentElement.style.colorScheme).toBe("dark");
  expect(getStoredTheme()).toBe("system");
  dark = false; listeners.forEach(listener => listener());
  expect(getAppliedAppearance()).toBe("light");
  expect(changed).toHaveBeenCalledTimes(3);
});
it("keeps explicit overrides and detaches the OS listener", () => {
  unsubscribe = subscribeAppearance(vi.fn());
  persistTheme("light"); dark = true; listeners.forEach(listener => listener());
  expect(getAppliedAppearance()).toBe("light");
  persistTheme("dark"); dark = false; listeners.forEach(listener => listener());
  expect(getAppliedAppearance()).toBe("dark");
  unsubscribe(); unsubscribe = undefined;
  expect(listeners.size).toBe(0);
});
it("restores System from a cross-tab preference update", () => {
  unsubscribe = subscribeAppearance(vi.fn());
  persistTheme("light"); dark = true;
  localStorage.setItem("readiness-theme", "system");
  window.dispatchEvent(new StorageEvent("storage", { key: "readiness-theme" }));
  expect(getAppliedAppearance()).toBe("dark");
  expect(getStoredTheme()).toBe("system");
});
