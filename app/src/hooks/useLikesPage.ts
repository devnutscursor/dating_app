import { useCallback, useEffect, useRef, useState } from 'react';
import type { User } from '@/types';
import { fetchLikes, type LikesResponse } from '@/lib/social';
import {
  ensureLikesCacheUser,
  getCachedLikes,
  setCachedLikes,
  type LikesTab,
} from '@/lib/likesCache';
import { toast } from 'sonner';

export function useLikesPage(userId: string | undefined) {
  const [activeTab, setActiveTab] = useState<LikesTab>('received');
  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;

  const [users, setUsers] = useState<User[]>(() => getCachedLikes('received')?.users ?? []);
  const [receivedCount, setReceivedCount] = useState(() => getCachedLikes('received')?.receivedCount ?? 0);
  const [sentCount, setSentCount] = useState(
    () => getCachedLikes('sent')?.sentCount ?? getCachedLikes('received')?.sentCount ?? 0
  );
  const [loading, setLoading] = useState(() => !getCachedLikes('received'));

  useEffect(() => {
    if (userId) ensureLikesCacheUser(userId);
  }, [userId]);

  const applyResponse = useCallback((data: LikesResponse) => {
    setReceivedCount(data.receivedCount);
    setSentCount(data.sentCount);
  }, []);

  const loadTab = useCallback(async (tab: LikesTab, background = false) => {
    if (!background && tab === activeTabRef.current && !getCachedLikes(tab)) {
      setLoading(true);
    }
    try {
      const data = await fetchLikes(tab);
      setCachedLikes(tab, data);
      applyResponse(data);
      if (tab === activeTabRef.current) {
        setUsers(data.users);
      }
    } catch (e) {
      if (tab === activeTabRef.current) {
        toast.error(e instanceof Error ? e.message : 'Could not load likes');
        if (!getCachedLikes(tab)) setUsers([]);
      }
    } finally {
      if (tab === activeTabRef.current) setLoading(false);
    }
  }, [applyResponse]);

  useEffect(() => {
    if (!userId) return;

    const cached = getCachedLikes(activeTab);
    if (cached) {
      setUsers(cached.users);
      applyResponse(cached);
      setLoading(false);
      void loadTab(activeTab, true);
    } else {
      setUsers([]);
      void loadTab(activeTab, false);
    }

    const otherTab: LikesTab = activeTab === 'received' ? 'sent' : 'received';
    if (!getCachedLikes(otherTab)) {
      void loadTab(otherTab, true);
    }
  }, [activeTab, userId, loadTab, applyResponse]);

  const showInitialLoading = loading && users.length === 0;

  return {
    activeTab,
    setActiveTab,
    users,
    receivedCount,
    sentCount,
    showInitialLoading,
  };
}
