import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChatThreadList from '@/components/chat/ChatThreadList';
import { useAuth } from '@/contexts/AuthContext';
import { useChatDetailLoader } from '@/hooks/useChatDetailLoader';
import { getCachedThreads } from '@/lib/chatCache';
import { subscribeChatUpdate, subscribePresenceChanged } from '@/lib/chatSocket';
import { patchThreadsWithPresence } from '@/lib/presence';

type ChatInboxPageProps = {
  area: 'man' | 'woman';
};

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = () => setIsDesktop(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return isDesktop;
}

export default function ChatInboxPage({ area }: ChatInboxPageProps) {
  const { user } = useAuth();
  const isDesktop = useIsDesktop();
  const [chatListSearch, setChatListSearch] = useState('');
  const [loading, setLoading] = useState(() => !getCachedThreads());
  const { threads, setThreads, refreshThreads } = useChatDetailLoader(undefined, user?.id);

  useEffect(() => {
    setLoading(true);
    void refreshThreads().finally(() => setLoading(false));
  }, [refreshThreads]);

  useEffect(() => {
    const unsubPresence = subscribePresenceChanged((payload) => {
      setThreads((prev) => patchThreadsWithPresence(prev, payload));
    });
    const unsubChat = subscribeChatUpdate(() => {
      void refreshThreads();
    });
    return () => {
      unsubPresence();
      unsubChat();
    };
  }, [refreshThreads, setThreads]);

  const firstChatId = useMemo(() => {
    const preferred = threads.find((c) => (c.chatKind ?? 'direct') !== 'moderator_support');
    return (preferred ?? threads[0])?.id ?? null;
  }, [threads]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-1 items-center justify-center text-sm text-gray-500">
        Loading chats…
      </div>
    );
  }

  if (isDesktop && firstChatId) {
    return <Navigate to={`/${area}/chats/${firstChatId}`} replace />;
  }

  if (threads.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
          <MessageCircle className="h-8 w-8" aria-hidden />
        </div>
        <h1 className="text-xl font-semibold text-gray-900">No conversations yet</h1>
        <p className="mt-2 text-sm text-gray-500">
          When you match and start chatting, your threads will show up here.
        </p>
        <Button asChild className="mt-8 bg-green-500 hover:bg-green-600">
          <Link to={`/${area}/home`}>Discover people</Link>
        </Button>
      </div>
    );
  }

  return (
    <ChatThreadList
      area={area}
      threads={threads}
      searchQuery={chatListSearch}
      onSearchQueryChange={setChatListSearch}
      className="flex-1"
    />
  );
}
