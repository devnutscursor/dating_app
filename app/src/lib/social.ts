import type { SearchFilters, User } from '@/types';
import { apiGet, apiPost } from '@/lib/api';
import { invalidateFavoritesCache } from '@/lib/favoritesCache';
import { invalidateLikesCache } from '@/lib/likesCache';
import { visibleGalleryPhotoUrls } from '@/lib/profileMedia';

const PHOTO_FALLBACK = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400';

/** Public profile image URLs for gallery (never empty). Excludes private / locked media. */
/** Same photo set as view-profile (public + unlocked), so card count matches profile. */
export function userGalleryPhotos(user: User, fallback = PHOTO_FALLBACK): string[] {
  const urls = visibleGalleryPhotoUrls(user);
  return urls.length ? urls : [fallback];
}

export async function fetchDiscoverUsers(
  filters?: SearchFilters & { userId?: string }
): Promise<User[]> {
  const params = new URLSearchParams();
  if (filters?.userId?.trim()) params.set('userId', filters.userId.trim());
  if (filters?.datingGoal) params.set('datingGoal', filters.datingGoal);
  if (filters?.country) params.set('country', filters.country);
  if (filters?.minAge != null) params.set('minAge', String(filters.minAge));
  if (filters?.maxAge != null) params.set('maxAge', String(filters.maxAge));
  if (filters?.isOnline) params.set('isOnline', 'true');
  const qs = params.toString();
  const data = await apiGet<{ users: User[] }>(`/users/discover${qs ? `?${qs}` : ''}`);
  return data.users ?? [];
}

export async function fetchOnlineUsers(): Promise<User[]> {
  const data = await apiGet<{ users: User[] }>('/users/online');
  return data.users ?? [];
}

export type LikesResponse = {
  users: User[];
  receivedCount: number;
  sentCount: number;
};

export async function fetchLikes(tab: 'received' | 'sent'): Promise<LikesResponse> {
  return apiGet<LikesResponse>(`/users/likes?tab=${tab}`);
}

export type LikeToggleResult = { ok: boolean; liked: boolean };

/** Like or unlike (toggle). Liked profiles stay on Discover. */
export async function sendLike(userId: string): Promise<LikeToggleResult> {
  const result = await apiPost<LikeToggleResult>('/users/likes', { userId });
  invalidateLikesCache();
  return result;
}

export type FavoritesResponse = {
  users: User[];
  count: number;
};

export async function fetchFavorites(): Promise<FavoritesResponse> {
  return apiGet<FavoritesResponse>('/users/favorites');
}

export type FavoriteToggleResult = { ok: boolean; favorited: boolean };

/** Add or remove from Favorites (toggle). */
export async function toggleFavorite(userId: string): Promise<FavoriteToggleResult> {
  const result = await apiPost<FavoriteToggleResult>('/users/favorites', { userId });
  invalidateFavoritesCache();
  return result;
}

export async function fetchPublicUser(userId: string): Promise<User> {
  const data = await apiGet<{ user: User }>(`/users/${userId}`);
  return data.user;
}

export async function unlockMemberMedia(
  ownerUserId: string,
  body: { mediaKind: 'photo' | 'video'; mediaId: string }
): Promise<{ ok: boolean; coins: number; user: User; alreadyUnlocked?: boolean }> {
  return apiPost(`/users/${ownerUserId}/unlock-media`, body);
}
