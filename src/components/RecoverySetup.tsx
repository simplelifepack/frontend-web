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
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const button = { borderRadius: 8, padding: '10px 14px', background: T.gold, color: T.navy, cursor: 'pointer', margin: 4 };
  async function save(credential?: string) {
    if (!key || !acknowledged || busy) return;
    setBusy(true); setError('');
    try {
      const result = await recoveryApi.save({ proof: await recoveryProof(key), expectedVersion: status.version, acknowledged: true, ...(credential ? { credential } : { password }) });
      setKey(''); setPassword(''); onSaved(result);
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Unable to save recovery key.'); }
    finally { setBusy(false); setPassword(''); }
  }
  function download() {
    const url = URL.createObjectURL(new Blob([recoveryDocument(key)], { type: 'text/plain' }));
    const link = document.createElement('a'); link.href = url; link.download = 'Readiness-Recovery-Key.txt'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function print() {
    const popup = window.open('', '_blank', 'width=760,height=600');
    if (!popup) { setError('Allow popups to print your recovery key.'); return; }
    popup.opener = null;
    popup.document.title = 'Readiness Recovery Key';
    const content = popup.document.createElement('pre');
    content.style.cssText = 'white-space:pre-wrap;overflow-wrap:anywhere;font:16px monospace;padding:32px';
    content.textContent = recoveryDocument(key); popup.document.body.append(content);
    popup.onafterprint = () => popup.close(); popup.focus(); popup.print();
  }
  return <Card style={{ maxWidth: 760, margin: '32px auto', color: T.text }}>
    <h1 style={{ color: T.white }}>{status.configured ? 'Replace recovery key' : 'Save your recovery key'}</h1>
    <p>Your recovery key is a single-use backup for account recovery. It restores access to your stored vault by letting you reset your account password.</p>
    <p>Keep it separate from your devices. Anyone with this key and your email can recover your account. Normal email recovery is also available.</p>
    {status.configured && <p>Your current key stays valid until you save and confirm its replacement below.</p>}
    {!key ? <button style={button} disabled={busy} onClick={() => { setBusy(true); void generateRecoveryKey().then(setKey).catch(() => setError('Secure key generation is unavailable. Use HTTPS and try again.')).finally(() => setBusy(false)); }}>Generate recovery key</button> : <>
      <pre aria-label="Recovery key" style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', padding: 16, background: T.navy }}>{key}</pre>
      <div><button style={button} onClick={() => void navigator.clipboard.writeText(key).catch(() => setError('Copy failed. Download or print your key instead.'))}>Copy</button><button style={button} onClick={download}>Download</button><button style={button} onClick={print}>Print</button></div>
      <label style={{ display: 'block', margin: '20px 0' }}><input type="checkbox" checked={acknowledged} onChange={event => setAcknowledged(event.target.checked)} /> I have saved this recovery key somewhere safe and separate from this device.</label>
      <p>Confirm your identity to activate this key.</p>
      {status.passwordAvailable && <form onSubmit={event => { event.preventDefault(); void save(); }}><input aria-label="Current account password" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required /><button style={button} disabled={!acknowledged || busy || !password}>Save and continue</button></form>}
      {status.googleAvailable && <GoogleSignInButton disabled={!acknowledged || busy} onCredential={credential => void save(credential)} onError={setError} />}
    </>}
    {error && <p role="alert">{error}</p>}
    {onCancel && <button style={button} disabled={busy} onClick={onCancel}>Cancel</button>}
  </Card>;
}
