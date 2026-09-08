const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const encoder = new TextEncoder();
const invalid = () => new Error("That recovery key doesn't appear to be valid. Check the characters and try again.");

async function digest(domain: string, bytes: Uint8Array) {
  const prefix = encoder.encode(domain);
  const input = new Uint8Array(prefix.length + bytes.length);
  input.set(prefix); input.set(bytes, prefix.length);
  try { return new Uint8Array(await crypto.subtle.digest('SHA-256', input)); }
  finally { input.fill(0); }
}
function encode(bytes: Uint8Array) {
  let bits = 0, value = 0, result = '';
  for (const byte of bytes) {
    value = (value << 8) | byte; bits += 8;
    while (bits >= 5) { bits -= 5; result += ALPHABET[(value >>> bits) & 31]; }
  }
  return result;
}
export function normalizeRecoveryKey(input: string) {
  return input.toUpperCase().replace(/[\s-]/g, '').replace(/O/g, '0').replace(/[IL]/g, '1');
}
async function decode(input: string) {
  const normalized = normalizeRecoveryKey(input);
  if (normalized.length !== 56 || !/^[0-9A-HJKMNP-TV-Z]+$/.test(normalized)) throw invalid();
  const bytes = new Uint8Array(35);
  let bits = 0, value = 0, index = 0;
  for (const character of normalized) {
    value = (value << 5) | ALPHABET.indexOf(character); bits += 5;
    if (bits >= 8) { bits -= 8; bytes[index++] = (value >>> bits) & 255; }
  }
  const checksum = await digest('readiness:recovery:checksum:v1:', bytes.subarray(0, 32));
  if (bytes[32] !== checksum[0] || bytes[33] !== checksum[1] || bytes[34] !== checksum[2]) { bytes.fill(0); throw invalid(); }
  return bytes;
}
export async function generateRecoveryKey() {
  const bytes = new Uint8Array(35);
  crypto.getRandomValues(bytes.subarray(0, 32)); // 256 bits of random entropy; checksum is additional.
  try {
    bytes.set((await digest('readiness:recovery:checksum:v1:', bytes.subarray(0, 32))).subarray(0, 3), 32);
    return encode(bytes).match(/.{4}/g)!.join('-');
  } finally { bytes.fill(0); }
}
export async function recoveryProof(key: string) {
  const bytes = await decode(key); // Reject transcription errors before any network request.
  try {
    const hash = await digest('readiness:account-recovery:proof:v1:', bytes.subarray(0, 32));
    return Array.from(hash, byte => byte.toString(16).padStart(2, '0')).join('');
  } finally { bytes.fill(0); }
}
export function recoveryDocument(key: string, date = new Date()) {
  return `Readiness Recovery Key\n\n${key}\n\nCreated: ${date.toISOString().slice(0, 10)}\n\nStore this somewhere safe and separate from your devices.\n\nThis key can reset your account password and restore access to your stored vault. Anyone with this key and your email can recover your account.\n\nIt is a single-use backup to normal account recovery. After using it, sign in and save a new key. Generating a replacement invalidates your previous key.\n\nReadiness encrypts stored vault data. Selected documents may be temporarily decrypted for document analysis, imports, and exports.\n`;
}
