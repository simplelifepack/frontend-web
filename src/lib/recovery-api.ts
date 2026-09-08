import { request } from './http-client';
export type RecoveryStatus = { configured: boolean; version: number; createdAt: string | null; passwordAvailable: boolean; googleAvailable: boolean };
export const recoveryApi = {
  status: () => request<RecoveryStatus>('/auth/recovery', { requiresAuth: true, dedupeMs: 0 }),
  save: (body: { proof: string; expectedVersion: number; acknowledged: true; password?: string; credential?: string }) => request<RecoveryStatus>('/auth/recovery', { method: 'POST', requiresAuth: true, retryOnUnauthorized: false, body }),
  redeem: (body: { email: string; proof: string; password: string }) => request<{ message: string }>('/auth/recover', { method: 'POST', body }),
};
