export const homeCurrencyStorageKey = "readiness-home-currency";
export const defaultHomeCurrency = "INR";

const supportedHomeCurrencies = new Set([
  "INR", "USD", "EUR", "GBP", "AED", "SGD", "CHF", "AUD", "CAD", "SAR", "JPY",
]);

const indicativeInrRates: Record<string, number> = {
  INR: 1,
  USD: 83,
  EUR: 90,
  GBP: 105,
  AED: 22.6,
  SGD: 62,
  CHF: 94,
  AUD: 55,
  CAD: 61,
  SAR: 22.1,
  JPY: 0.56,
};

export function getStoredHomeCurrency() {
  if (typeof window === "undefined") return defaultHomeCurrency;
  const currency = window.localStorage.getItem(homeCurrencyStorageKey)?.toUpperCase();
  return currency && supportedHomeCurrencies.has(currency) ? currency : defaultHomeCurrency;
}

export function persistHomeCurrency(currency: string | null) {
  if (typeof window === "undefined") return;
  const normalized = currency?.toUpperCase() ?? "";
  if (normalized && supportedHomeCurrencies.has(normalized)) {
    window.localStorage.setItem(homeCurrencyStorageKey, normalized);
  } else {
    window.localStorage.removeItem(homeCurrencyStorageKey);
  }
  window.dispatchEvent(new Event("readiness-preferences-changed"));
}

export function formatStoredMoney(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
  } catch {
    return `${currency} ${Math.round(value).toLocaleString("en-IN")}`;
  }
}

export function normalizeHomeCurrency(currency: unknown) {
  const normalized = typeof currency === "string" ? currency.trim().toUpperCase() : "";
  return normalized && supportedHomeCurrencies.has(normalized) ? normalized : defaultHomeCurrency;
}

export function convertStoredMoney(value: number, fromCurrency: string, toCurrency = getStoredHomeCurrency()) {
  const fromRate = indicativeInrRates[normalizeHomeCurrency(fromCurrency)];
  const toRate = indicativeInrRates[normalizeHomeCurrency(toCurrency)];
  return (value * fromRate) / toRate;
}
