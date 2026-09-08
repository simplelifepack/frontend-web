import { useEffect, useState, type ReactNode } from 'react';
import RecoverySetup from './RecoverySetup';
import { recoveryApi, type RecoveryStatus } from '@/lib/recovery-api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { recoverySetupComplete as markRecoverySetupComplete } from '@/store/slices/authSlice';
export default function RecoveryGate({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const recoverySetupComplete = useAppSelector(state => state.auth.recoverySetupComplete);
  const [status, setStatus] = useState<RecoveryStatus | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (recoverySetupComplete !== false) return;
    let active = true;
    void recoveryApi.status().then(value => { if (active) { setStatus(value); setError(false); } }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [attempt, recoverySetupComplete]);
  if (recoverySetupComplete) return children;
  if (error) return <div role="alert">Unable to load account recovery settings. <button onClick={() => setAttempt(value => value + 1)}>Retry</button></div>;
  if (!status) return <p>Loading recovery settings…</p>;
  if (!status.configured) return <RecoverySetup status={status} onSaved={value => { setStatus(value); dispatch(markRecoverySetupComplete()); }} />;
  return children;
}
