import { AlertTriangle, Coins, Play } from 'lucide-react';
import type { Message } from '@/types';
import { cn } from '@/lib/utils';
import { getGiftVisualTheme, giftIconKindForLabel } from '@/lib/giftVisualThemes';
import { GiftOptionIcon } from '@/components/gifts/GiftOptionIcon';

type Props = {
  msg: Message;
  isMe: boolean;
  showAvatar: boolean;
  peerPicture: string;
  peerName: string;
  /** Opens full-screen preview for image/video messages */
  onMediaPreview?: (url: string, kind: 'photo' | 'video') => void;
};

function GiftMessageCard({ msg, isMe }: { msg: Message; isMe: boolean }) {
  const name = msg.content?.trim() || 'Gift';
  const coins = msg.giftAmount;
  const note = msg.giftNote?.trim();
  const t = getGiftVisualTheme(name, isMe);
  const iconKind = giftIconKindForLabel(name);

  return (
    <div
      className={cn(
        'relative max-w-[min(92vw,300px)] overflow-hidden rounded-2xl border shadow-sm shadow-black/[0.06]',
        t.card
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full opacity-35 blur-2xl',
          t.orb
        )}
      />
      <div className="relative p-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm ring-2 ring-white/50',
              t.icon
            )}
          >
            <GiftOptionIcon kind={iconKind} className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <p className={cn('text-[10px] font-bold uppercase tracking-wider', t.label)}>
              {isMe ? 'Gift sent' : 'Gift received'}
            </p>
            <p className={cn('truncate text-base font-bold leading-tight', t.title)}>{name}</p>
            {coins != null && (
              <div
                className={cn(
                  'mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1',
                  t.pill
                )}
              >
                <Coins className={cn('h-3.5 w-3.5 shrink-0', t.coinsIcon)} />
                {coins} coins
              </div>
            )}
            {note ? (
              <p className={cn('mt-2 text-sm leading-snug opacity-90', t.label)}>&ldquo;{note}&rdquo;</p>
            ) : null}
          </div>
        </div>
        <p className={cn('mt-3 text-xs tabular-nums', t.time)}>{msg.timestamp}</p>
      </div>
    </div>
  );
}

function MessageBody({
  msg,
  isMe,
  onMediaPreview,
}: {
  msg: Message;
  isMe: boolean;
  onMediaPreview?: (url: string, kind: 'photo' | 'video') => void;
}) {
  const caption = msg.content?.trim();
  const captionClass = `text-sm mt-2 whitespace-pre-wrap break-words ${isMe ? 'text-green-50' : 'text-gray-800'}`;

  switch (msg.type) {
    case 'image':
      return (
        <div>
          {msg.mediaUrl ? (
            <button
              type="button"
              onClick={() => onMediaPreview?.(msg.mediaUrl!, 'photo')}
              className="group relative block max-w-full cursor-zoom-in overflow-hidden rounded-xl ring-1 ring-black/5 transition hover:ring-2 hover:ring-green-400/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
              aria-label="View photo full size"
            >
              <img
                src={msg.mediaUrl}
                alt=""
                className="max-h-56 w-full object-contain transition group-hover:brightness-[0.97]"
              />
            </button>
          ) : null}
          {caption ? <p className={captionClass}>{msg.content}</p> : null}
        </div>
      );
    case 'video':
      return msg.mediaUrl ? (
        <button
          type="button"
          onClick={() => onMediaPreview?.(msg.mediaUrl!, 'video')}
          className="group relative block max-w-full cursor-pointer overflow-hidden rounded-xl ring-1 ring-black/5 transition hover:ring-2 hover:ring-green-400/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          aria-label="Play video"
        >
          <video
            src={msg.mediaUrl}
            muted
            playsInline
            preload="metadata"
            className="max-h-56 w-full object-cover opacity-95 pointer-events-none"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-black/35 transition group-hover:bg-black/40">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-green-600 shadow-lg ring-1 ring-black/10">
              <Play className="ml-0.5 h-6 w-6 fill-current" />
            </span>
          </span>
        </button>
      ) : (
        <p className={`text-sm whitespace-pre-wrap break-words ${isMe ? 'text-white' : ''}`}>{msg.content}</p>
      );
    default:
      return (
        <p className={`text-sm whitespace-pre-wrap break-words ${isMe ? 'text-white' : 'text-gray-900'}`}>
          {msg.content}
        </p>
      );
  }
}

export function ChatMessageBubble({
  msg,
  isMe,
  showAvatar,
  peerPicture,
  peerName,
  onMediaPreview,
}: Props) {
  if (msg.isPrivateNotice) {
    return (
      <div className="flex justify-center px-1">
        <div className="w-full max-w-[min(100%,28rem)] rounded-xl border-2 border-amber-400/90 bg-gradient-to-b from-amber-50 to-amber-100/90 px-4 py-3 text-center shadow-sm">
          <div className="flex items-center justify-center gap-2 text-amber-950">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-700" aria-hidden />
            <p className="text-xs font-bold uppercase tracking-wide text-amber-900">Report submitted</p>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-left text-sm font-medium leading-relaxed text-amber-950">
            {msg.content}
          </p>
          <p className="mt-3 border-t border-amber-200/80 pt-2 text-[11px] leading-snug text-amber-900/85">
            Only you can see this note. The other person is not notified in this conversation.
          </p>
          <span className="mt-2 block text-xs text-amber-800/80">{msg.timestamp}</span>
        </div>
      </div>
    );
  }

  if (msg.type === 'gift') {
    return (
      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
        <div className={`flex max-w-[min(92%,320px)] items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
          {!isMe && showAvatar && (
            <img src={peerPicture} alt={peerName} className="h-8 w-8 shrink-0 rounded-full object-cover" />
          )}
          {!isMe && !showAvatar && <div className="w-8" />}
          <GiftMessageCard msg={msg} isMe={isMe} />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[70%] items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
        {!isMe && showAvatar && (
          <img src={peerPicture} alt={peerName} className="h-8 w-8 shrink-0 rounded-full object-cover" />
        )}
        {!isMe && !showAvatar && <div className="w-8" />}

        <div
          className={`rounded-2xl px-4 py-2 ${
            isMe ? 'rounded-br-none bg-green-500 text-white' : 'rounded-bl-none bg-white text-gray-900 shadow-sm'
          }`}
        >
          <MessageBody msg={msg} isMe={isMe} onMediaPreview={onMediaPreview} />
          <span className={`mt-1 block text-xs ${isMe ? 'text-green-100' : 'text-gray-400'}`}>{msg.timestamp}</span>
        </div>
      </div>
    </div>
  );
}
