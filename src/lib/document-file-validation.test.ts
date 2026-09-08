import { afterEach, expect, it, vi } from 'vitest';
import { MAX_ORIGINAL_FILE_SIZE, validateDocumentFile } from './document-file-validation';
import { apiError } from './http-client';

afterEach(() => vi.unstubAllGlobals());
function file(bytes: number[], name = 'photo.png', type = 'image/png') {
  return { name, type, size: bytes.length, arrayBuffer: async () => Uint8Array.from(bytes).buffer } as File;
}
it('distinguishes oversized and unsupported files before decoding', async () => {
  await expect(validateDocumentFile({ size: MAX_ORIGINAL_FILE_SIZE + 1 } as File)).rejects.toMatchObject({ code: 'FILE_TOO_LARGE', message: expect.stringMatching(/File is too large.*MB/) });
  await expect(validateDocumentFile(file([1], 'photo.gif', 'image/gif'))).rejects.toMatchObject({ code: 'UNSUPPORTED_FILE_TYPE', message: expect.stringContaining('JPEG, PNG, WebP, or PDF') });
});
it('shows the same helpful corruption message for incomplete and undecodable images', async () => {
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  const ending = [0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130];
  vi.stubGlobal('createImageBitmap', vi.fn().mockRejectedValue(new Error('internal decoder failure')));
  for (const bytes of [signature, [...signature, ...ending]]) {
    await expect(validateDocumentFile(file(bytes))).rejects.toMatchObject({ code: 'FILE_CORRUPTED', message: 'This file appears to be corrupted. Please try uploading another copy.' });
  }
});
it('replaces technical API validation messages while retaining their codes', () => {
  for (const code of ['FILE_CORRUPTED', 'FILE_TOO_LARGE', 'UNSUPPORTED_FILE_TYPE']) {
    const error = apiError({ code, message: 'truncated unexpected trailing data decoder' });
    expect(error.code).toBe(code);
    expect(error.message).not.toMatch(/truncated|trailing|decoder/);
  }
});
