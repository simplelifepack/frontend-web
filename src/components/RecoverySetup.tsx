import { useState } from 'react';
import Card from './Card';
import GoogleSignInButton from './GoogleSignInButton';
import { T } from '@/constants/theme';
import { generateRecoveryKey, recoveryDocument, recoveryProof } from '@/lib/recovery-key';
import { recoveryApi, type RecoveryStatus } from '@/lib/recovery-api';

export default function RecoverySetup({ status, onSaved, onCancel }: { status: RecoveryStatus; onSaved: (status: RecoveryStatus) => void; onCancel?: () => void }) {
  const [key, setKey] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [password, setPassword] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'email' | 'download'>('download');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const button = { borderRadius: 8, padding: '10px 14px', background: T.gold, color: T.navy, cursor: 'pointer', margin: 4 };
  async function save(method: 'email' | 'download', credential?: string) {
    if (!key || !acknowledged || busy) return;
    setBusy(true); setError('');
    try {
      const proof = await recoveryProof(key);
      const identity = credential ? { credential } : { password };
      const result = method === 'email'
        ? await recoveryApi.email({ proof, expectedVersion: status.version, acknowledged: true, recoveryDocument: recoveryDocument(key), ...identity })
        : await recoveryApi.save({ proof, expectedVersion: status.version, acknowledged: true, ...identity });
      if (method === 'download') download();
      setKey(''); setPassword(''); onSaved(result);
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Unable to save recovery key.'); }
    finally { setBusy(false); setPassword(''); }
  }
  function download() {
    const url = URL.createObjectURL(new Blob([recoveryDocument(key)], { type: 'text/plain' }));
    const link = document.createElement('a'); link.href = url; link.download = 'Readiness-Recovery-Key.txt'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <Card style={{ maxWidth: 760, margin: '32px auto', color: T.text }}>
    <h1 style={{ color: T.white }}>{status.configured ? 'Replace recovery key' : 'Save your recovery key'}</h1>
    <p>Your recovery key is a single-use backup for account recovery. It restores access to your stored vault by letting you reset your account password.</p>
    <p>Keep it separate from your devices. Anyone with this key and your email can recover your account. Normal email recovery is also available.</p>
    {status.configured && <p>Your current key stays valid until you save and confirm its replacement below.</p>}
    {!key ? <button style={button} disabled={busy} onClick={() => { setBusy(true); void generateRecoveryKey().then(setKey).catch(() => setError('Secure key generation is unavailable. Use HTTPS and try again.')).finally(() => setBusy(false)); }}>Generate recovery key</button> : <>
      <pre aria-label="Recovery key" style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', padding: 16, background: T.navy }}>{key}</pre>
      <label style={{ display: 'block', margin: '20px 0' }}><input type="checkbox" checked={acknowledged} onChange={event => setAcknowledged(event.target.checked)} /> I have saved this recovery key somewhere safe and separate from this device.</label>
      <p>Confirm your identity to activate this key.</p>
      {status.passwordAvailable && <form onSubmit={event => { event.preventDefault(); void save(deliveryMethod); }}><input aria-label="Current account password" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required /><button type="submit" style={button} disabled={!acknowledged || busy || !password} onClick={() => setDeliveryMethod('email')}>Send to email</button><button type="submit" style={button} disabled={!acknowledged || busy || !password} onClick={() => setDeliveryMethod('download')}>Download</button></form>}
      {status.googleAvailable && <div><button type="button" style={button} disabled={!acknowledged || busy} onClick={() => setDeliveryMethod('email')}>Send to email</button><button type="button" style={button} disabled={!acknowledged || busy} onClick={() => setDeliveryMethod('download')}>Download</button><GoogleSignInButton disabled={!acknowledged || busy} onCredential={credential => void save(deliveryMethod, credential)} onError={setError} /></div>}
    </>}
    {error && <p role="alert">{error}</p>}
    {onCancel && <button style={button} disabled={busy} onClick={onCancel}>Cancel</button>}
  </Card>;
}
