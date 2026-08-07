import { buildEncryptedDocumentFormData } from "./document-upload-api";
import { API_URL, downloadBlob, request } from "./http-client";
import type {
  AnalyzeDocumentResponse,
  AuthResponse,
  AuthUser,
  BootstrapResponse,
  DocumentRecord,
  DriveScanResult,
  DriveStatus,
  ForgotPasswordResponse,
  GmailCandidate,
  GmailImportResult,
  GmailStatus,
  PackSummary,
  PackageListQuery,
  PackageListResponse,
  PackageLookup,
  PackageSearchOrGenerateResponse,
  ReadinessResult,
  ResetPasswordResponse,
  SaveDocumentPayload,
  UploadDocumentResponse,
} from "./api.types";

export type * from "./api.types";
export { API_URL };

function toQueryString(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  return query.toString();
}

export const api = {
  ai: {
    analyzeIntent: (query: string) =>
      request<ReadinessResult>("/api/ai/analyzeIntent", {
        method: "POST",
        body: { query },
        requiresAuth: true,
      }),
  },
  auth: {
    signup: (payload: { name: string; email: string; password: string }) =>
      request<AuthResponse>("/auth/signup", { method: "POST", body: payload }),
    login: (payload: { email: string; password: string }) =>
      request<AuthResponse>("/auth/login", { method: "POST", body: payload }),
    google: (payload: { credential: string }) =>
      request<AuthResponse>("/auth/google", { method: "POST", body: payload }),
    refresh: (payload: { refreshToken: string }) =>
      request<AuthResponse>("/auth/refresh", { method: "POST", body: payload }),
    logout: (payload: { refreshToken: string }) =>
      request<ForgotPasswordResponse>("/auth/logout", { method: "POST", body: payload }),
    forgotPassword: (payload: { email: string }) =>
      request<ForgotPasswordResponse>("/auth/forgot-password", { method: "POST", body: payload }),
    resetPassword: (payload: { token: string; password: string }) =>
      request<ResetPasswordResponse>("/auth/reset-password", { method: "POST", body: payload }),
    me: () => request<{ user: AuthUser }>("/auth/me", { requiresAuth: true }),
  },
  gmail: {
    status: (force = false) =>
      request<GmailStatus>("/api/integrations/gmail/status", {
        dedupeMs: force ? 0 : 2_000,
        requiresAuth: true,
      }),
    authorize: () => request<{ authorizationUrl: string }>("/api/integrations/gmail/authorize", { method: "POST", requiresAuth: true }),
    scan: (full = false) => request<{ discovered: number; relevant: number; needsReview: number; ignored: number; lastScannedAt: string }>("/api/integrations/gmail/scan", { method: "POST", body: { full }, requiresAuth: true }),
    candidates: () => request<{ candidates: GmailCandidate[] }>("/api/integrations/gmail/candidates", { requiresAuth: true }),
    dismiss: (id: string) => request<void>(`/api/integrations/gmail/candidates/${encodeURIComponent(id)}/dismiss`, { method: "POST", requiresAuth: true }),
    import: (candidateIds: string[]) => request<{ results: GmailImportResult[] }>("/api/integrations/gmail/import", { method: "POST", body: { candidateIds }, requiresAuth: true }),
    disconnect: () => request<void>("/api/integrations/gmail", { method: "DELETE", requiresAuth: true }),
  },
  drive: {
    status: () => request<DriveStatus>("/api/integrations/drive/status", { requiresAuth: true }),
    authorize: () => request<{ authorizationUrl: string }>("/api/integrations/drive/authorize", { method: "POST", requiresAuth: true }),
    scan: (full = false, duplicateAction: "replace" | "keep_both" | "ignore" = "ignore") =>
      request<DriveScanResult>("/api/integrations/drive/scan", { method: "POST", body: { full, duplicateAction }, requiresAuth: true }),
    disconnect: () => request<void>("/api/integrations/drive", { method: "DELETE", requiresAuth: true }),
  },
  documents: {
    list: () => request<DocumentRecord[]>("/documents", { requiresAuth: true }),
    getById: (id: string) => request<DocumentRecord>(`/documents/${id}`, { requiresAuth: true }),
    preview: (id: string) =>
      downloadBlob(`/documents/${encodeURIComponent(id)}/preview`, { requiresAuth: true }),
    download: (id: string) =>
      downloadBlob(`/documents/${encodeURIComponent(id)}/download`, { requiresAuth: true }),
    analyze: async (file: File, aiAnalysisConsent = false) => {
      const formData = await buildEncryptedDocumentFormData(file, aiAnalysisConsent, request);
      return request<AnalyzeDocumentResponse>("/documents/analyze", {
        method: "POST",
        body: formData,
        requiresAuth: true,
      });
    },
    save: (payload: SaveDocumentPayload) =>
      request<{ document: DocumentRecord }>("/documents", {
        method: "POST",
        body: payload,
        requiresAuth: true,
      }),
    upload: async (file: File, aiAnalysisConsent = false) => {
      const formData = await buildEncryptedDocumentFormData(file, aiAnalysisConsent, request);
      return request<UploadDocumentResponse>("/documents/upload", {
        method: "POST",
        body: formData,
        requiresAuth: true,
      });
    },
    delete: (id: string) =>
      request<void>(`/documents/${encodeURIComponent(id)}`, {
        method: "DELETE",
        requiresAuth: true,
      }),
  },
  bootstrap: () => request<BootstrapResponse>("/api/bootstrap", { requiresAuth: true }),
  packages: {
    list: (query: PackageListQuery = {}) =>
      request<PackageListResponse>(`/api/packages?${toQueryString({
        category: query.category,
        limit: query.limit ?? 20,
        location: query.location,
        page: query.page ?? 1,
        provider: query.provider,
        search: query.search,
        sort: query.sort,
      })}`, { requiresAuth: true, dedupeMs: 5_000 }),
    get: (slug: string) =>
      request<PackSummary>(`/api/packages/${encodeURIComponent(slug)}`, { requiresAuth: true, dedupeMs: 5_000 }),
    search: (query: string) =>
      request<ReadinessResult>(`/packages/search?q=${encodeURIComponent(query)}`, { requiresAuth: true }),
    searchOrGenerate: (query: string) =>
      request<PackageSearchOrGenerateResponse>("/api/packages/search-or-generate", {
        method: "POST",
        body: { query },
        requiresAuth: true,
      }),
    getByIds: (ids: string[]) =>
      request<PackageLookup[]>(`/packages?ids=${encodeURIComponent(ids.join(","))}`, { requiresAuth: true }),
    download: (slug: string) => downloadBlob(`/packs/${encodeURIComponent(slug)}/download`, { requiresAuth: true }),
  },
  readiness: {
    search: (query: string) =>
      request<ReadinessResult["suggestions"]>(`/readiness/search?q=${encodeURIComponent(query)}`, {
        requiresAuth: true,
      }),
    check: (query: string) =>
      request<ReadinessResult>(`/readiness/check?q=${encodeURIComponent(query)}`, {
        requiresAuth: true,
      }),
    getBySlug: (slug: string) =>
      request<ReadinessResult>(`/readiness/${encodeURIComponent(slug)}`, {
        requiresAuth: true,
      }),
  },
};
