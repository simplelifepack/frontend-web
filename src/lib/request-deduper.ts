type Entry = {
  expiresAt: number;
  promise: Promise<unknown>;
};

const requests = new Map<string, Entry>();

export function dedupeRequest<T>(
  key: string,
  intervalMs: number,
  load: () => Promise<T>,
) {
  const current = requests.get(key);
  if (current && current.expiresAt > Date.now()) {
    return current.promise as Promise<T>;
  }

  const promise = load();
  const entry = { expiresAt: Date.now() + intervalMs, promise };
  requests.set(key, entry);

  void promise.catch(() => {
    if (requests.get(key) === entry) requests.delete(key);
  });
  globalThis.setTimeout(() => {
    if (requests.get(key) === entry) requests.delete(key);
  }, intervalMs);

  return promise;
}
