import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import type { ChangeEvent } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Video, MoreVertical, Send, Image, Lock, Flag, Coins, Search, Clapperboard } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import type { Chat } from '@/types';
import { apiGet, apiUploadFile } from '@/lib/api';
import { chatPreviewLine } from '@/lib/chatPreview';
import { postChatMessage } from '@/lib/chats';
import { layoutChatsListColumnHeaderClass, layoutConversationToolbarClass } from '@/config/design';
import { subscribeChatUpdate } from '@/lib/chatSocket';
import { useAuth } from '@/contexts/AuthContext';
import { useCall } from '@/contexts/CallContext';
import { ChatMessageBubble } from '@/components/chat/ChatMessageBubble';
import { EmojiPickerButton } from '@/components/chat/EmojiPickerButton';
import BlockUserModal from '@/components/modals/BlockUserModal';
import ReportUserModal from '@/components/modals/ReportUserModal';
import MediaPreviewModal from '@/components/modals/MediaPreviewModal';

export default function WomanChatDetail() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user: me, refreshUser } = useAuth();
  const { initiateCall, callStatus } = useCall();
  const [message, setMessage] = useState('');
  const [threads, setThreads] = useState<Chat[]>([]);
  const [chat, setChat] = useState<Chat | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(true);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [earnings, _setEarnings] = useState(0);
  const [imageBusy, setImageBusy] = useState(false);
  const [videoBusy, setVideoBusy] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<{ kind: 'photo' | 'video'; url: string } | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const user = chat?.participant;
  const messages = chat?.messages ?? [];
  const isModSupport = Boolean(chat?.chatKind === 'moderator_support');

  const refreshThreads = useCallback(async () => {
    try {
      const data = await apiGet<{ chats: Chat[] }>('/chats');
      setThreads(data.chats);
    } catch {
      setThreads([]);
    }
  }, []);

  /** Load open chat first (server marks incoming messages read), then thread list so unread matches DB. */
  useEffect(() => {
    if (!chatId) return;
    let cancelled = false;
    (async () => {
      setListLoading(true);
      setChatLoading(true);
      setAccessError(null);
      try {
        const chatRes = await apiGet<{ chat: Chat }>(`/chats/${chatId}`);
        if (cancelled) return;
        setChat(chatRes.chat);
        setMessage('');
        const listRes = await apiGet<{ chats: Chat[] }>('/chats');
        if (!cancelled) setThreads(listRes.chats);
      } catch (e) {
        if (!cancelled) {
          setChat(null);
          setThreads([]);
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

  useEffect(() => {
    if (!chatId) return;
    const unsub = subscribeChatUpdate((payload) => {
      if (payload.chatId !== chatId) return;
      if (payload.chat.isBlocked) {
        setAccessError('This conversation has been blocked');
        setChat(null);
        void refreshThreads();
        return;
      }
      const lm = payload.chat.lastMessage;
      const incomingGift =
        lm?.type === 'gift' && Boolean(me?.id) && lm.senderId !== me?.id;
      setChat(payload.chat);
      void (async () => {
        try {
          const d = await apiGet<{ chat: Chat }>(`/chats/${chatId}`);
          setChat(d.chat);
        } catch {
          /* keep optimistic payload */
        }
        await refreshThreads();
        if (incomingGift) await refreshUser();
      })();
    });
    return unsub;
  }, [chatId, refreshThreads, me?.id, refreshUser]);

  /** API omits chats with no outbound messages; still show the thread you’re viewing (e.g. from Message). */
  const displayThreads = useMemo(() => {
    if (!chat || !chatId) return threads;
    if (threads.some((t) => t.id === chat.id)) return threads;
    return [chat, ...threads];
  }, [threads, chat, chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const applyChatResponse = useCallback(
    (next: Chat) => {
      setChat(next);
      void refreshThreads();
    },
    [refreshThreads]
  );

  const handleSend = async () => {
    if (!message.trim() || !chatId) return;
    try {
      const { chat: nextChat } = await postChatMessage(chatId, { content: message.trim(), type: 'text' });
      applyChatResponse(nextChat);
      setMessage('');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not send message');
    }
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !chatId) return;
    setImageBusy(true);
    try {
      const { url } = await apiUploadFile<{ url: string }>('/uploads/image', file);
      const { chat: next } = await postChatMessage(chatId, { type: 'image', mediaUrl: url, content: '' });
      applyChatResponse(next);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not send photo');
    } finally {
      setImageBusy(false);
    }
  };

  const handleVideoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !chatId) return;
    if (!isModSupport) return;
    setVideoBusy(true);
    try {
      const { url } = await apiUploadFile<{ url: string }>('/uploads/video', file);
      const { chat: next } = await postChatMessage(chatId, { type: 'video', mediaUrl: url, content: '' });
      applyChatResponse(next);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not send video');
    } finally {
      setVideoBusy(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  if (listLoading || chatLoading) {
    return (
      <div className="flex h-full min-h-0 flex-1 items-center justify-center text-gray-500">
        Loading chat…
      </div>
    );
  }

  if (accessError) {
    const blocked = accessError.toLowerCase().includes('blocked');
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-gray-600">
          {blocked ? 'This conversation is no longer available.' : accessError}
        </p>
        <Link to="/woman/chats" className="text-green-600 hover:underline">
          Back to chats
        </Link>
      </div>
    );
  }

  if (!user || !chat) {
    return (
      <div className="flex h-full min-h-0 flex-1 items-center justify-center">
        <p className="text-gray-500">Chat not found</p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-row bg-white">
      <div className="hidden h-full min-h-0 min-w-0 w-64 shrink-0 flex-col border-r border-gray-200 bg-white lg:flex xl:w-72">
        <div className={layoutChatsListColumnHeaderClass}>
          <h1 className="text-lg font-bold leading-tight text-gray-900">Chats</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search chats..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-3 text-sm leading-tight outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {displayThreads.map((thread) => {
            const isActive = thread.id === chatId;
            return (
              <Link
                key={thread.id}
                to={`/woman/chats/${thread.id}`}
                className={`flex items-center gap-2.5 border-b border-gray-100 px-3 py-3 transition-colors ${
                  isActive ? 'bg-green-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={thread.participant.profilePicture}
                    alt={thread.participant.name}
                    className="h-11 w-11 shrink-0 rounded-full object-cover"
                  />
                  {thread.participant.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-1.5">
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

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/* Header */}
        <div className={`${layoutConversationToolbarClass} justify-between`}>
          <div className="flex items-center gap-3">
            <Link to="/woman/chats" className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="relative">
              <img
                src={user.profilePicture}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              {user.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{user.name}</h3>
              <p className="text-xs text-gray-500">
                {user.isOnline ? 'Online' : `Last seen ${user.lastActive || 'recently'}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isModSupport && (
              <>
                <div className="hidden items-center gap-2 rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1 sm:flex">
                  <Coins className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-700">+{earnings}</span>
                </div>

                <button
                  onClick={() =>
                    void initiateCall(
                      user.id,
                      chatId!,
                      'video',
                      user.name,
                      user.profilePicture
                    )
                  }
                  disabled={callStatus !== 'idle'}
                  className="rounded-full p-2 hover:bg-gray-100 disabled:opacity-40"
                  type="button"
                  title="Video call"
                >
                  <Video className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  onClick={() =>
                    void initiateCall(
                      user.id,
                      chatId!,
                      'audio',
                      user.name,
                      user.profilePicture
                    )
                  }
                  disabled={callStatus !== 'idle'}
                  className="rounded-full p-2 hover:bg-gray-100 disabled:opacity-40"
                  type="button"
                  title="Audio call"
                >
                  <Phone className="h-5 w-5 text-gray-600" />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="rounded-full p-2 hover:bg-gray-100"
                    type="button"
                  >
                    <MoreVertical className="h-5 w-5 text-gray-600" />
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 top-full z-10 mt-2 w-48 rounded-xl border border-gray-200 bg-white py-2 shadow-lg">
                      <button
                        onClick={() => {
                          setBlockModalOpen(true);
                          setMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-gray-50"
                        type="button"
                      >
                        <Lock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">Block User</span>
                      </button>
                      <button
                        onClick={() => {
                          setReportModalOpen(true);
                          setMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-gray-50"
                        type="button"
                      >
                        <Flag className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">Report User</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
            {isModSupport && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                Moderation
              </span>
            )}
          </div>
        </div>

        {isModSupport && (
          <div className="shrink-0 border-b border-amber-300 bg-amber-50 px-4 py-2 text-center text-xs text-amber-950">
            <strong>Official moderation chat</strong> — MemberDate team. You can reply in text only.
          </div>
        )}

        {/* Messages */}
        <div
          className={`min-h-0 flex-1 overflow-y-auto p-4 ${isModSupport ? 'bg-amber-50/50' : 'bg-gray-50'}`}
        >
          <div className="space-y-4">
            {messages.map((msg, index) => {
              const isMe = me?.id != null && msg.senderId === me.id;
              const showAvatar = !isMe && (index === 0 || messages[index - 1]?.senderId !== msg.senderId);
              return (
                <ChatMessageBubble
                  key={msg.id}
                  msg={msg}
                  isMe={isMe}
                  showAvatar={showAvatar}
                  peerPicture={user.profilePicture ?? ''}
                  peerName={user.name ?? ''}
                  onMediaPreview={(url, kind) => setMediaPreview({ url, kind })}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="shrink-0 border-t border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void handleImageChange(e)}
            />
            {isModSupport ? (
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => void handleVideoChange(e)}
              />
            ) : null}
            <button
              type="button"
              disabled={imageBusy || !chatId}
              onClick={() => imageInputRef.current?.click()}
              className="rounded-full p-2 hover:bg-gray-100 disabled:opacity-50"
              aria-label="Send photo"
            >
              <Image className="h-5 w-5 text-gray-500" />
            </button>
            {isModSupport && (
              <button
                type="button"
                disabled={videoBusy || !chatId}
                onClick={() => videoInputRef.current?.click()}
                className="rounded-full p-2 hover:bg-gray-100 disabled:opacity-50"
                aria-label="Send video clip"
              >
                <Clapperboard className="h-5 w-5 text-gray-500" />
              </button>
            )}
            <EmojiPickerButton onPick={(em) => setMessage((m) => m + em)} disabled={!chatId} />
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isModSupport ? 'Message — attach a photo or video if helpful' : 'Type a message...'
              }
              className={`flex-1 rounded-full px-4 py-2 outline-none focus:ring-2 ${
                isModSupport
                  ? 'border border-amber-200 bg-amber-50/80 focus:ring-amber-500'
                  : 'bg-gray-100 focus:ring-green-500'
              }`}
            />
            <Button
              type="button"
              onClick={() => void handleSend()}
              disabled={!message.trim()}
              size="icon"
              className={
                isModSupport
                  ? 'rounded-full bg-amber-600 hover:bg-amber-700'
                  : 'rounded-full bg-green-500 hover:bg-green-600'
              }
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {!isModSupport && (
        <>
          <BlockUserModal
            open={blockModalOpen}
            onClose={() => setBlockModalOpen(false)}
            chatId={chatId!}
            userName={user.name}
            profilePicture={user.profilePicture}
            onBlocked={() => {
              void refreshThreads();
              navigate('/woman/chats');
            }}
          />
          <ReportUserModal
            open={reportModalOpen}
            onClose={() => setReportModalOpen(false)}
            chatId={chatId!}
            userName={user.name}
            profilePicture={user.profilePicture}
            onSubmitted={() => {
              void (async () => {
                try {
                  const d = await apiGet<{ chat: Chat }>(`/chats/${chatId}`);
                  setChat(d.chat);
                } catch {
                  /* ignore */
                }
              })();
              void refreshThreads();
            }}
          />
        </>
      )}
      <MediaPreviewModal
        open={Boolean(mediaPreview)}
        onClose={() => setMediaPreview(null)}
        kind={mediaPreview?.kind === 'video' ? 'video' : 'photo'}
        imageUrl={mediaPreview?.kind === 'photo' ? mediaPreview.url : undefined}
        videoUrl={mediaPreview?.kind === 'video' ? mediaPreview.url : undefined}
      />
    </div>
  );
}
