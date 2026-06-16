const inflight = new Map<string, Promise<unknown>>();

/** Coalesce concurrent identical API calls into one in-flight request. */
export function dedupeRequest<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const existing = inflight.get(key);
  if (existing) {
    return existing as Promise<T>;
  }

  const promise = fn().finally(() => {
    inflight.delete(key);
  });

  inflight.set(key, promise);
  return promise;
}

export function clearDedupeRequest(key: string): void {
  inflight.delete(key);
}

export function clearAllDedupeRequests(): void {
  inflight.clear();
}
