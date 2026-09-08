import { request } from './http-client';
export type RecoveryStatus = { configured: boolean; version: number; createdAt: string | null; recoverySetupComplete: boolean; passwordAvailable: boolean; googleAvailable: boolean };

let statusInFlight: Promise<RecoveryStatus> | null = null;
let statusCache: RecoveryStatus | null = null;

function getRecoveryStatus() {
  if (statusCache) return Promise.resolve(statusCache);
  statusInFlight ??= request<RecoveryStatus>('/auth/recovery', { requiresAuth: true })
    .then((status) => {
      statusCache = status;
      return status;
    })
    .finally(() => {
      statusInFlight = null;
    });
  return statusInFlight;
}

async function saveRecoveryStatus(body: { proof: string; expectedVersion: number; acknowledged: true; password?: string; credential?: string }) {
  const status = await request<RecoveryStatus>('/auth/recovery', { method: 'POST', requiresAuth: true, retryOnUnauthorized: false, body });
  statusCache = status;
  return status;
}

async function emailRecoveryStatus(body: { proof: string; expectedVersion: number; acknowledged: true; recoveryDocument: string; password?: string; credential?: string }) {
  const status = await request<RecoveryStatus>('/auth/recovery/email', { method: 'POST', requiresAuth: true, retryOnUnauthorized: false, body });
  statusCache = status;
  return status;
}

export const recoveryApi = {
  status: getRecoveryStatus,
  save: saveRecoveryStatus,
  email: emailRecoveryStatus,
  redeem: (body: { email: string; proof: string; password: string }) => request<{ message: string }>('/auth/recover', { method: 'POST', body }),
};
