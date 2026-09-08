import { describe, expect, it } from 'vitest';
import { generateRecoveryKey, normalizeRecoveryKey, recoveryDocument, recoveryProof } from './recovery-key';

describe('recovery keys', () => {
  it('generates distinct grouped 256-bit secrets with a checksum', async () => {
    const a = await generateRecoveryKey(); const b = await generateRecoveryKey();
    expect(a).toMatch(/^[0-9A-HJKMNP-TV-Z]{4}(?:-[0-9A-HJKMNP-TV-Z]{4}){13}$/);
    expect(a).not.toBe(b); expect(await recoveryProof(a)).toMatch(/^[0-9a-f]{64}$/);
    expect(await recoveryProof(a)).not.toBe(await recoveryProof(b));
  });
  it('normalizes whitespace, case and transcription ambiguities', async () => {
    expect(normalizeRecoveryKey(' oi-l ')).toBe('011');
    const key = await generateRecoveryKey();
    expect(await recoveryProof(key.toLowerCase().replace(/-/g, ' ').replace(/0/g, 'O').replace(/1/g, 'l'))).toBe(await recoveryProof(key));
  });
  it('rejects malformed and mistyped keys before returning a credential', async () => {
    const key = await generateRecoveryKey();
    await expect(recoveryProof('bad')).rejects.toThrow("doesn't appear to be valid");
    await expect(recoveryProof(key.slice(0,-1)+(key.endsWith('0')?'1':'0'))).rejects.toThrow("doesn't appear to be valid");
    await expect(recoveryProof('U'.repeat(56))).rejects.toThrow();
  });
  it('explains account recovery without zero-knowledge claims or personal data', () => {
    const text = recoveryDocument('test-key', new Date('2026-09-06T00:00:00Z'));
    expect(text).toContain('2026-09-06'); expect(text).toContain('single-use'); expect(text).not.toMatch(/zero-knowledge|cannot decrypt|support cannot/);
  });
});
