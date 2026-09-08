import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import RecoverySetup from './RecoverySetup';
import { recoveryApi } from '@/lib/recovery-api';
vi.mock('@/lib/recovery-api', () => ({ recoveryApi: { save: vi.fn() } }));
vi.mock('./GoogleSignInButton', () => ({ default: () => null }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
const status = { configured: false, version: 0, createdAt: null, passwordAvailable: true, googleAvailable: false };
describe('mandatory recovery setup', () => {
  it('requires acknowledgement and confirmation before activating a generated key', async () => {
    const saved = vi.fn(); vi.mocked(recoveryApi.save).mockResolvedValue({ ...status, configured: true, version: 1 });
    render(<RecoverySetup status={status} onSaved={saved} />);
    fireEvent.click(screen.getByText('Generate recovery key'));
    await screen.findByLabelText('Recovery key');
    fireEvent.change(screen.getByLabelText('Current account password'), { target: { value: 'a-password' } });
    expect((screen.getByText('Save and continue') as HTMLButtonElement).disabled).toBe(true);
    expect(recoveryApi.save).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByText('Save and continue'));
    await waitFor(() => expect(saved).toHaveBeenCalled());
    const body = vi.mocked(recoveryApi.save).mock.calls[0][0];
    expect(body.proof).toMatch(/^[0-9a-f]{64}$/); expect(body.acknowledged).toBe(true); expect(body).not.toHaveProperty('key');
    expect(screen.queryByLabelText('Recovery key')).toBeNull();
  });
});
