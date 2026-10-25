import { request } from "./http-client";
export type LockerDocument = { reference: string; name: string; type: string; issuer: string | null; issueDate: string | null; modifiedAt: string | null; available: boolean; reason: string | null };
export type LockerProgress = { reference: string; phase: string; documentId?: string; duplicate?: boolean; message?: string };
export type LockerSession = { id: string; status: string; expiresAt: string | null; progress: LockerProgress[] };
const base = "/api/integrations/digilocker";
const auth = { requiresAuth: true, dedupeMs: 0 };
export const digilocker = {
  status: () => request<{ configured: boolean; message: string | null }>(`${base}/status`, auth),
  start: () => request<LockerSession & { authorizationUrl: string }>(`${base}/sessions`, { ...auth, method: "POST", body: {} }),
  session: (id: string) => request<LockerSession>(`${base}/sessions/${encodeURIComponent(id)}/status`, auth),
  documents: (id: string) => request<{ documents: LockerDocument[]; session: LockerSession }>(`${base}/sessions/${encodeURIComponent(id)}/documents`, auth),
  cancel: (id: string) => request<LockerSession>(`${base}/sessions/${encodeURIComponent(id)}/cancel`, { ...auth, method: "POST" }),
  import: (id: string, references: string[]) => request<LockerSession>(`${base}/sessions/${encodeURIComponent(id)}/import`, {
    ...auth, method: "POST", body: { references, consent: true, consentVersion: "digilocker-copy-v1" },
  }),
};
