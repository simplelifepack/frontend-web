import { documentValidationMessages, fileTooLargeMessage } from "./documentValidationMessages";
import {
  clearInMemoryAuth,
  getAccessToken,
  setAccessToken,
} from "./auth";
import type { AuthResponse } from "./api.types";
import { dedupeRequest } from "./request-deduper";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

if (import.meta.env.PROD && new URL(API_URL, window.location.origin).protocol !== "https:") {
  throw new Error("Readiness requires an HTTPS API URL in production.");
}

type RequestOptions = {
  body?: BodyInit | unknown;
  dedupeMs?: number;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  requiresAuth?: boolean;
  retryOnUnauthorized?: boolean;
};

const DEFAULT_GET_DEDUPE_MS = 500;

let refreshInFlight: Promise<boolean> | null = null;

async function performSessionRefresh() {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  const data = (await response.json().catch(() => ({}))) as Partial<AuthResponse>;
  if (!response.ok || !data.user || !(data.accessToken || data.token)) {
    clearInMemoryAuth();
    return false;
  }
  setAccessToken(data.accessToken ?? data.token!);
  return true;
}

function refreshSession() {
  if (!getAccessToken()) return Promise.resolve(false);
  refreshInFlight ??= performSessionRefresh().finally(() => { refreshInFlight = null; });
  return refreshInFlight;
}

export const safeMessages: Record<string, string> = {
  STORAGE_LIMIT_EXCEEDED: "Cloud storage full. This upload would exceed your 50 MB allowance. Delete documents to free space or upgrade your account for unlimited cloud storage.",
  AI_MONTHLY_LIMIT_EXCEEDED: "You've used your 3 AI actions for this month. Your allowance resets next month (UTC). Paid accounts have unlimited AI actions.",
  UNSUPPORTED_FILE_TYPE: "Use a supported PDF, JPEG, PNG, or WebP document.",
  FILE_TOO_LARGE: fileTooLargeMessage(20 * 1024 * 1024),
  FILE_SIGNATURE_MISMATCH: "The file contents do not match its reported type.",
  FILE_CORRUPTED: "The document is corrupted or incomplete.",
  PASSWORD_PROTECTED_FILE: "Password-protected PDFs are not supported.",
  UNSAFE_FILE: "The document contains unsupported active or embedded content.",
  MALWARE_DETECTED: "The document did not pass security scanning.",
  ENCRYPTION_FAILED: "The document could not be encrypted securely.",
  INVALID_ENCRYPTION_ENVELOPE: "The encrypted upload could not be verified.",
  UPLOAD_FAILED: "The document could not be uploaded.",
  TEMPORARY_UPLOAD_EXPIRED: "This upload review has expired. Please select the file again.",
  TRUST_ACCESS_DENIED: "You do not have access to this Trust Center action.",
  TRUST_MEMBER_REVOKED: "This Trust Center access has been revoked.",
  PDF_PAGE_LIMIT_EXCEEDED: "This PDF has too many pages or no readable pages. Please upload a smaller PDF with at least one page.",
  IMAGE_DIMENSIONS_EXCEEDED: "This image is too large. Please resize it to a lower resolution and try again.",
  ...documentValidationMessages,
};

async function performRequest<T>(path: string, options: RequestOptions = {}) {
  const isFormData = options.body instanceof FormData;
  const body = isFormData ? options.body : options.body ? JSON.stringify(options.body) : undefined;
  const headers: HeadersInit = isFormData ? {} : { "Content-Type": "application/json" };
  if (options.requiresAuth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: body as BodyInit | undefined,
    credentials: "include",
  });
  const data = (await response.json().catch(() => ({}))) as { code?: string; message?: string };
  if (
    response.status === 401 &&
    options.requiresAuth &&
    options.retryOnUnauthorized !== false &&
    (await refreshSession())
  ) {
    return performRequest<T>(path, { ...options, retryOnUnauthorized: false });
  }
  if (!response.ok) {
    throw apiError(data);
  }
  return data as T;
}

export function request<T>(path: string, options: RequestOptions = {}) {
  const method = options.method ?? "GET";
  const dedupeMs = options.dedupeMs ?? (method === "GET" ? DEFAULT_GET_DEDUPE_MS : 0);
  if (dedupeMs <= 0) return performRequest<T>(path, options);
  const authKey = options.requiresAuth ? getAccessToken() ?? "" : "";
  return dedupeRequest(
    `${method}:${path}:${authKey}`,
    dedupeMs,
    () => performRequest<T>(path, options),
  );
}

export async function downloadBlob(
  path: string,
  options: Pick<RequestOptions, "requiresAuth" | "retryOnUnauthorized"> = {},
) {
  const headers: HeadersInit = {};
  if (options.requiresAuth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(`${API_URL}${path}`, { method: "GET", headers, credentials: "include" });
  if (
    response.status === 401 &&
    options.requiresAuth &&
    options.retryOnUnauthorized !== false &&
    (await refreshSession())
  ) {
    return downloadBlob(path, { ...options, retryOnUnauthorized: false });
  }
  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(data.message ?? "Download failed.");
  }
  const disposition = response.headers.get("Content-Disposition") ?? "";
  return {
    blob: await response.blob(),
    fileName: disposition.match(/filename="([^"]+)"/)?.[1] ?? "readiness.zip",
  };
}

export function apiError(data: { code?: string; message?: string }) {
  return Object.assign(new Error((data.code && safeMessages[data.code]) || data.message || "Something went wrong."), { code: data.code });
}

export async function streamRequest<T>(path: string, body: unknown, onDelta: (text: string) => void, signal?: AbortSignal, retry = true): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST", credentials: "include", signal,
    headers: { "Content-Type": "application/json", Accept: "text/event-stream", Authorization: `Bearer ${getAccessToken() ?? ""}` },
    body: JSON.stringify(body),
  });
  if (response.status === 401 && retry && await refreshSession()) return streamRequest(path, body, onDelta, signal, false);
  if (!response.ok) throw apiError(await response.json().catch(() => ({})));
  if (!response.headers.get("content-type")?.includes("text/event-stream")) return response.json() as Promise<T>;
  if (!response.body) throw new Error("Package response unavailable.");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let event = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      let end;
      while ((end = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, end).trimEnd();
        buffer = buffer.slice(end + 1);
        if (line.startsWith("event: ")) event = line.slice(7);
        if (!line.startsWith("data: ")) continue;
        const data = JSON.parse(line.slice(6));
        if (event === "delta" && typeof data.text === "string") onDelta(data.text);
        if (event === "result") return data as T;
        if (event === "error") throw apiError(data);
      }
      if (buffer.length > 200_000) throw new Error("Invalid package response.");
      if (done) throw new Error("Package connection ended before completion. Please retry.");
    }
  } finally { await reader.cancel().catch(() => undefined); reader.releaseLock(); }
}
