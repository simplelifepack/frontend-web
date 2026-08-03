import crypto, { webcrypto } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  encryptDocumentForUpload,
  toEncryptedDocumentFormData,
} from "./document-hybrid-encryption";
import {
  DocumentFileValidationError,
  MAX_ORIGINAL_FILE_SIZE,
} from "./document-file-validation";

function browserFile(bytes: Uint8Array, name: string, type: string) {
  const file = new File([bytes.slice().buffer as ArrayBuffer], name, { type });
  if (typeof file.arrayBuffer !== "function") {
    Object.defineProperty(file, "arrayBuffer", {
      value: async () => bytes.slice().buffer,
    });
  }
  return file;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("client-side document hybrid encryption", () => {
  it("validates, encrypts, and wraps a fresh AES key before multipart upload", async () => {
    vi.stubGlobal("crypto", webcrypto);
    vi.stubGlobal("createImageBitmap", vi.fn(async () => ({
      width: 10,
      height: 10,
      close: vi.fn(),
    })));
    const keyPair = crypto.generateKeyPairSync("rsa", {
      modulusLength: 4096,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });
    const pngBytes = Uint8Array.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44,
      0xae, 0x42, 0x60, 0x82,
    ]);
    const file = browserFile(pngBytes, "identity.png", "image/png");
    const envelope = await encryptDocumentForUpload(file, {
      keyId: "browser-test",
      keyVersion: 1,
      algorithm: "RSA-OAEP-4096-SHA256",
      publicKeyPem: keyPair.publicKey,
    });

    expect(envelope.file.encryptedSize).toBe(pngBytes.length + 16);
    expect(envelope.encryption.iv).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(envelope.encryption.wrappedKey).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(envelope.originalMetadata.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(envelope.file.encryptedSha256).toMatch(/^[a-f0-9]{64}$/);

    const wrapped = Buffer.from(envelope.encryption.wrappedKey, "base64url");
    const aesKey = crypto.privateDecrypt(
      {
        key: keyPair.privateKey,
        oaepHash: "sha256",
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      },
      wrapped,
    );
    const ciphertext = Buffer.from(await envelope.file.encryptedBytes.arrayBuffer());
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      aesKey,
      Buffer.from(envelope.encryption.iv, "base64url"),
    );
    decipher.setAuthTag(ciphertext.subarray(-16));
    const decrypted = Buffer.concat([
      decipher.update(ciphertext.subarray(0, -16)),
      decipher.final(),
    ]);
    expect(decrypted).toEqual(Buffer.from(pngBytes));

    const formData = toEncryptedDocumentFormData(envelope, false);
    expect(formData.get("encryptedFile")).toBeInstanceOf(Blob);
    expect(formData.has("file")).toBe(false);
    expect(formData.get("originalFilename")).toBe("identity.png");
  });

  it("rejects mismatched and empty files before encryption", async () => {
    const fakePdf = browserFile(
      Uint8Array.from([0x4d, 0x5a, 0x00, 0x00]),
      "renamed.pdf",
      "application/pdf",
    );
    await expect(
      import("./document-file-validation").then(({ validateDocumentFile }) =>
        validateDocumentFile(fakePdf),
      ),
    ).rejects.toMatchObject({
      code: "FILE_SIGNATURE_MISMATCH",
    } satisfies Partial<DocumentFileValidationError>);

    const empty = browserFile(new Uint8Array(), "empty.png", "image/png");
    await expect(
      import("./document-file-validation").then(({ validateDocumentFile }) =>
        validateDocumentFile(empty),
      ),
    ).rejects.toMatchObject({
      code: "EMPTY_FILE",
    } satisfies Partial<DocumentFileValidationError>);

    const oversized = {
      name: "oversized.pdf",
      type: "application/pdf",
      size: MAX_ORIGINAL_FILE_SIZE + 1,
    } as File;
    await expect(
      import("./document-file-validation").then(({ validateDocumentFile }) =>
        validateDocumentFile(oversized),
      ),
    ).rejects.toMatchObject({
      code: "FILE_TOO_LARGE",
    } satisfies Partial<DocumentFileValidationError>);
  });
});
