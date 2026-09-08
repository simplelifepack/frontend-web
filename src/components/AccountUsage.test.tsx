import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { toast } from 'sonner';
import AccountUsage from './AccountUsage';
import CustomPackButton from './CustomPackButton';
import { apiError } from '@/lib/http-client';
import type { AccountUsage as Usage } from '@/lib/api.types';
vi.mock('sonner', () => ({ toast: { info: vi.fn() } }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
const usage: Usage = { accountTier: 'free', storage: { usedBytes: 31.4 * 1024 * 1024, limitBytes: 50 * 1024 * 1024, unlimited: false }, aiUsage: { used: 2, limit: 3, remaining: 1, unlimited: false, period: '2026-09' } };
describe('account usage', () => {
  it('shows storage as a proportional bar with usage available on focus', async () => {
    render(<AccountUsage usage={usage} only="storage" />);
    const bar = screen.getByRole('progressbar');
    expect(Number(bar.getAttribute('aria-valuenow'))).toBeCloseTo(62.8);
    expect(screen.queryByText(/31.4 MB used/)).toBeNull();
    fireEvent.focus(bar);
    expect((await screen.findByRole('tooltip')).textContent).toBe('31.4 MB used of 50 MB · Upgrade to use unlimited storage');
    expect(toast.info).not.toHaveBeenCalled();
  });
  it('shows action usage only as a short toast, without repeating on unchanged renders', () => {
    const view = render(<AccountUsage usage={usage} only="ai" />);
    expect(screen.queryByText('2 of 3 actions used this month')).toBeNull();
    expect(toast.info).toHaveBeenCalledWith('2 of 3 actions used this month', { id: 'ai-usage', duration: 3500 });
    view.rerender(<AccountUsage usage={{ ...usage }} only="ai" />);
    expect(toast.info).toHaveBeenCalledTimes(1);
  });
  it('paid storage has no finite cap or upgrade tooltip', () => {
    render(<AccountUsage usage={{ accountTier: 'paid', storage: { ...usage.storage, limitBytes: null, unlimited: true }, aiUsage: { ...usage.aiUsage, used: null, limit: null, remaining: null, unlimited: true } }} />);
    expect(screen.getByRole('progressbar').getAttribute('aria-valuetext')).toBe('31.4 MB used · Unlimited storage');
    expect(screen.getByRole('progressbar').hasAttribute('aria-valuenow')).toBe(false);
    expect(toast.info).not.toHaveBeenCalled();
  });
  it('disables exhausted custom creation and exposes upgrade hint on focus', async () => {
    const click = vi.fn();
    render(<CustomPackButton quotaReached onClick={click}>Create a custom pack</CustomPackButton>);
    const button = screen.getByRole('button', { name: 'Create a custom pack' }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    fireEvent.click(button);
    expect(click).not.toHaveBeenCalled();
    fireEvent.focus(screen.getByLabelText('Create a custom pack unavailable. Upgrade to use.'));
    expect((await screen.findByRole('tooltip')).textContent).toBe('Upgrade to use');
  });
  it('keeps creation enabled when the quota is available or paid', () => {
    const click = vi.fn();
    render(<CustomPackButton quotaReached={false} onClick={click}>Create a custom pack</CustomPackButton>);
    fireEvent.click(screen.getByRole('button'));
    expect(click).toHaveBeenCalledTimes(1);
  });
  it('maps stable quota codes to safe UI messages', () => {
    expect(apiError({ code: 'STORAGE_LIMIT_EXCEEDED', message: 'raw server error' }).message).toContain('Cloud storage full');
    expect(apiError({ code: 'AI_MONTHLY_LIMIT_EXCEEDED', message: 'raw server error' }).message).toContain('3 AI actions');
  });
});
