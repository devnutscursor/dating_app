import type { FavoritesResponse } from '@/lib/social';

let cacheUserId: string | null = null;
let cache: FavoritesResponse | undefined;

export function ensureFavoritesCacheUser(userId: string): void {
  if (cacheUserId === userId) return;
  clearFavoritesCache();
  cacheUserId = userId;
}

export function clearFavoritesCache(): void {
  cacheUserId = null;
  cache = undefined;
}

export function invalidateFavoritesCache(): void {
  cache = undefined;
}

export function getCachedFavorites(): FavoritesResponse | undefined {
  return cache;
}

export function setCachedFavorites(data: FavoritesResponse): void {
  cache = data;
}
