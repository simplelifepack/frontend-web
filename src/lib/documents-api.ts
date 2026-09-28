import { buildEncryptedDocumentFormData } from "./document-upload-api";
import { downloadBlob, request } from "./http-client";
import type { AnalyzeDocumentResponse, DocumentRecord, SaveDocumentPayload, UploadDocumentResponse } from "./api.types";

export const documentsApi = {
  list: () => request<DocumentRecord[]>("/documents", { requiresAuth: true }),
  getById: (id: string) => request<DocumentRecord>(`/documents/${id}`, { requiresAuth: true }),
  preview: (id: string) => downloadBlob(`/documents/${encodeURIComponent(id)}/preview`, { requiresAuth: true }),
  download: (id: string) => downloadBlob(`/documents/${encodeURIComponent(id)}/download`, { requiresAuth: true }),
  bulkDownload: (ids: string[]) => downloadBlob("/documents/bulk-download", { method: "POST", body: { ids }, requiresAuth: true }),
  analyze: async (files: File[], aiAnalysisConsent = false) =>
    request<AnalyzeDocumentResponse>("/documents/analyze", {
      method: "POST", body: await buildEncryptedDocumentFormData(files, aiAnalysisConsent, request), requiresAuth: true,
    }),
  save: (payload: SaveDocumentPayload) =>
    request<{ document: DocumentRecord }>("/documents", { method: "POST", body: payload, requiresAuth: true }),
  upload: async (files: File[], aiAnalysisConsent = false) =>
    request<UploadDocumentResponse>("/documents/upload", {
      method: "POST", body: await buildEncryptedDocumentFormData(files, aiAnalysisConsent, request), requiresAuth: true,
    }),
  addPageFiles: async (id: string, files: File[]) =>
    request<{ document: DocumentRecord }>(`/documents/${encodeURIComponent(id)}/pages`, {
      method: "POST", body: await buildEncryptedDocumentFormData(files, false, request), requiresAuth: true,
    }),
  reorderPages: (id: string, pageIds: string[]) =>
    request<{ document: DocumentRecord }>(`/documents/${encodeURIComponent(id)}/pages/order`, { method: "PATCH", body: { pageIds }, requiresAuth: true }),
  replacePage: (id: string, pageId: string, tempFileId: string) =>
    request<{ document: DocumentRecord }>(`/documents/${encodeURIComponent(id)}/pages/${encodeURIComponent(pageId)}`, { method: "PATCH", body: { tempFileId }, requiresAuth: true }),
  deletePage: (id: string, pageId: string) =>
    request<{ document: DocumentRecord }>(`/documents/${encodeURIComponent(id)}/pages/${encodeURIComponent(pageId)}`, { method: "DELETE", requiresAuth: true }),
  previewPage: (id: string, pageId: string) =>
    downloadBlob(`/documents/${encodeURIComponent(id)}/pages/${encodeURIComponent(pageId)}/preview`, { requiresAuth: true }),
  downloadPage: (id: string, pageId: string) =>
    downloadBlob(`/documents/${encodeURIComponent(id)}/pages/${encodeURIComponent(pageId)}/download`, { requiresAuth: true }),
  delete: (id: string) => request<void>(`/documents/${encodeURIComponent(id)}`, { method: "DELETE", requiresAuth: true }),
  bulkDelete: (ids: string[]) => request<void>("/documents/bulk-delete", { method: "POST", body: { ids }, requiresAuth: true }),
};
