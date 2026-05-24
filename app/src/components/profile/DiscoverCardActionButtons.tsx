import type { MouseEvent } from 'react';
import { Heart, MessageCircle, Video } from 'lucide-react';
import {
  discoverCardActionButtonClass,
  discoverCardActionIconClass,
  discoverCardVideoButtonClass,
} from '@/config/design';

const iconProps = { className: discoverCardActionIconClass, strokeWidth: 2.25 as const };

type DiscoverCardActionButtonsProps = {
  onLike?: (e: MouseEvent<HTMLButtonElement>) => void;
  onMessage: (e: MouseEvent<HTMLButtonElement>) => void;
  onVideo: (e: MouseEvent<HTMLButtonElement>) => void;
  messageDisabled?: boolean;
  videoDisabled?: boolean;
  likeLabel?: string;
  messageLabel?: string;
  videoLabel?: string;
};

/** Compact row for narrow discover cards (1080p @ 150% OS scale). */
export default function DiscoverCardActionButtons({
  onLike,
  onMessage,
  onVideo,
  messageDisabled,
  videoDisabled,
  likeLabel = 'Like',
  messageLabel = 'Message',
  videoLabel = 'Video call',
}: DiscoverCardActionButtonsProps) {
  return (
    <div className="flex w-full min-w-0 max-w-full items-center gap-1">
      {onLike ? (
        <button
          type="button"
          onClick={onLike}
          className={discoverCardActionButtonClass}
          aria-label={likeLabel}
        >
          <Heart {...iconProps} />
        </button>
      ) : null}
      <button
        type="button"
        onClick={onMessage}
        disabled={messageDisabled}
        className={discoverCardActionButtonClass}
        aria-label={messageLabel}
      >
        <MessageCircle {...iconProps} />
      </button>
      <button
        type="button"
        onClick={onVideo}
        disabled={videoDisabled}
        className={`${discoverCardVideoButtonClass} ml-auto`}
        aria-label={videoLabel}
      >
        <Video {...iconProps} />
      </button>
    </div>
  );
}
