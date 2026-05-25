let cacheUserId: string | null = null;
const store = new Map<string, unknown>();

export function ensurePageCacheUser(userId: string): void {
  if (cacheUserId === userId) return;
  clearPageCache();
  cacheUserId = userId;
}

export function clearPageCache(): void {
  cacheUserId = null;
  store.clear();
}

export function getCached<T>(key: string): T | undefined {
  return store.get(key) as T | undefined;
}

export function setCached<T>(key: string, data: T): void {
  store.set(key, data);
}

export function invalidateCacheKey(key: string): void {
  store.delete(key);
}

export function invalidateCachePrefix(prefix: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}
