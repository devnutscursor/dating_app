import { useCallback } from 'react';
import type { User } from '@/types';
import { CACHE } from '@/lib/cacheKeys';
import { invalidateCacheKey } from '@/lib/pageCache';
import { fetchPublicUser } from '@/lib/social';
import { useCachedQuery } from '@/hooks/useCachedQuery';

export function usePublicProfile(userId: string | undefined, viewerId: string | undefined) {
  const fetcher = useCallback(() => {
    if (!userId) return Promise.reject(new Error('Missing profile'));
    return fetchPublicUser(userId);
  }, [userId]);

  const query = useCachedQuery<User>({
    cacheKey: userId ? CACHE.profile(userId) : 'profile:missing',
    fetcher,
    userId: viewerId,
    enabled: Boolean(userId),
  });

  const invalidate = useCallback(() => {
    if (userId) invalidateCacheKey(CACHE.profile(userId));
  }, [userId]);

  return { ...query, invalidate };
}
