import { invalidateRequests } from "./request-deduper";
import { getAuthGeneration } from "./auth";
import { buildEncryptedDocumentFormData } from "./document-upload-api";
import { downloadBlob, request } from "./http-client";
import type { AnalyzeDocumentResponse, DocumentRecord, SaveDocumentPayload, HealthProcessResponse } from "./api.types";

const activeAnalyses: Array<{ generation: number; files: File[]; promise: Promise<AnalyzeDocumentResponse> }> = [];

function analyzeUpload(files: File[], path: string): Promise<AnalyzeDocumentResponse> {
  const generation = getAuthGeneration();
  const active = activeAnalyses.find(item => item.generation === generation &&
    item.files.length === files.length && item.files.every((file, index) => file === files[index]));
  if (active) return active.promise;
  const pending = buildEncryptedDocumentFormData(files, request).then(body => {
    if (generation !== getAuthGeneration()) throw new Error("Your session changed. Select the document again.");
    return request<AnalyzeDocumentResponse>(path, { method: "POST", body, requiresAuth: true });
  }).finally(() => {
    activeAnalyses.splice(activeAnalyses.indexOf(entry), 1);
  });
  const entry = { generation, files: [...files], promise: pending };
  activeAnalyses.push(entry);
  return pending;
}

export const documentsApi = {
  updateDetails: (id: string, details: { notes?: string; expiry?: string | null }) => request<{ document: DocumentRecord }>(`/documents/${encodeURIComponent(id)}/details`, { method: "PATCH", body: details, requiresAuth: true }),
  assignmentOptions: () => request<Array<{ id: string; name: string }>>("/documents/assignment-options", { requiresAuth: true, dedupeMs: 0 }),
  bulkAssign: (ids: string[], assigneeId: string) => request<{ documents: DocumentRecord[] }>("/documents/bulk-assign", { method: "POST", body: { ids, assigneeId }, requiresAuth: true }),
  list: () => request<DocumentRecord[]>("/documents", { requiresAuth: true }),
  getById: (id: string) => request<DocumentRecord>(`/documents/${id}`, { requiresAuth: true }),
  preview: (id: string, signal?: AbortSignal) => downloadBlob(`/documents/${encodeURIComponent(id)}/preview`, { requiresAuth: true, signal }),
  download: (id: string) => downloadBlob(`/documents/${encodeURIComponent(id)}/download`, { requiresAuth: true }),
  bulkDownload: (ids: string[]) => downloadBlob("/documents/bulk-download", { method: "POST", body: { ids }, requiresAuth: true }),
  analyze: (files: File[]) => analyzeUpload(files, "/documents/analyze"),
  analyzeBatch: async (files: File[]) => {
    const generation = getAuthGeneration();
    const body = await buildEncryptedDocumentFormData(files, request);
    if (generation !== getAuthGeneration()) throw new Error("Your session changed. Select the documents again.");
    return request<{ analyses: AnalyzeDocumentResponse[]; issues: Array<{ fileName: string; message: string }> }>(
      "/documents/analyze/batch", { method: "POST", body, requiresAuth: true },
    );
  },
  save: async (payload: SaveDocumentPayload) => {
    const generation = getAuthGeneration();
    const saved = await request<{ document: DocumentRecord; healthRecord?: HealthProcessResponse | null; replayed?: boolean }>("/documents", { method: "POST", body: payload, requiresAuth: true });
    if (generation === getAuthGeneration()) {
      invalidateRequests("GET:/api/health");
      if (!saved.replayed && saved.healthRecord && typeof window !== "undefined") {
        const createdMember = "createdMember" in saved.healthRecord ? saved.healthRecord.createdMember : undefined;
        const memberId = "memberId" in saved.healthRecord ? saved.healthRecord.memberId : undefined;
        window.dispatchEvent(new CustomEvent("readiness:health-updated", { detail: { createdMember, memberId } }));
      }
    }
    return saved;
  },
  upload: (files: File[]) => analyzeUpload(files, "/documents/upload"),
  addPageFiles: async (id: string, files: File[]) =>
    request<{ document: DocumentRecord }>(`/documents/${encodeURIComponent(id)}/pages`, {
      method: "POST", body: await buildEncryptedDocumentFormData(files, request), requiresAuth: true,
    }),
  reorderPages: (id: string, pageIds: string[]) =>
    request<{ document: DocumentRecord }>(`/documents/${encodeURIComponent(id)}/pages/order`, { method: "PATCH", body: { pageIds }, requiresAuth: true }),
  replacePage: (id: string, pageId: string, tempFileId: string) =>
    request<{ document: DocumentRecord }>(`/documents/${encodeURIComponent(id)}/pages/${encodeURIComponent(pageId)}`, { method: "PATCH", body: { tempFileId }, requiresAuth: true }),
  deletePage: (id: string, pageId: string) =>
    request<{ document: DocumentRecord }>(`/documents/${encodeURIComponent(id)}/pages/${encodeURIComponent(pageId)}`, { method: "DELETE", requiresAuth: true }),
  previewPage: (id: string, pageId: string, signal?: AbortSignal) =>
    downloadBlob(`/documents/${encodeURIComponent(id)}/pages/${encodeURIComponent(pageId)}/preview`, { requiresAuth: true, signal }),
  downloadPage: (id: string, pageId: string) =>
    downloadBlob(`/documents/${encodeURIComponent(id)}/pages/${encodeURIComponent(pageId)}/download`, { requiresAuth: true }),
  delete: (id: string) => request<void>(`/documents/${encodeURIComponent(id)}`, { method: "DELETE", requiresAuth: true }),
  bulkDelete: (ids: string[]) => request<void>("/documents/bulk-delete", { method: "POST", body: { ids }, requiresAuth: true }),
};
