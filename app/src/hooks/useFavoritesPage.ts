import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { User } from '@/types';
import { fetchFavorites } from '@/lib/social';
import {
  ensureFavoritesCacheUser,
  getCachedFavorites,
  setCachedFavorites,
} from '@/lib/favoritesCache';

export function useFavoritesPage(userId: string | undefined) {
  const [users, setUsers] = useState<User[]>(() => getCachedFavorites()?.users ?? []);
  const [count, setCount] = useState(() => getCachedFavorites()?.count ?? 0);
  const [loading, setLoading] = useState(() => !getCachedFavorites());

  const load = useCallback(async (background = false) => {
    if (!background && !getCachedFavorites()) setLoading(true);
    try {
      const data = await fetchFavorites();
      setCachedFavorites(data);
      setUsers(data.users);
      setCount(data.count);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not load favorites');
      if (!getCachedFavorites()) setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    ensureFavoritesCacheUser(userId);
    const cached = getCachedFavorites();
    if (cached) {
      setUsers(cached.users);
      setCount(cached.count);
      setLoading(false);
      void load(true);
    } else {
      void load(false);
    }
  }, [userId, load]);

  return {
    users,
    count,
    showInitialLoading: loading && users.length === 0,
    refresh: load,
  };
}
