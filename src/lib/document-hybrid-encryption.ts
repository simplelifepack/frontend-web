import {
  CONTENT_ALGORITHM,
  ENCRYPTION_VERSION,
  KEY_ALGORITHM,
  type EncryptedDocumentEnvelope,
  type PublicEncryptionKey,
} from "./document-envelope";
import { validateDocumentFile } from "./document-file-validation";

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function pemToBytes(pem: string) {
  const base64 = pem
    .replace(/-----BEGIN PUBLIC KEY-----/g, "")
    .replace(/-----END PUBLIC KEY-----/g, "")
    .replace(/\s+/g, "");
  const binary = atob(base64);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function sha256Hex(bytes: BufferSource) {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  return [...digest].map((value) => value.toString(16).padStart(2, "0")).join("");
}

async function importPublicKey(publicKeyPem: string) {
  return crypto.subtle.importKey(
    "spki",
    pemToBytes(publicKeyPem),
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"],
  );
}

export async function encryptDocumentForUpload(
  file: File,
  key: PublicEncryptionKey,
): Promise<EncryptedDocumentEnvelope> {
  if (key.algorithm !== KEY_ALGORITHM) {
    throw new Error("The server returned an unsupported document encryption key.");
  }

  const { bytes, mimeType } = await validateDocumentFile(file);
  const aesKey = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt"],
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encryptedBytes = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv, tagLength: 128 },
      aesKey,
      bytes,
    ),
  );
  const rawAesKey = new Uint8Array(await crypto.subtle.exportKey("raw", aesKey));

  try {
    const rsaKey = await importPublicKey(key.publicKeyPem);
    const wrappedKey = new Uint8Array(
      await crypto.subtle.encrypt({ name: "RSA-OAEP" }, rsaKey, rawAesKey),
    );
    const [originalSha256, encryptedSha256] = await Promise.all([
      sha256Hex(bytes),
      sha256Hex(encryptedBytes),
    ]);

    return {
      version: ENCRYPTION_VERSION,
      encryption: {
        contentAlgorithm: CONTENT_ALGORITHM,
        keyAlgorithm: KEY_ALGORITHM,
        keyId: key.keyId,
        keyVersion: key.keyVersion,
        iv: bytesToBase64Url(iv),
        wrappedKey: bytesToBase64Url(wrappedKey),
      },
      file: {
        encryptedBytes: new Blob([encryptedBytes], { type: "application/octet-stream" }),
        encryptedSize: encryptedBytes.byteLength,
        encryptedSha256,
      },
      originalMetadata: {
        filename: file.name,
        mimeType,
        size: bytes.byteLength,
        sha256: originalSha256,
      },
    };
  } finally {
    rawAesKey.fill(0);
    bytes.fill(0);
  }
}

export function toEncryptedDocumentFormData(
  envelope: EncryptedDocumentEnvelope,
  aiAnalysisConsent: boolean,
) {
  const formData = new FormData();
  formData.append("encryptedFile", envelope.file.encryptedBytes, "document.bin");
  formData.append("wrappedKey", envelope.encryption.wrappedKey);
  formData.append("iv", envelope.encryption.iv);
  formData.append("encryptionVersion", String(envelope.version));
  formData.append("keyId", envelope.encryption.keyId);
  formData.append("keyVersion", String(envelope.encryption.keyVersion));
  formData.append("contentAlgorithm", envelope.encryption.contentAlgorithm);
  formData.append("keyAlgorithm", envelope.encryption.keyAlgorithm);
  formData.append("originalFilename", envelope.originalMetadata.filename);
  formData.append("originalMimeType", envelope.originalMetadata.mimeType);
  formData.append("originalSize", String(envelope.originalMetadata.size));
  formData.append("originalSha256", envelope.originalMetadata.sha256);
  formData.append("encryptedSha256", envelope.file.encryptedSha256);
  formData.append("aiAnalysisConsent", String(aiAnalysisConsent));
  return formData;
}

export function toEncryptedDocumentsFormData(envelopes: EncryptedDocumentEnvelope[], aiAnalysisConsent: boolean) {
  const formData = new FormData();
  envelopes.forEach((envelope) => formData.append("encryptedFiles", envelope.file.encryptedBytes, "document.bin"));
  formData.append("envelopes", JSON.stringify(envelopes.map((envelope) => ({
    wrappedKey: envelope.encryption.wrappedKey, iv: envelope.encryption.iv, encryptionVersion: envelope.version,
    keyId: envelope.encryption.keyId, keyVersion: envelope.encryption.keyVersion, contentAlgorithm: envelope.encryption.contentAlgorithm,
    keyAlgorithm: envelope.encryption.keyAlgorithm, originalFilename: envelope.originalMetadata.filename,
    originalMimeType: envelope.originalMetadata.mimeType, originalSize: envelope.originalMetadata.size,
    originalSha256: envelope.originalMetadata.sha256, encryptedSha256: envelope.file.encryptedSha256,
  }))));
  formData.append("aiAnalysisConsent", String(aiAnalysisConsent));
  return formData;
}
