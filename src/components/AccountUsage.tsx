import { useEffect } from 'react';
import { toast } from 'sonner';
import Card from './Card';
import { T } from '@/constants/theme';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import type { AccountUsage as Usage } from '@/lib/api.types';

export function storageText(storage: Usage['storage']) {
  const mb = (bytes: number) => (bytes / (1024 * 1024)).toLocaleString(undefined, { maximumFractionDigits: 1 });
  return storage.unlimited ? `${mb(storage.usedBytes)} MB used · Unlimited storage`
    : `${mb(storage.usedBytes)} MB used of ${mb(storage.limitBytes ?? 0)} MB · Upgrade to use unlimited storage`;
}
export function aiUsageText(usage: Usage['aiUsage']) {
  return usage.unlimited ? 'Unlimited AI actions' : `${usage.used} of ${usage.limit} actions used this month`;
}
export default function AccountUsage({ usage, only }: { usage: Usage; only?: 'storage' | 'ai' }) {
  const { used, limit, unlimited, period } = usage.aiUsage;
  useEffect(() => {
    if (only === 'storage' || unlimited) return;
    toast.info(`${used} of ${limit} actions used this month`, { id: 'ai-usage', duration: 3500 });
  }, [used, limit, unlimited, period, only]);
  if (only === 'ai') return null;
  return <Card style={{ marginBottom: 16 }}><section aria-label="Account usage">
    {!only && <h2 style={{ color: T.white, fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{usage.accountTier === 'paid' ? 'Paid' : 'Free'} account</h2>}
    <StorageUsage storage={usage.storage} />
  </section></Card>;
}

export function StorageUsage({ storage, circular = false }: { storage: Usage['storage']; circular?: boolean }) {
  const percentage = storage.limitBytes ? Math.min(100, Math.max(0, storage.usedBytes / storage.limitBytes * 100)) : 0;
  const description = storageText(storage);
  return <TooltipProvider delayDuration={150}><Tooltip>
    <TooltipTrigger asChild>
      <div role="progressbar" tabIndex={0} aria-label="Cloud storage" aria-valuemin={0}
        aria-valuemax={storage.unlimited ? undefined : 100} aria-valuenow={storage.unlimited ? undefined : percentage}
        aria-valuetext={description} style={circular
          ? { width: 36, height: 36, flexShrink: 0, display: 'grid', placeItems: 'center', cursor: 'help' }
          : { paddingBlock: 6, cursor: 'help' }}>
        {circular ? <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
          <circle cx="16" cy="16" r="13" fill="none" stroke={T.border} strokeWidth="3" />
          <circle cx="16" cy="16" r="13" fill="none" stroke={percentage >= 100 ? T.coral : T.gold}
            strokeWidth="3" pathLength="100" strokeDasharray={`${storage.unlimited ? 100 : percentage} 100`}
            transform="rotate(-90 16 16)" opacity={storage.unlimited ? 0.4 : 1} />
        </svg> : <div style={{ height: 8, borderRadius: 8, background: T.border, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: storage.unlimited ? '100%' : `${percentage}%`, background: percentage >= 100 ? T.coral : T.gold, opacity: storage.unlimited ? 0.4 : 1, borderRadius: 8 }} />
        </div>}
      </div>
    </TooltipTrigger>
    <TooltipContent>{description}</TooltipContent>
  </Tooltip></TooltipProvider>;
}
