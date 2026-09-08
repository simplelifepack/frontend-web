import { useEffect, useState } from 'react';
import RecoverySetup from '@/components/RecoverySetup';
import { recoveryApi, type RecoveryStatus } from '@/lib/recovery-api';
export default function RecoverySettings() {
  const [status, setStatus] = useState<RecoveryStatus | null>(null); const [error, setError] = useState(false); const [saved, setSaved] = useState(false);
  useEffect(() => { void recoveryApi.status().then(setStatus).catch(() => setError(true)); }, []);
  if (error) return <p role="alert">Unable to load recovery settings. Reload to try again.</p>;
  if (!status) return <p>Loading recovery settings…</p>;
  if (saved) return <p>Your new recovery key is active. Your previous key can no longer recover your account.</p>;
  return <RecoverySetup status={status} onSaved={value => { setStatus(value); setSaved(true); }} />;
}
