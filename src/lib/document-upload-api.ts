import type { PublicEncryptionKey } from "./document-envelope";
import { validateImageUploadBatch } from "./document-file-validation";
import {
  encryptDocumentForUpload,
  toEncryptedDocumentFormData,
  toEncryptedDocumentsFormData,
} from "./document-hybrid-encryption";

type AuthenticatedRequest = <T>(
  path: string,
  options: {
    dedupeMs: number;
    requiresAuth: true;
  },
) => Promise<T>;

let keyPromise: Promise<PublicEncryptionKey> | null = null;
let keyExpiresAt = 0;

function getDocumentEncryptionKey(request: AuthenticatedRequest) {
  if (Date.now() >= keyExpiresAt) keyPromise = null;
  keyPromise ??= request<PublicEncryptionKey>("/documents/encryption-key", {
    requiresAuth: true,
    dedupeMs: 60_000,
  })
    .then((key) => {
      keyExpiresAt = Date.now() + 5 * 60_000;
      return key;
    })
    .catch((error) => {
      keyPromise = null;
      keyExpiresAt = 0;
      throw error;
    });
  return keyPromise;
}

export async function buildEncryptedDocumentFormData(
  files: File[],
  aiAnalysisConsent: boolean,
  request: AuthenticatedRequest,
) {
  validateImageUploadBatch(files);
  const key = await getDocumentEncryptionKey(request);
  const envelopes = await Promise.all(files.map((file) => encryptDocumentForUpload(file, key)));
  return toEncryptedDocumentsFormData(envelopes, aiAnalysisConsent);
}
