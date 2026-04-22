import type { User } from '@/types';
import { apiGet, apiPost } from '@/lib/api';

const PHOTO_FALLBACK = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400';

/** Public profile image URLs for gallery (never empty). */
export function userGalleryPhotos(user: User, fallback = PHOTO_FALLBACK): string[] {
  const urls = [user.profilePicture, ...user.photos.map((p) => p.url)].filter((u): u is string => Boolean(u));
  return urls.length ? urls : [fallback];
}

export async function fetchDiscoverUsers(): Promise<User[]> {
  const data = await apiGet<{ users: User[] }>('/users/discover');
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

export async function sendLike(userId: string): Promise<{ ok: boolean; alreadyLiked?: boolean }> {
  return apiPost<{ ok: boolean; alreadyLiked?: boolean }>('/users/likes', { userId });
}

export async function fetchPublicUser(userId: string): Promise<User> {
  const data = await apiGet<{ user: User }>(`/users/${userId}`);
  return data.user;
}
