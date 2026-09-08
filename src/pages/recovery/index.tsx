import { useState } from 'react';
import { Link } from 'react-router-dom';
import { recoveryProof } from '@/lib/recovery-key';
import { recoveryApi } from '@/lib/recovery-api';
export default function RecoveryPage() {
  const [email, setEmail] = useState(''); const [key, setKey] = useState(''); const [password, setPassword] = useState('');
  const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false); const [done, setDone] = useState(false);
  return <div className="mx-auto max-w-md text-slate-200"><h1 className="text-2xl">Recover your Readiness account</h1><p>Use your recovery key to set a new account password. This restores access to your stored vault and signs out existing sessions.</p>
    {!done && <form className="mt-6 space-y-4" onSubmit={event => { event.preventDefault(); setBusy(true); setMessage(''); void recoveryProof(key).then(proof => recoveryApi.redeem({ email, proof, password })).then(result => { setDone(true); setMessage(result.message); setKey(''); }).catch(error => setMessage(error instanceof Error ? error.message : 'Unable to recover account.')).finally(() => { setBusy(false); setPassword(''); }); }}>
      <label className="block">Email<input className="block w-full p-3" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} /></label>
      <label className="block">Recovery key<textarea className="block w-full p-3" autoComplete="off" spellCheck={false} required value={key} onChange={event => setKey(event.target.value)} /></label>
      <label className="block">New account password<input className="block w-full p-3" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={event => setPassword(event.target.value)} /></label>
      <button className="rounded bg-amber-300 px-4 py-3 text-slate-950" disabled={busy}>{busy ? 'Recovering…' : 'Recover account'}</button>
    </form>}
    {message && <p role="status">{message}</p>}<Link to="/login">Go to login</Link>
  </div>;
}
