import { Link } from 'react-router-dom';
import { Pin, Search } from 'lucide-react';
import { layoutChatsListColumnHeaderClass } from '@/config/design';
import { chatPreviewLine, filterChatThreads } from '@/lib/chatPreview';
import type { Chat } from '@/types';

type ChatThreadListProps = {
  area: 'man' | 'woman';
  threads: Chat[];
  activeChatId?: string;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  className?: string;
};

export default function ChatThreadList({
  area,
  threads,
  activeChatId,
  searchQuery,
  onSearchQueryChange,
  className = '',
}: ChatThreadListProps) {
  const filteredThreads = filterChatThreads(threads, searchQuery);

  return (
    <div className={`flex h-full min-h-0 min-w-0 flex-col bg-white ${className}`}>
      <div className={layoutChatsListColumnHeaderClass}>
        <h1 className="text-lg font-bold leading-tight text-gray-900">Chats</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="Search chats..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-3 text-sm leading-tight outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {filteredThreads.length === 0 && searchQuery.trim() ? (
          <p className="px-4 py-8 text-center text-sm text-gray-500">No chats match your search</p>
        ) : null}
        {filteredThreads.map((thread) => {
          const isActive = thread.id === activeChatId;
          return (
            <Link
              key={thread.id}
              to={`/${area}/chats/${thread.id}`}
              className={`flex items-center gap-2.5 border-b border-gray-100 px-3 py-3 transition-colors ${
                isActive ? 'bg-green-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="relative shrink-0">
                <img
                  src={thread.participant.profilePicture}
                  alt={thread.participant.name}
                  className="h-11 w-11 shrink-0 rounded-full object-cover"
                />
                {thread.participant.isOnline && (
                  <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-1.5">
                    {thread.isPinned && (
                      <Pin className="h-3.5 w-3.5 shrink-0 fill-green-600 text-green-600" aria-hidden />
                    )}
                    <h3 className="truncate font-semibold text-gray-900">{thread.participant.name}</h3>
                    {thread.chatKind === 'moderator_support' && (
                      <span className="shrink-0 rounded bg-amber-200 px-1 text-[10px] font-semibold uppercase text-amber-900">
                        Mod
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">{thread.lastMessage?.timestamp}</span>
                </div>
                <p className="mt-1 truncate text-sm text-gray-500">{chatPreviewLine(thread.lastMessage)}</p>
              </div>

              {thread.unreadCount > 0 && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-xs font-medium text-white">
                  {thread.unreadCount}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
