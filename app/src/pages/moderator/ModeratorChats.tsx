import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Search, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { fetchModeratorSupportChats } from '@/lib/moderator';
import { subscribeChatUpdate } from '@/lib/chatSocket';
import { chatPreviewLine } from '@/lib/chatPreview';
import type { Chat } from '@/types';

export default function ModeratorChatsPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    try {
      const rows = await fetchModeratorSupportChats();
      setChats(rows);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not load support chats');
      setChats([]);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    void load().finally(() => setLoading(false));
  }, [load]);

  useEffect(() => {
    const unsub = subscribeChatUpdate((payload) => {
      if (payload.chat?.chatKind === 'moderator_support' || !payload.chat) {
        void load();
      }
    });
    return unsub;
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return chats;
    return chats.filter((c) => {
      const name = c.participant?.name?.toLowerCase() ?? '';
      const preview = chatPreviewLine(c.lastMessage).toLowerCase();
      return name.includes(q) || preview.includes(q);
    });
  }, [chats, search]);

  const unreadTotal = useMemo(
    () => chats.reduce((n, c) => n + (c.unreadCount > 0 ? 1 : 0), 0),
    [chats]
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Chats</h1>
          <p className="text-gray-500">
            Messages from members who contacted moderation — reply without opening a report.
          </p>
        </div>
        {unreadTotal > 0 && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-900">
            {unreadTotal} unread
          </span>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by member name…"
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-gray-500">Loading support chats…</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-6 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <MessageCircle className="h-7 w-7" />
          </div>
          <p className="text-lg font-medium text-gray-900">
            {search.trim() ? 'No chats match your search' : 'No support messages yet'}
          </p>
          <p className="mt-2 max-w-sm text-sm text-gray-500">
            When a member opens the Moderator chat and sends a message, it will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {filtered.map((thread) => (
            <Link
              key={thread.id}
              to={`/moderator/support/${thread.id}`}
              className="flex items-center gap-3 border-b border-gray-100 px-4 py-3.5 transition-colors last:border-b-0 hover:bg-amber-50/60"
            >
              <div className="relative shrink-0">
                {thread.participant?.profilePicture ? (
                  <img
                    src={thread.participant.profilePicture}
                    alt=""
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-800">
                    <Shield className="h-5 w-5" />
                  </div>
                )}
                {thread.participant?.isOnline && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate font-semibold text-gray-900">
                    {thread.participant?.name || 'Member'}
                  </h3>
                  <span className="shrink-0 text-xs text-gray-400">
                    {thread.lastMessage?.timestamp}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-sm text-gray-500">
                  {chatPreviewLine(thread.lastMessage)}
                </p>
              </div>
              {thread.unreadCount > 0 && (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-amber-500 px-1.5 text-xs font-bold text-white">
                  {thread.unreadCount > 99 ? '99+' : thread.unreadCount}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
