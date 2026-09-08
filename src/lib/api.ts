import { publicDocumentLabels } from "./public-document-labels";
import type { AccountUsage } from "./api.types";
import { streamRequest } from "./http-client";
import { buildEncryptedDocumentFormData } from "./document-upload-api";
import { API_URL, downloadBlob, request } from "./http-client";
import type {
  AnalyzeDocumentResponse,
  AuthResponse,
  AuthUser,
  BootstrapResponse,
  DocumentRecord,
  DynamicFormCategory,
  DynamicFormSchema,
  DynamicFormSubtype,
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
  ResetPasswordResponse,
  SaveDocumentPayload,
  TrustCenterResponse,
  TrustInvitation,
  TrustMember,
  TrustMemberPayload,
  UploadDocumentResponse,
  WealthHandoffSendResponse,
  WealthHandoffSummary,
  WealthRecord,
  WealthRecordPayload,
  WealthDynamicFormSubmitPayload,
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
  auth: {
    signup: (payload: { name: string; email: string; password: string }) =>
      request<AuthResponse>("/auth/signup", { method: "POST", body: payload }),
    login: (payload: { email: string; password: string }) =>
      request<AuthResponse>("/auth/login", { method: "POST", body: payload }),
    google: (payload: { credential: string }) =>
      request<AuthResponse>("/auth/google", { method: "POST", body: payload }),
    refresh: () => request<AuthResponse>("/auth/refresh", { method: "POST" }),
    logout: () => request<ForgotPasswordResponse>("/auth/logout", { method: "POST" }),
    logoutAll: () => request<ForgotPasswordResponse>("/auth/logout-all", { method: "POST", requiresAuth: true }),
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
    status: () => request<DriveStatus>("/api/integrations/drive/status", { dedupeMs: 5_000, requiresAuth: true }),
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
    analyze: async (files: File[], aiAnalysisConsent = false) => {
      const formData = await buildEncryptedDocumentFormData(files, aiAnalysisConsent, request);
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
    upload: async (files: File[], aiAnalysisConsent = false) => {
      const formData = await buildEncryptedDocumentFormData(files, aiAnalysisConsent, request);
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
  usage: () => request<AccountUsage>("/api/bootstrap/usage", { requiresAuth: true, dedupeMs: 0 }),
  bootstrap: () => request<BootstrapResponse>("/api/bootstrap", { requiresAuth: true }),
  trust: {
    get: () => request<TrustCenterResponse>("/api/trust", { requiresAuth: true, dedupeMs: 1_000 }),
    getInvitation: (token: string) => request<TrustInvitation>(`/api/trust/invitations/${encodeURIComponent(token)}`),
    acceptInvitation: (token: string, pin: string) =>
      request<{ message: string }>(`/api/trust/invitations/${encodeURIComponent(token)}/accept`, {
        method: "POST",
        body: { pin },
      }),
    rejectInvitation: (token: string) =>
      request<{ message: string }>(`/api/trust/invitations/${encodeURIComponent(token)}/reject`, { method: "POST" }),
    addMember: (payload: TrustMemberPayload) =>
      request<TrustMember>("/api/trust/members", { method: "POST", body: payload, requiresAuth: true }),
    updateMember: (id: string, payload: Partial<TrustMemberPayload>) =>
      request<TrustMember>(`/api/trust/members/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: payload,
        requiresAuth: true,
      }),
    resendInvitation: (id: string) =>
      request<TrustMember>(`/api/trust/members/${encodeURIComponent(id)}/resend-invitation`, {
        method: "POST",
        requiresAuth: true,
      }),
    resetInvitationPin: (id: string, pin: string) =>
      request<TrustMember>(`/api/trust/members/${encodeURIComponent(id)}/reset-pin`, {
        method: "POST",
        body: { pin },
        requiresAuth: true,
      }),
    revokeMember: (id: string) =>
      request<void>(`/api/trust/members/${encodeURIComponent(id)}`, { method: "DELETE", requiresAuth: true }),
    leaveConnection: (id: string) =>
      request<void>(`/api/trust/connections/${encodeURIComponent(id)}/leave`, { method: "POST", requiresAuth: true }),
  },
  wealth: {
    records: () => request<WealthRecord[]>("/api/wealth/records", { requiresAuth: true }),
    createRecord: (payload: WealthRecordPayload) =>
      request<WealthRecord>("/api/wealth/records", { method: "POST", body: payload, requiresAuth: true }),
    formCategories: () => request<DynamicFormCategory[]>("/api/wealth/form/categories", { requiresAuth: true }),
    formSubtypes: (categoryCode: string) =>
      request<DynamicFormSubtype[]>(`/api/wealth/form/categories/${encodeURIComponent(categoryCode)}/subtypes`, { requiresAuth: true }),
    formSchema: (categoryCode: string, subtypeCode: string) =>
      request<DynamicFormSchema>(`/api/wealth/form/categories/${encodeURIComponent(categoryCode)}/subtypes/${encodeURIComponent(subtypeCode)}/schema`, { requiresAuth: true }),
    createRecordFromForm: (payload: WealthDynamicFormSubmitPayload) =>
      request<WealthRecord>("/api/wealth/form/records", { method: "POST", body: payload, requiresAuth: true }),
    handoffSummary: () => request<WealthHandoffSummary>("/api/wealth/handoff/summary", { requiresAuth: true }),
    sendHandoff: (payload: { familyRecipientIds: string[]; emergencyRecipientIds: string[] }) =>
      request<WealthHandoffSendResponse>("/api/wealth/handoff/send", {
        method: "POST",
        body: payload,
        requiresAuth: true,
      }),
  },
  packages: {
    list: (query: PackageListQuery = {}) =>
      request<PackageListResponse>(`/api/packages?${toQueryString({
        category: query.category,
        limit: query.limit ?? 20,
        location: query.location,
        page: query.page ?? 1,
        provider: query.provider,
        search: query.search?.slice(0, 160),
        sort: query.sort,
      })}`, { requiresAuth: true, dedupeMs: 5_000 }),
    get: (slug: string) =>
      request<PackSummary>(`/api/packages/${encodeURIComponent(slug)}`, { requiresAuth: true }),
    streamSearchOrGenerate: (packageType: string, documentLabels: string[], onDelta: (text: string) => void, signal?: AbortSignal) =>
      streamRequest<PackageSearchOrGenerateResponse>("/api/packages/search-or-generate", { packageType, documentLabels: publicDocumentLabels(documentLabels) }, onDelta, signal),
    searchOrGenerate: (packageType: string, documentLabels: string[]) =>
      request<PackageSearchOrGenerateResponse>("/api/packages/search-or-generate", {
        method: "POST",
        body: { packageType, documentLabels: publicDocumentLabels(documentLabels) },
        requiresAuth: true,
      }),
    getByIds: (ids: string[]) =>
      request<PackageLookup[]>(`/packages?ids=${encodeURIComponent(ids.join(","))}`, { requiresAuth: true }),
  },
};
