import {
  getDocument,
  GlobalWorkerOptions,
  type PDFDocumentProxy,
} from "pdfjs-dist/legacy/build/pdf.mjs";
import pdfWorkerUrl from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";

import type { SupportedDocumentMimeType } from "./document-envelope";

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const MB = 1024 * 1024;
export const MAX_ORIGINAL_FILE_SIZE = Number(import.meta.env.VITE_MAX_DOCUMENT_SIZE_BYTES) || 20 * MB;
const MAX_IMAGE_WIDTH = Number(import.meta.env.VITE_MAX_IMAGE_WIDTH) || 12_000;
const MAX_IMAGE_HEIGHT = Number(import.meta.env.VITE_MAX_IMAGE_HEIGHT) || 12_000;
const MAX_IMAGE_PIXELS = Number(import.meta.env.VITE_MAX_IMAGE_PIXELS) || 60_000_000;
const MAX_PDF_PAGES = Number(import.meta.env.VITE_MAX_PDF_PAGES) || 500;

const extensionByMime: Record<SupportedDocumentMimeType, ReadonlySet<string>> = {
  "application/pdf": new Set([".pdf"]),
  "image/jpeg": new Set([".jpg", ".jpeg"]),
  "image/png": new Set([".png"]),
  "image/webp": new Set([".webp"]),
};

const allowedMimeTypes = new Set<SupportedDocumentMimeType>(
  Object.keys(extensionByMime) as SupportedDocumentMimeType[],
);

export class DocumentFileValidationError extends Error {
  constructor(
    readonly code:
      | "EMPTY_FILE"
      | "FILE_TOO_LARGE"
      | "UNSUPPORTED_FILE_TYPE"
      | "FILE_SIGNATURE_MISMATCH"
      | "FILE_CORRUPTED"
      | "PASSWORD_PROTECTED_FILE"
      | "UNSAFE_FILE",
    message: string,
  ) {
    super(message);
    this.name = "DocumentFileValidationError";
  }
}

function extensionOf(filename: string) {
  const match = filename.toLowerCase().match(/\.[a-z0-9]+$/);
  return match?.[0] ?? "";
}

function matches(bytes: Uint8Array, expected: number[], offset = 0) {
  return expected.every((value, index) => bytes[offset + index] === value);
}

export function detectDocumentMimeType(bytes: Uint8Array): SupportedDocumentMimeType | null {
  if (
    bytes.length >= 5 &&
    matches(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d])
  ) {
    return "application/pdf";
  }
  if (bytes.length >= 3 && matches(bytes, [0xff, 0xd8, 0xff])) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    matches(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 12 &&
    matches(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    matches(bytes, [0x57, 0x45, 0x42, 0x50], 8)
  ) {
    return "image/webp";
  }
  return null;
}

function assertPdfStaticSafety(bytes: Uint8Array) {
  const tail = new TextDecoder("latin1").decode(bytes.subarray(Math.max(0, bytes.length - 4096)));
  if (!tail.includes("%%EOF")) {
    throw new DocumentFileValidationError("FILE_CORRUPTED", "The PDF is truncated or has no valid ending.");
  }

  const source = new TextDecoder("latin1").decode(bytes);
  if (/\/Encrypt\b/.test(source)) {
    throw new DocumentFileValidationError(
      "PASSWORD_PROTECTED_FILE",
      "Password-protected PDFs are not supported.",
    );
  }
  if (/\/(?:JavaScript|JS|Launch|EmbeddedFile|Filespec)\b|\/AA\s*<</.test(source)) {
    throw new DocumentFileValidationError(
      "UNSAFE_FILE",
      "The PDF contains scripts, launch actions, or embedded files.",
    );
  }
}

async function parsePdf(bytes: Uint8Array) {
  assertPdfStaticSafety(bytes);
  let document: PDFDocumentProxy | undefined;
  try {
    const task = getDocument({
      data: bytes.slice(),
      isEvalSupported: false,
      stopAtErrors: true,
      useWorkerFetch: false,
    });
    document = await task.promise;
    if (document.numPages < 1 || document.numPages > MAX_PDF_PAGES) {
      throw new DocumentFileValidationError(
        "UNSAFE_FILE",
        `PDFs must contain between 1 and ${MAX_PDF_PAGES} pages.`,
      );
    }
    await document.getPage(1);
    if (document.numPages > 1) await document.getPage(document.numPages);
  } catch (error) {
    if (error instanceof DocumentFileValidationError) throw error;
    const message = error instanceof Error ? error.message : "";
    if (/password/i.test(message)) {
      throw new DocumentFileValidationError(
        "PASSWORD_PROTECTED_FILE",
        "Password-protected PDFs are not supported.",
      );
    }
    throw new DocumentFileValidationError("FILE_CORRUPTED", "The PDF could not be safely parsed.");
  } finally {
    await document?.destroy().catch(() => undefined);
  }
}

async function decodeImage(bytes: Uint8Array, mimeType: SupportedDocumentMimeType) {
  const isValidEnding =
    (mimeType === "image/jpeg" &&
      bytes.at(-2) === 0xff &&
      bytes.at(-1) === 0xd9) ||
    (mimeType === "image/png" &&
      matches(
        bytes,
        [0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82],
        bytes.length - 12,
      )) ||
    (mimeType === "image/webp" &&
      bytes.length >= 12 &&
      new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(4, true) + 8 === bytes.length);
  if (!isValidEnding) {
    throw new DocumentFileValidationError(
      "FILE_CORRUPTED",
      "The image is truncated or contains unexpected trailing data.",
    );
  }
  let bitmap: ImageBitmap | undefined;
  try {
    bitmap = await createImageBitmap(new Blob([bytes.slice()], { type: mimeType }));
    if (
      bitmap.width < 1 ||
      bitmap.height < 1 ||
      bitmap.width > MAX_IMAGE_WIDTH ||
      bitmap.height > MAX_IMAGE_HEIGHT ||
      bitmap.width * bitmap.height > MAX_IMAGE_PIXELS
    ) {
      throw new DocumentFileValidationError(
        "UNSAFE_FILE",
        "The image dimensions exceed ReadiNes's safe decoding limits.",
      );
    }
  } catch (error) {
    if (error instanceof DocumentFileValidationError) throw error;
    throw new DocumentFileValidationError("FILE_CORRUPTED", "The image could not be safely decoded.");
  } finally {
    bitmap?.close();
  }
}

export async function validateDocumentFile(file: File) {
  if (file.size === 0) {
    throw new DocumentFileValidationError("EMPTY_FILE", "Choose a non-empty document.");
  }
  if (file.size > MAX_ORIGINAL_FILE_SIZE) {
    throw new DocumentFileValidationError(
      "FILE_TOO_LARGE",
      `Documents must be ${Math.floor(MAX_ORIGINAL_FILE_SIZE / MB)} MB or smaller.`,
    );
  }

  const extension = extensionOf(file.name);
  const declaredMimeType = file.type as SupportedDocumentMimeType;
  if (!allowedMimeTypes.has(declaredMimeType) || !extensionByMime[declaredMimeType].has(extension)) {
    throw new DocumentFileValidationError(
      "UNSUPPORTED_FILE_TYPE",
      "Use a PDF, JPEG, PNG, or WebP file with a matching filename and MIME type.",
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const detectedMimeType = detectDocumentMimeType(bytes);
  if (!detectedMimeType || detectedMimeType !== declaredMimeType) {
    throw new DocumentFileValidationError(
      "FILE_SIGNATURE_MISMATCH",
      "The file contents do not match its filename or reported type.",
    );
  }

  if (detectedMimeType === "application/pdf") {
    await parsePdf(bytes);
  } else {
    await decodeImage(bytes, detectedMimeType);
  }

  return { bytes, mimeType: detectedMimeType };
}
