import { useState, useRef, useEffect, useMemo } from 'react';
import type { ChangeEvent } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Phone, Video, MoreVertical, Send, Image, Gift, Lock, Flag, Search, Clapperboard, Pin } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import type { Chat } from '@/types';
import type { GiftSendPayload } from '@/lib/gifts';
import { apiGet, apiUploadFile } from '@/lib/api';
import { chatPreviewLine, filterChatThreads } from '@/lib/chatPreview';
import { postChatMessage, setChatPinned } from '@/lib/chats';
import { profileReturnState } from '@/lib/profileNavigation';
import { layoutChatsListColumnHeaderClass, layoutConversationToolbarClass } from '@/config/design';
import { subscribeChatUpdate, subscribePresenceChanged } from '@/lib/chatSocket';
import { clearCachedChat, setCachedChat, setChatDraft } from '@/lib/chatCache';
import { patchChatWithPresence, patchThreadsWithPresence } from '@/lib/presence';
import { useAuth } from '@/contexts/AuthContext';
import { useCall } from '@/contexts/CallContext';
import { ChatMessageBubble } from '@/components/chat/ChatMessageBubble';
import { EmojiPickerButton } from '@/components/chat/EmojiPickerButton';
import BlockUserModal from '@/components/modals/BlockUserModal';
import ReportUserModal from '@/components/modals/ReportUserModal';
import SendGiftModal from '@/components/modals/SendGiftModal';
import MediaPreviewModal from '@/components/modals/MediaPreviewModal';
import VideoCallConfirmModal from '@/components/modals/VideoCallConfirmModal';
import { useCallPricing } from '@/lib/callPricing';
import type { CallType } from '@/lib/chatSocket';
import { useChatDetailLoader } from '@/hooks/useChatDetailLoader';

export default function ManChatDetail() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user: me, refreshUser } = useAuth();
  const callPricing = useCallPricing();
  const { initiateCall, callStatus } = useCall();
  const [callConfirmType, setCallConfirmType] = useState<CallType | null>(null);
  const [callStartBusy, setCallStartBusy] = useState(false);
  const {
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
  } = useChatDetailLoader(chatId, me?.id);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [giftModalOpen, setGiftModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);
  const [videoBusy, setVideoBusy] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<{ kind: 'photo' | 'video'; url: string } | null>(null);
  const [chatListSearch, setChatListSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const user = chat?.participant;
  const messages = chat?.messages ?? [];

  const startConfirmedCall = async () => {
    if (!user || !chatId || !callConfirmType || callStartBusy || callStatus !== 'idle') return;
    setCallStartBusy(true);
    try {
      await initiateCall(user.id, chatId, callConfirmType, user.name, user.profilePicture);
      setCallConfirmType(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not start call');
    } finally {
      setCallStartBusy(false);
    }
  };
  const isModSupport = Boolean(chat?.chatKind === 'moderator_support');

  useEffect(() => {
    const unsubPresence = subscribePresenceChanged((payload) => {
      setThreads((prev) => patchThreadsWithPresence(prev, payload));
      setChat((c) => (c ? patchChatWithPresence(c, payload) : c));
    });
    return unsubPresence;
  }, [setThreads, setChat]);

  useEffect(() => {
    if (!chatId) return;
    const unsub = subscribeChatUpdate((payload) => {
      if (payload.chatId !== chatId) {
        setCachedChat(payload.chat);
        void refreshThreads();
        return;
      }
      if (payload.chat.isBlocked) {
        setAccessError('This conversation has been blocked');
        clearCachedChat(chatId);
        setChat(null);
        void refreshThreads();
        return;
      }
      setCachedChat(payload.chat);
      setChat(payload.chat);
      void refreshThreads();
    });
    return unsub;
  }, [chatId, refreshThreads, setAccessError, setChat]);

  const displayThreads = useMemo(() => {
    if (!chat || !chatId) return threads;
    if (threads.some((t) => t.id === chat.id)) return threads;
    return [chat, ...threads];
  }, [threads, chat, chatId]);

  const filteredThreads = useMemo(
    () => filterChatThreads(displayThreads, chatListSearch),
    [displayThreads, chatListSearch]
  );

  const peerProfilePath =
    user && !isModSupport && user.id ? `/man/view-profile/${user.id}` : null;
  const profileNavState = useMemo(
    () => profileReturnState(location.pathname + location.search),
    [location.pathname, location.search]
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !chatId) return;
    try {
      const { chat: next } = await postChatMessage(chatId, { content: message.trim(), type: 'text' });
      applyChatResponse(next);
      setMessage('');
      setChatDraft(chatId, '');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not send message');
    }
  };

  const handleTogglePin = async () => {
    if (!chatId || !chat) return;
    const nextPinned = !chat.isPinned;
    try {
      const { chat: next } = await setChatPinned(chatId, nextPinned);
      setChat(next);
      await refreshThreads();
      toast.success(nextPinned ? 'Chat pinned' : 'Chat unpinned');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not update pin');
    }
    setMenuOpen(false);
  };

  const handleGiftSend = async (gift: GiftSendPayload) => {
    if (!chatId) return;
    try {
      const { chat: next } = await postChatMessage(chatId, {
        type: 'gift',
        content: gift.name,
        giftAmount: gift.coins,
        ...(gift.comment ? { giftComment: gift.comment } : {}),
      });
      applyChatResponse(next);
      await refreshUser();
    } catch (e) {
      throw e instanceof Error ? e : new Error('Could not send gift');
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

  if (showInitialLoading) {
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
        <Link to="/man/chats" className="text-green-600 hover:underline">
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
              type="search"
              value={chatListSearch}
              onChange={(e) => setChatListSearch(e.target.value)}
              placeholder="Search chats..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-3 text-sm leading-tight outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {filteredThreads.length === 0 && chatListSearch.trim() ? (
            <p className="px-4 py-8 text-center text-sm text-gray-500">No chats match your search</p>
          ) : null}
          {filteredThreads.map((thread) => {
            const isActive = thread.id === chatId;
            return (
              <Link
                key={thread.id}
                to={`/man/chats/${thread.id}`}
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

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/* Header */}
        <div className={`${layoutConversationToolbarClass} justify-between`}>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 1) navigate(-1);
                else navigate('/man/chats', { replace: true });
              }}
              className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-full"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            {peerProfilePath ? (
              <Link
                to={peerProfilePath}
                state={profileNavState.state}
                className="relative shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  className="h-10 w-10 rounded-full object-cover transition-opacity hover:opacity-90"
                />
                {user.isOnline && (
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                )}
              </Link>
            ) : (
              <div className="relative shrink-0">
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
                {user.isOnline && (
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                )}
              </div>
            )}
            <div>
              {peerProfilePath ? (
                <Link
                  to={peerProfilePath}
                  state={profileNavState.state}
                  className="font-semibold text-gray-900 hover:text-green-600"
                >
                  {user.name}
                </Link>
              ) : (
                <h3 className="font-semibold text-gray-900">{user.name}</h3>
              )}
              <p className="text-xs text-gray-500">
                {user.isOnline ? 'Online' : `Last seen ${user.lastActive || 'recently'}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isModSupport && (
              <>
                <button
                  onClick={() => setCallConfirmType('video')}
                  disabled={callStatus !== 'idle'}
                  className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-40"
                  type="button"
                  title="Video call"
                >
                  <Video className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={() => setCallConfirmType('audio')}
                  disabled={callStatus !== 'idle'}
                  className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-40"
                  type="button"
                  title="Voice call"
                >
                  <Phone className="w-5 h-5 text-gray-600" />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                    type="button"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 top-full z-10 mt-2 w-48 rounded-xl border border-gray-200 bg-white py-2 shadow-lg">
                      {!isModSupport && (
                        <button
                          onClick={() => void handleTogglePin()}
                          className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-gray-50"
                          type="button"
                        >
                          <Pin
                            className={`h-4 w-4 ${chat.isPinned ? 'fill-green-600 text-green-600' : 'text-gray-500'}`}
                          />
                          <span className="text-sm">{chat.isPinned ? 'Unpin chat' : 'Pin chat'}</span>
                        </button>
                      )}
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
            <strong>Official moderation chat</strong> — MemberDate team. You can reply in text only; dating
            actions are turned off here.
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

        {/* Input — stays above keyboard / viewport bottom (column layout) */}
        <div className="shrink-0 border-t border-gray-200 bg-white px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4 sm:pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex min-w-0 items-center gap-1 sm:gap-2">
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
            <div className="flex shrink-0 items-center">
              <button
                type="button"
                disabled={imageBusy || !chatId}
                onClick={() => imageInputRef.current?.click()}
                className="rounded-full p-1.5 hover:bg-gray-100 disabled:opacity-50 sm:p-2"
                aria-label="Send photo"
              >
                <Image className="h-5 w-5 text-gray-500" />
              </button>
              {isModSupport && (
                <button
                  type="button"
                  disabled={videoBusy || !chatId}
                  onClick={() => videoInputRef.current?.click()}
                  className="rounded-full p-1.5 hover:bg-gray-100 disabled:opacity-50 sm:p-2"
                  aria-label="Send video"
                >
                  <Clapperboard className="h-5 w-5 text-gray-500" />
                </button>
              )}
              {!isModSupport && (
                <button
                  type="button"
                  onClick={() => setGiftModalOpen(true)}
                  className="rounded-full p-1.5 hover:bg-gray-100 sm:p-2"
                  aria-label="Send gift"
                >
                  <Gift className="h-5 w-5 text-gray-500" />
                </button>
              )}
              <EmojiPickerButton onPick={(em) => setMessage((m) => m + em)} disabled={!chatId} />
            </div>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isModSupport ? 'Message — you can also attach a photo or video' : 'Type a message...'
              }
              className={`min-w-0 flex-1 rounded-full px-3 py-2 text-sm outline-none focus:ring-2 sm:px-4 ${
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
              aria-label="Send message"
              className={`size-9 shrink-0 rounded-full ${
                isModSupport
                  ? message.trim()
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-gray-200 text-gray-400 hover:bg-gray-200'
                  : message.trim()
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-gray-200 text-gray-400 hover:bg-gray-200'
              } disabled:pointer-events-none disabled:opacity-100`}
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
              navigate('/man/chats');
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
          <SendGiftModal
            open={giftModalOpen}
            onClose={() => setGiftModalOpen(false)}
            userName={user.name}
            onSendGift={handleGiftSend}
          />
          <VideoCallConfirmModal
            open={callConfirmType !== null}
            onClose={() => !callStartBusy && setCallConfirmType(null)}
            onConfirm={() => void startConfirmedCall()}
            peerName={user.name}
            peerPicture={user.profilePicture}
            busy={callStartBusy}
            callType={callConfirmType ?? 'video'}
            audioRate={callPricing.audioCallPerMinute}
            videoRate={callPricing.videoCallPerMinute}
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
