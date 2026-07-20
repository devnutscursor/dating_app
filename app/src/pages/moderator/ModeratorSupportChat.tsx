import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Shield, Send, Image, Clapperboard } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import type { Chat } from '@/types';
import { apiGet, apiUploadFile } from '@/lib/api';
import { postChatMessage } from '@/lib/chats';
import { subscribeChatUpdate } from '@/lib/chatSocket';
import { ChatMessageBubble } from '@/components/chat/ChatMessageBubble';
import MediaPreviewModal from '@/components/modals/MediaPreviewModal';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Dedicated moderator ↔ member conversation (distinct from dating chats).
 * Outer gradient ring keeps orange edges visible around rounded corners.
 */
export default function ModeratorSupportChatPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { user: me } = useAuth();
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [imageBusy, setImageBusy] = useState(false);
  const [videoBusy, setVideoBusy] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<{ kind: 'photo' | 'video'; url: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    if (!chatId) return;
    try {
      const data = await apiGet<{ chat: Chat }>(`/chats/${chatId}`);
      setChat(data.chat);
    } catch {
      setChat(null);
      toast.error('Could not load moderation chat');
    }
  }, [chatId]);

  useEffect(() => {
    if (!chatId) return;
    let cancelled = false;
    void (async () => {
      setLoading(true);
      await refresh();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [chatId, refresh]);

  useEffect(() => {
    if (!chatId) return;
    const unsub = subscribeChatUpdate((payload) => {
      if (payload.chatId !== chatId) return;
      setChat(payload.chat);
      void refresh();
    });
    return unsub;
  }, [chatId, refresh]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  const peer = chat?.participant;
  const messages = chat?.messages ?? [];

  const handleSend = async () => {
    const text = message.trim();
    if (!chatId || !text) return;
    try {
      const { chat: next } = await postChatMessage(chatId, { content: text, type: 'text' });
      setChat(next);
      setMessage('');
      void refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not send');
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
      setChat(next);
      void refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not upload image');
    } finally {
      setImageBusy(false);
    }
  };

  const handleVideoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !chatId) return;
    setVideoBusy(true);
    try {
      const { url } = await apiUploadFile<{ url: string }>('/uploads/video', file);
      const { chat: next } = await postChatMessage(chatId, { type: 'video', mediaUrl: url, content: '' });
      setChat(next);
      void refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not upload video');
    } finally {
      setVideoBusy(false);
    }
  };

  if (!chatId) {
    navigate('/moderator/chats');
    return null;
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-gray-500">
        Loading moderation chat…
      </div>
    );
  }

  if (!chat || chat.chatKind !== 'moderator_support' || !peer) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-12 text-center">
        <p className="text-gray-700">This moderation thread is not available.</p>
        <Button type="button" variant="outline" onClick={() => navigate('/moderator/chats')}>
          Back to support chats
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col rounded-2xl bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 p-[3px] shadow-lg">
      <div className="flex min-h-[50vh] flex-col overflow-hidden rounded-[calc(1rem-3px)] bg-amber-50/60">
        <div className="flex shrink-0 items-center gap-3 border-b-2 border-amber-400/90 bg-gradient-to-r from-amber-100 via-amber-50 to-white px-4 py-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => navigate('/moderator/chats')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <div className="flex items-center gap-2 text-amber-950">
              <Shield className="h-5 w-5 shrink-0 text-amber-700" />
              <span className="text-sm font-semibold uppercase tracking-wide text-amber-800">
                Moderation staff chat
              </span>
            </div>
            <p className="truncate text-xs text-amber-900/85">
              With {peer.name} — separate from dating chats. Gifts are disabled.
            </p>
          </div>
        </div>

        <div className="min-h-[45vh] flex-1 overflow-y-auto bg-white p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <p className="text-center text-sm text-gray-500">
                No messages yet. Introduce yourself, or attach a screenshot if it helps.
              </p>
            )}
            {messages.map((msg, index) => {
              const isMe = me?.id != null && msg.senderId === me.id;
              const showAvatar = !isMe && (index === 0 || messages[index - 1]?.senderId !== msg.senderId);
              return (
                <ChatMessageBubble
                  key={msg.id}
                  msg={msg}
                  isMe={isMe}
                  showAvatar={showAvatar}
                  peerPicture={peer.profilePicture ?? ''}
                  peerName={peer.name ?? ''}
                  onMediaPreview={(url, kind) => setMediaPreview({ url, kind })}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="shrink-0 border-t-2 border-amber-300/90 bg-gradient-to-r from-amber-50 to-amber-100/90 p-4">
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void handleImageChange(e)}
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => void handleVideoChange(e)}
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={imageBusy || !chatId}
              className="rounded-full p-2 text-amber-900 hover:bg-amber-200/70 disabled:opacity-50"
              aria-label="Attach image"
              onClick={() => imageInputRef.current?.click()}
            >
              <Image className="h-5 w-5" />
            </button>
            <button
              type="button"
              disabled={videoBusy || !chatId}
              className="rounded-full p-2 text-amber-900 hover:bg-amber-200/70 disabled:opacity-50"
              aria-label="Attach video"
              onClick={() => videoInputRef.current?.click()}
            >
              <Clapperboard className="h-5 w-5" />
            </button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend();
                }
              }}
              placeholder="Type a message or attach photo / video"
              className="flex-1 rounded-full border border-amber-400/70 bg-white px-4 py-2 text-sm text-amber-950 outline-none placeholder:text-amber-800/45 focus:ring-2 focus:ring-amber-500"
            />
            <Button
              type="button"
              size="icon"
              className="shrink-0 rounded-full bg-amber-600 hover:bg-amber-700"
              disabled={!message.trim()}
              onClick={() => void handleSend()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

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
