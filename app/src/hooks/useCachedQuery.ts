import { useCallback, useEffect, useRef, useState } from 'react';
import { ensurePageCacheUser, getCached, setCached } from '@/lib/pageCache';

type UseCachedQueryOptions<T> = {
  cacheKey: string;
  fetcher: () => Promise<T>;
  userId?: string;
  enabled?: boolean;
};

export function useCachedQuery<T>({
  cacheKey,
  fetcher,
  userId,
  enabled = true,
}: UseCachedQueryOptions<T>) {
  const initial = enabled ? getCached<T>(cacheKey) : undefined;
  const [data, setData] = useState<T | undefined>(initial);
  const [loading, setLoading] = useState(Boolean(enabled && initial === undefined));
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    if (userId) ensurePageCacheUser(userId);
  }, [userId]);

  const runFetch = useCallback(
    async (background: boolean) => {
      if (!enabled) return;
      const hit = getCached<T>(cacheKey);
      if (!background && hit === undefined) setLoading(true);
      try {
        const fresh = await fetcherRef.current();
        setCached(cacheKey, fresh);
        setData(fresh);
      } catch {
        if (hit === undefined) setData(undefined);
      } finally {
        setLoading(false);
      }
    },
    [cacheKey, enabled]
  );

  useEffect(() => {
    if (!enabled) return;
    const hit = getCached<T>(cacheKey);
    if (hit !== undefined) {
      setData(hit);
      setLoading(false);
      void runFetch(true);
    } else {
      void runFetch(false);
    }
  }, [cacheKey, enabled, runFetch]);

  const refresh = useCallback((background = true) => runFetch(background), [runFetch]);

  const showInitialLoading = loading && data === undefined;

  return { data, setData, loading, showInitialLoading, refresh };
}
