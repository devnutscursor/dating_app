import { useState, useEffect, useCallback, useRef } from 'react';
import type { Chat } from '@/types';
import { apiGet } from '@/lib/api';
import {
  ensureChatCacheUser,
  getCachedChat,
  getCachedThreads,
  getChatDraft,
  setCachedChat,
  setCachedThreads,
  setChatDraft,
} from '@/lib/chatCache';

export function useChatDetailLoader(chatId: string | undefined, userId: string | undefined) {
  const prevChatIdRef = useRef<string | undefined>(undefined);
  const messageRef = useRef('');

  const [threads, setThreadsState] = useState<Chat[]>(() => getCachedThreads() ?? []);
  const [chat, setChatState] = useState<Chat | null>(() =>
    chatId ? (getCachedChat(chatId) ?? null) : null
  );
  const [listLoading, setListLoading] = useState(() => !getCachedThreads());
  const [chatLoading, setChatLoading] = useState(() => Boolean(chatId && !getCachedChat(chatId)));
  const [accessError, setAccessError] = useState<string | null>(null);
  const [message, setMessage] = useState(() => (chatId ? getChatDraft(chatId) : ''));

  messageRef.current = message;

  useEffect(() => {
    if (userId) ensureChatCacheUser(userId);
  }, [userId]);

  const setThreads = useCallback((value: Chat[] | ((prev: Chat[]) => Chat[])) => {
    setThreadsState((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      setCachedThreads(next);
      return next;
    });
  }, []);

  const setChat = useCallback((value: Chat | null | ((prev: Chat | null) => Chat | null)) => {
    setChatState((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      if (next) setCachedChat(next);
      return next;
    });
  }, []);

  const refreshThreads = useCallback(async () => {
    try {
      const data = await apiGet<{ chats: Chat[] }>('/chats');
      setCachedThreads(data.chats);
      setThreadsState(data.chats);
    } catch {
      setCachedThreads([]);
      setThreadsState([]);
    }
  }, []);

  const applyChatResponse = useCallback(
    (next: Chat) => {
      setCachedChat(next);
      setChatState(next);
      void refreshThreads();
    },
    [refreshThreads]
  );

  useEffect(() => {
    if (!chatId) return;

    const prevId = prevChatIdRef.current;
    if (prevId && prevId !== chatId) {
      setChatDraft(prevId, messageRef.current);
    }
    prevChatIdRef.current = chatId;

    const cachedThreads = getCachedThreads();
    const cachedChat = getCachedChat(chatId);
    const hadCache = Boolean(cachedChat);

    if (cachedThreads) {
      setThreadsState(cachedThreads);
      setListLoading(false);
    } else {
      setListLoading(true);
    }

    if (cachedChat) {
      setChatState(cachedChat);
      setChatLoading(false);
    } else {
      setChatLoading(true);
      if (!cachedThreads) setChatState(null);
    }

    setMessage(getChatDraft(chatId));
    setAccessError(null);

    let cancelled = false;
    void (async () => {
      try {
        const chatRes = await apiGet<{ chat: Chat }>(`/chats/${chatId}`);
        if (cancelled) return;
        setCachedChat(chatRes.chat);
        setChatState(chatRes.chat);
        const listRes = await apiGet<{ chats: Chat[] }>('/chats');
        if (!cancelled) {
          setCachedThreads(listRes.chats);
          setThreadsState(listRes.chats);
        }
      } catch (e) {
        if (cancelled) return;
        if (!hadCache) {
          setChatState(null);
          if (!cachedThreads) setThreadsState([]);
          setAccessError(e instanceof Error ? e.message : 'Could not load chat');
        }
      } finally {
        if (!cancelled) {
          setListLoading(false);
          setChatLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chatId]);

  const showInitialLoading =
    (listLoading && threads.length === 0) || (chatLoading && !chat);

  return {
    threads,
    setThreads,
    chat,
    setChat,
    showInitialLoading,
    accessError,
    setAccessError,
    message,
    setMessage,
    refreshThreads,
    applyChatResponse,
  };
}
