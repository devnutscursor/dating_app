import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CACHE } from '@/lib/cacheKeys';
import { ensurePageCacheUser, getCached, setCached } from '@/lib/pageCache';
import { fetchActivities } from '@/lib/activities';
import { fetchCoinPacks } from '@/lib/payments';
import { fetchDiscoverUsers, fetchOnlineUsers } from '@/lib/social';

/** Warm common member APIs in the background after login. */
export default function MemberDataPrefetch() {
  const { user } = useAuth();

  useEffect(() => {
    const userId = user?.id;
    if (!userId) return;
    ensurePageCacheUser(userId);

    const jobs: Promise<void>[] = [];

    if (!getCached(CACHE.online)) {
      jobs.push(
        fetchOnlineUsers().then((list) => {
          setCached(CACHE.online, list);
        })
      );
    }

    if (!getCached(CACHE.activities)) {
      jobs.push(
        fetchActivities().then((list) => {
          setCached(CACHE.activities, list);
        })
      );
    }

    if (!getCached(CACHE.defaultDiscover())) {
      jobs.push(
        fetchDiscoverUsers().then((list) => {
          setCached(CACHE.defaultDiscover(), list);
        })
      );
    }

    if (!getCached(CACHE.coinPacks)) {
      jobs.push(
        fetchCoinPacks().then((list) => {
          setCached(CACHE.coinPacks, list);
        })
      );
    }

    void Promise.allSettled(jobs);
  }, [user?.id]);

  return null;
}
