import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import AccountUsage from '@/components/AccountUsage';
import SectionHead from '@/components/SectionHead';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { refreshUsage } from '@/store/slices/usageSlice';
export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const { data, error } = useAppSelector(state => state.usage);
  useEffect(() => { void dispatch(refreshUsage()); }, [dispatch]);
  return <div className="lp-route">
    <SectionHead title="Settings" sub="Your account and cloud usage" action={null} />
    {error ? <p role="alert">Unable to refresh usage. <button onClick={() => void dispatch(refreshUsage())}>Retry</button></p> : null}
    {data ? <AccountUsage usage={data} /> : !error && <p>Loading usage…</p>}
    <Link to="/settings/recovery">Recovery settings</Link>
  </div>;
}
