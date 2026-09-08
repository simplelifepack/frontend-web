import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import AppShell from './AppShell';

vi.mock('@/store/hooks', () => ({
  useAppDispatch: () => vi.fn(),
  useAppSelector: (select: (state: unknown) => unknown) => select({ auth: { user: { id: 'user', name: 'Member' } } }),
}));

describe('authenticated navigation without billing state', () => {
  it('offers direct Health, Wealth and Trust navigation', () => {
    render(<MemoryRouter><AppShell><div>Private product</div></AppShell></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'Health' }).getAttribute('href')).toBe('/health');
    expect(screen.getByRole('link', { name: 'Wealth' }).getAttribute('href')).toBe('/wealth');
    expect(screen.getByRole('link', { name: /Trust/i }).getAttribute('href')).toBe('/trust');
    expect(screen.queryByText(/upgrade|premium|paid plan/i)).toBeNull();
  });
});
