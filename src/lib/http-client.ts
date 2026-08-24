import {
  clearStoredAuth,
  getStoredRefreshToken,
  getStoredToken,
  setStoredAuth,
} from "./auth";
import type { AuthResponse } from "./api.types";
import { dedupeRequest } from "./request-deduper";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

type RequestOptions = {
  body?: BodyInit | unknown;
  dedupeMs?: number;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  requiresAuth?: boolean;
  retryOnUnauthorized?: boolean;
};

const DEFAULT_GET_DEDUPE_MS = 500;

async function refreshStoredAuth() {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    clearStoredAuth();
    return false;
  }
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  const data = (await response.json().catch(() => ({}))) as Partial<AuthResponse>;
  if (!response.ok || !data.refreshToken || !data.user || !(data.accessToken || data.token)) {
    clearStoredAuth();
    return false;
  }
  setStoredAuth(data.accessToken ?? data.token!, data.refreshToken, data.user);
  return true;
}

const safeMessages: Record<string, string> = {
  UNSUPPORTED_FILE_TYPE: "Use a supported PDF, JPEG, PNG, or WebP document.",
  FILE_TOO_LARGE: "The document exceeds the Readiness 20 MB limit.",
  FILE_SIGNATURE_MISMATCH: "The file contents do not match its reported type.",
  FILE_CORRUPTED: "The document is corrupted or incomplete.",
  PASSWORD_PROTECTED_FILE: "Password-protected PDFs are not supported.",
  UNSAFE_FILE: "The document contains unsupported active or embedded content.",
  MALWARE_DETECTED: "The document did not pass security scanning.",
  ENCRYPTION_FAILED: "The document could not be encrypted securely.",
  INVALID_ENCRYPTION_ENVELOPE: "The encrypted upload could not be verified.",
  UPLOAD_FAILED: "The document could not be uploaded.",
  TEMPORARY_UPLOAD_EXPIRED: "This upload review has expired. Please select the file again.",
  PLAN_FEATURE_NOT_AVAILABLE: "Your current plan does not include this feature.",
  PLAN_MEMBER_LIMIT_REACHED: "Your member limit has been reached.",
  PLAN_STORAGE_LIMIT_REACHED: "Your storage limit has been reached.",
  PLAN_AI_SEARCH_LIMIT_REACHED: "Your monthly AI package search limit has been reached.",
  TRUST_ACCESS_DENIED: "You do not have access to this Trust Center action.",
  TRUST_MEMBER_REVOKED: "This Trust Center access has been revoked.",
};

async function performRequest<T>(path: string, options: RequestOptions = {}) {
  const isFormData = options.body instanceof FormData;
  const body = isFormData ? options.body : options.body ? JSON.stringify(options.body) : undefined;
  const headers: HeadersInit = isFormData ? {} : { "Content-Type": "application/json" };
  if (options.requiresAuth) {
    const token = getStoredToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: body as BodyInit | undefined,
  });
  const data = (await response.json().catch(() => ({}))) as { code?: string; message?: string };
  if (
    response.status === 401 &&
    options.requiresAuth &&
    options.retryOnUnauthorized !== false &&
    (await refreshStoredAuth())
  ) {
    return performRequest<T>(path, { ...options, retryOnUnauthorized: false });
  }
  if (!response.ok) {
    throw new Error((data.code && safeMessages[data.code]) || data.message || "Something went wrong.");
  }
  return data as T;
}

export function request<T>(path: string, options: RequestOptions = {}) {
  const method = options.method ?? "GET";
  const dedupeMs = options.dedupeMs ?? (method === "GET" ? DEFAULT_GET_DEDUPE_MS : 0);
  if (dedupeMs <= 0) return performRequest<T>(path, options);
  const authKey = options.requiresAuth ? getStoredToken() ?? "" : "";
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
    const token = getStoredToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(`${API_URL}${path}`, { method: "GET", headers });
  if (
    response.status === 401 &&
    options.requiresAuth &&
    options.retryOnUnauthorized !== false &&
    (await refreshStoredAuth())
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
