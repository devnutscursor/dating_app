import type { LikesResponse } from '@/lib/social';

export type LikesTab = 'received' | 'sent';

let cacheUserId: string | null = null;
const tabCache = new Map<LikesTab, LikesResponse>();

export function ensureLikesCacheUser(userId: string): void {
  if (cacheUserId === userId) return;
  clearLikesCache();
  cacheUserId = userId;
}

export function clearLikesCache(): void {
  cacheUserId = null;
  tabCache.clear();
}

export function invalidateLikesCache(): void {
  tabCache.clear();
}

export function getCachedLikes(tab: LikesTab): LikesResponse | undefined {
  return tabCache.get(tab);
}

export function setCachedLikes(tab: LikesTab, data: LikesResponse): void {
  tabCache.set(tab, data);
}
