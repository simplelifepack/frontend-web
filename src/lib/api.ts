import { publicDocumentLabels } from "./public-document-labels";
import { streamRequest } from "./http-client";
import { API_URL, downloadBlob, request } from "./http-client";
import { documentsApi } from "./documents-api";
import type {
  AccountUsage, AuthResponse, AuthUser, BootstrapResponse, CustomPackDraftResponse,
  CustomPackPayload,
  DynamicFormCategory, DynamicFormSchema, DynamicFormSubtype,
  DriveScanResult, DriveStatus, ForgotPasswordResponse,
  GmailCandidate, GmailImportResult, GmailStatus,
  HealthAvailableMetric, HealthHomeReminder, HealthMeasurement, HealthMedication,
  HealthMember, HealthOverview, HealthProcessResponse,
  HealthRecord, HealthRecordDetail, HealthTimelineEvent,
  TrackedHealthMetric, PackSummary, PackageListQuery, PackageListResponse,
  PackageLookup, PackageSearchOrGenerateResponse, ResetPasswordResponse,
  RequirementAssignmentSource,
  TrustCenterResponse, TrustInvitation, TrustMember,
  TrustMemberPayload, WealthHandoffSendResponse,
  WealthHandoffSummary, WealthRecord, WealthRecordPayload, WealthDynamicFormSubmitPayload,
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
    requestSignupOtp: (payload: { name: string; email: string; password: string }) =>
      request<ForgotPasswordResponse>("/auth/signup/request-otp", { method: "POST", body: payload }),
    signup: (payload: { name: string; email: string; password: string; otp: string }) =>
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
    forgotPasswordOtp: (payload: { email: string }) =>
      request<ForgotPasswordResponse>("/auth/forgot-password/otp", { method: "POST", body: payload }),
    resetPassword: (payload: { token: string; password: string }) =>
      request<ResetPasswordResponse>("/auth/reset-password", { method: "POST", body: payload }),
    resetPasswordOtp: (payload: { email: string; otp: string; password: string }) =>
      request<ResetPasswordResponse>("/auth/reset-password/otp", { method: "POST", body: payload }),
    requestEmailChange: (payload: { newEmail: string; currentPassword: string }) =>
      request<ForgotPasswordResponse>("/auth/account/change-email/request", { method: "POST", body: payload, requiresAuth: true }),
    verifyEmailChange: (payload: { otp: string }) =>
      request<{ message: string; user: AuthUser }>("/auth/account/change-email/verify", { method: "POST", body: payload, requiresAuth: true }),
    requestPasswordChange: (payload: { currentPassword: string; newPassword: string }) =>
      request<ForgotPasswordResponse>("/auth/account/change-password/request", { method: "POST", body: payload, requiresAuth: true }),
    verifyPasswordChange: (payload: { otp: string }) =>
      request<ForgotPasswordResponse>("/auth/account/change-password/verify", { method: "POST", body: payload, requiresAuth: true }),
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
  documents: documentsApi,
  account: { requestExport: () => request<{ id: string; status: string; expiresAt?: string | null }>("/api/account/export", { method: "POST", requiresAuth: true }), exportStatus: (jobId: string) => request<{ id: string; status: string; expiresAt?: string | null; errorMessage?: string | null }>(`/api/account/export/${encodeURIComponent(jobId)}`, { requiresAuth: true, dedupeMs: 0 }), downloadExport: (jobId: string) => downloadBlob(`/api/account/export/${encodeURIComponent(jobId)}/download`, { requiresAuth: true }), scheduleDeletion: (phrase: string) => request<{ message: string; scheduledDeletionAt: string }>("/api/account/deletion", { method: "POST", body: { phrase }, requiresAuth: true }) },
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
    addFamilyMember: (payload: TrustMemberPayload) =>
      request<TrustMember>("/api/trust/family-members", { method: "POST", body: payload, requiresAuth: true }),
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
    updateRecord: (id: string, payload: WealthRecordPayload) =>
      request<WealthRecord>(`/api/wealth/records/${encodeURIComponent(id)}`, { method: "PATCH", body: payload, requiresAuth: true }),
    deleteRecord: (id: string) =>
      request<void>(`/api/wealth/records/${encodeURIComponent(id)}`, { method: "DELETE", requiresAuth: true }),
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
  health: {
    reminders: () => request<HealthHomeReminder[]>("/api/health/reminders", { requiresAuth: true, dedupeMs: 0 }),
    createReminder: (payload: { memberId: string; title: string; type: "appointment" | "medicine" | "refill" | "other"; dueDate: string; frequency: "once" | "daily" | "weekly" | "monthly" }) =>
      request('/api/health/reminders', { method: 'POST', body: payload, requiresAuth: true }),
    members: () => request<HealthMember[]>("/api/health/members", { requiresAuth: true, dedupeMs: 0 }),
    createMember: (payload: { name: string; relation: string; bloodGroup?: string | null; dateOfBirth?: string | null }) =>
      request<HealthMember>("/api/health/members", { method: "POST", body: payload, requiresAuth: true }),
    updateMember: (memberId: string, payload: Partial<{ name: string; relation: string; bloodGroup?: string | null; dateOfBirth?: string | null; conditions?: string | null; allergies?: string | null; emergencyContactName?: string | null; emergencyContactPhone?: string | null; primaryDoctor?: string | null; insuranceProvider?: string | null; insurancePolicyNumber?: string | null }>) =>
      request<HealthMember>(`/api/health/members/${encodeURIComponent(memberId)}`, { method: "PATCH", body: payload, requiresAuth: true }),
    deleteMember: (memberId: string) =>
      request<void>(`/api/health/members/${encodeURIComponent(memberId)}`, { method: "DELETE", requiresAuth: true }),
    overview: (memberId: string) =>
      request<HealthOverview>(`/api/health/members/${encodeURIComponent(memberId)}/overview`, { requiresAuth: true, dedupeMs: 0 }),
    records: (memberId: string) =>
      request<HealthRecord[]>(`/api/health/members/${encodeURIComponent(memberId)}/records`, { requiresAuth: true, dedupeMs: 0 }),
    createRecord: (payload: { memberId?: string; documentId: string; type?: "lab_report" | "medical_report" | "prescription" }) =>
      request<HealthProcessResponse>("/api/health/records", { method: "POST", body: payload, requiresAuth: true }),
    updateRecord: (recordId: string, payload: { type?: "lab_report" | "medical_report" | "prescription" }) =>
      request<HealthRecordDetail>(`/api/health/records/${encodeURIComponent(recordId)}`, { method: "PATCH", body: payload, requiresAuth: true }),
    record: (recordId: string) =>
      request<HealthRecordDetail>(`/api/health/records/${encodeURIComponent(recordId)}`, { requiresAuth: true, dedupeMs: 0 }),
    deleteRecord: (recordId: string) =>
      request<void>(`/api/health/records/${encodeURIComponent(recordId)}`, { method: "DELETE", requiresAuth: true }),
    measurements: (memberId: string, metric?: string) =>
      request<HealthMeasurement[]>(`/api/health/members/${encodeURIComponent(memberId)}/measurements${metric ? `?metric=${encodeURIComponent(metric)}` : ""}`, { requiresAuth: true, dedupeMs: 0 }),
    createMeasurement: (memberId: string, payload: { metricKey: string; displayName: string; originalName?: string; value: number; secondaryValue?: number | null; unit: string; context?: string | null; bodySite?: string | null; referenceMin?: number | null; referenceMax?: number | null; referenceText?: string | null; measuredAt: string }) =>
      request<HealthMeasurement>(`/api/health/members/${encodeURIComponent(memberId)}/measurements`, { method: "POST", body: payload, requiresAuth: true }),
    trackedMetrics: (memberId: string) =>
      request<TrackedHealthMetric[]>(`/api/health/members/${encodeURIComponent(memberId)}/tracked-metrics`, { requiresAuth: true, dedupeMs: 0 }),
    trackMetric: (memberId: string, payload: { metricKey: string; displayName: string; context?: string | null; bodySite?: string | null }) =>
      request<TrackedHealthMetric>(`/api/health/members/${encodeURIComponent(memberId)}/tracked-metrics`, { method: "POST", body: payload, requiresAuth: true }),
    untrackMetric: (memberId: string, trackedId: string) =>
      request<void>(`/api/health/members/${encodeURIComponent(memberId)}/tracked-metrics/${encodeURIComponent(trackedId)}`, { method: "DELETE", requiresAuth: true }),
    availableMetrics: (memberId: string, search = "") =>
      request<HealthAvailableMetric[]>(`/api/health/members/${encodeURIComponent(memberId)}/available-metrics?${toQueryString({ search })}`, { requiresAuth: true, dedupeMs: 0 }),
    timeline: (memberId: string) =>
      request<HealthTimelineEvent[]>(`/api/health/members/${encodeURIComponent(memberId)}/timeline`, { requiresAuth: true, dedupeMs: 0 }),
    createMedication: (memberId: string, payload: { name: string; dose: string; whenToTake: Array<"morning" | "afternoon" | "night">; mealTiming: "before_food" | "after_food" | "with_food" | "any_time"; repeatRunsOut?: string | null }) =>
      request<HealthMedication>(`/api/health/members/${encodeURIComponent(memberId)}/medications`, { method: "POST", body: payload, requiresAuth: true }),
    updateMedication: (medicationId: string, payload: Partial<{ name: string; dose: string | null; whenToTake: Array<"morning" | "afternoon" | "night">; mealTiming: "before_food" | "after_food" | "with_food" | "any_time" | null; repeatRunsOut: string | null; frequency: string | null; duration: string | null; quantity: string | null; repeats: boolean; runsOutAt: string | null; status: "continuing" | "stopped"; stoppedAt: string | null }>) =>
      request<HealthMedication>(`/api/health/medications/${encodeURIComponent(medicationId)}`, { method: "PATCH", body: payload, requiresAuth: true }),
    deleteMedication: (medicationId: string) =>
      request<void>(`/api/health/medications/${encodeURIComponent(medicationId)}`, { method: "DELETE", requiresAuth: true }),
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
    refresh: (slug: string) =>
      request<{ package: PackSummary; changed: boolean; message: string }>(`/api/packages/${encodeURIComponent(slug)}/refresh`, { method: "POST", requiresAuth: true }),
    streamSearchOrGenerate: (packageType: string, documentLabels: string[], onDelta: (text: string) => void, signal?: AbortSignal) =>
      streamRequest<PackageSearchOrGenerateResponse>("/api/packages/search-or-generate", { packageType, documentLabels: publicDocumentLabels(documentLabels) }, onDelta, signal),
    searchOrGenerate: (packageType: string, documentLabels: string[]) =>
      request<PackageSearchOrGenerateResponse>("/api/packages/search-or-generate", {
        method: "POST",
        body: { packageType, documentLabels: publicDocumentLabels(documentLabels) },
        requiresAuth: true,
      }),
    draftCustom: (packageType: string, documentLabels: string[]) =>
      request<CustomPackDraftResponse>("/api/packages/custom/draft", {
        method: "POST",
        body: { packageType, documentLabels: publicDocumentLabels(documentLabels) },
        requiresAuth: true,
      }),
    createCustom: (payload: CustomPackPayload) =>
      request<{ package: PackSummary }>("/api/packages/custom", { method: "POST", body: payload, requiresAuth: true }),
    updateCustom: (slug: string, payload: CustomPackPayload) =>
      request<{ package: PackSummary }>(`/api/packages/${encodeURIComponent(slug)}/custom`, { method: "PATCH", body: payload, requiresAuth: true }),
    deleteCustom: (slug: string) =>
      request<void>(`/api/packages/${encodeURIComponent(slug)}/custom`, { method: "DELETE", requiresAuth: true }),
    getByIds: (ids: string[]) =>
      request<PackageLookup[]>(`/packages?ids=${encodeURIComponent(ids.join(","))}`, { requiresAuth: true }),
    assignRequirementDocument: (slug: string, requirementId: string, payload: { documentId: string; assignmentSource: Exclude<RequirementAssignmentSource, "AUTO"> }) =>
      request<{ package: PackSummary }>(`/api/packages/${encodeURIComponent(slug)}/requirements/${encodeURIComponent(requirementId)}/assignment`, {
        method: "POST",
        body: payload,
        requiresAuth: true,
      }),
    clearRequirementDocument: (slug: string, requirementId: string) =>
      request<{ package: PackSummary }>(`/api/packages/${encodeURIComponent(slug)}/requirements/${encodeURIComponent(requirementId)}/assignment`, {
        method: "DELETE",
        requiresAuth: true,
      }),
  },
};
