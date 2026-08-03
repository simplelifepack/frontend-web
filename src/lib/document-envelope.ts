export const CONTENT_ALGORITHM = "AES-256-GCM" as const;
export const KEY_ALGORITHM = "RSA-OAEP-4096-SHA256" as const;
export const ENCRYPTION_VERSION = 1 as const;

export type SupportedDocumentMimeType =
  | "application/pdf"
  | "image/jpeg"
  | "image/png"
  | "image/webp";

export type EncryptionKeyReference = {
  keyId: string;
  keyVersion: number;
  algorithm: typeof KEY_ALGORITHM;
};

export type PublicEncryptionKey = EncryptionKeyReference & {
  publicKeyPem: string;
};

export type EncryptedDocumentEnvelope = {
  version: typeof ENCRYPTION_VERSION;
  encryption: {
    contentAlgorithm: typeof CONTENT_ALGORITHM;
    keyAlgorithm: typeof KEY_ALGORITHM;
    keyId: string;
    keyVersion: number;
    iv: string;
    wrappedKey: string;
  };
  file: {
    encryptedBytes: Blob;
    encryptedSize: number;
    encryptedSha256: string;
  };
  originalMetadata: {
    filename: string;
    mimeType: SupportedDocumentMimeType;
    size: number;
    sha256: string;
  };
};
