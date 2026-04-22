import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

type Props = {
  open: boolean;
  onClose: () => void;
  kind: 'photo' | 'video';
  /** Full-size image URL */
  imageUrl?: string;
  /** Video stream URL */
  videoUrl?: string;
  /** Poster / thumbnail for video */
  posterUrl?: string;
};

export default function MediaPreviewModal({ open, onClose, kind, imageUrl, videoUrl, posterUrl }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!open && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close preview"
      />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-gray-950 shadow-2xl ring-1 ring-white/15">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
          <span className="text-sm font-medium tracking-wide text-white/90">
            {kind === 'video' ? 'Video preview' : 'Photo preview'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-auto p-3 sm:p-5">
          {kind === 'photo' && imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              className="mx-auto max-h-[78vh] w-full max-w-full object-contain"
            />
          ) : kind === 'video' && videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              poster={posterUrl}
              controls
              playsInline
              preload="metadata"
              className="mx-auto max-h-[78vh] w-full rounded-xl bg-black shadow-inner ring-1 ring-white/10"
            />
          ) : (
            <p className="py-12 text-center text-sm text-white/60">Nothing to preview.</p>
          )}
        </div>
      </div>
    </div>
  );
}
