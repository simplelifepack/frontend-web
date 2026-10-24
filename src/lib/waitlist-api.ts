import { API_URL } from "./http-client";

async function publicRequest<T>(path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_URL}/api/waitlist/${path}`, {
    method: body ? "POST" : "GET",
    credentials: "omit",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message ?? "Please try again later.");
  return result;
}
export type WaitlistChallenge = { token: string; difficulty: number };
export const waitlistApi = {
  challenge: (signal?: AbortSignal) => publicRequest<WaitlistChallenge>("challenge", undefined, signal),
  register: (body: { email: string; website: string; challenge: string; solution: string }) => publicRequest<{ message: string }>("register", body),
  unsubscribe: (token: string) => publicRequest<{ message: string }>("unsubscribe", { token }),
};
// A small proof of work adds cost to automated submissions; the server also
// requires a short-lived signed challenge and database-backed rate limits.
export async function solveChallenge(challenge: WaitlistChallenge, signal: AbortSignal) {
  const encoder = new TextEncoder();
  for (let nonce = 0; nonce < 1_000_000; nonce++) {
    if (signal.aborted) throw new DOMException("Cancelled", "AbortError");
    const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(`${challenge.token}:${nonce}`)));
    if (hash[0] === 0 && hash[1] < 16) return String(nonce);
  }
  throw new Error("Please close this dialog and try again.");
}
