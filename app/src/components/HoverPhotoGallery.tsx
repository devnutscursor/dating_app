import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent } from 'react';

/** Ms each photo stays visible while hovering (auto-cycle). */
const HOVER_SLIDE_MS = 3200;
/** Delay before resetting to first photo after mouse leaves. */
const LEAVE_RESET_MS = 800;
const FADE_MS = 550;

interface HoverPhotoGalleryProps {
  photos: string[];
  alt: string;
  className?: string;
  maxPhotos?: number;
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  onClick?: () => void;
  /** Show "1 / 3" badge (profile-style). */
  showCounter?: boolean;
}

export default function HoverPhotoGallery({
  photos,
  alt,
  className = '',
  maxPhotos = 10,
  activeIndex: controlledIndex,
  onActiveIndexChange,
  onClick,
  showCounter = false,
}: HoverPhotoGalleryProps) {
  const gallery = useMemo(
    () => Array.from(new Set(photos.filter(Boolean))).slice(0, maxPhotos),
    [photos, maxPhotos]
  );
  const [internalIndex, setInternalIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const advanceRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const leaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeIndex = controlledIndex ?? internalIndex;
  const autoCycle = controlledIndex === undefined && gallery.length > 1;

  const setActiveIndex = useCallback(
    (index: number) => {
      if (gallery.length === 0) return;
      const next = Math.max(0, Math.min(index, gallery.length - 1));
      if (controlledIndex === undefined) setInternalIndex(next);
      onActiveIndexChange?.(next);
    },
    [controlledIndex, gallery.length, onActiveIndexChange]
  );

  const clearAdvance = useCallback(() => {
    if (advanceRef.current) {
      clearInterval(advanceRef.current);
      advanceRef.current = null;
    }
  }, []);

  const startAdvance = useCallback(() => {
    clearAdvance();
    if (!autoCycle) return;
    advanceRef.current = setInterval(() => {
      setInternalIndex((prev) => (prev + 1) % gallery.length);
    }, HOVER_SLIDE_MS);
  }, [autoCycle, gallery.length, clearAdvance]);

  useEffect(() => () => {
    clearAdvance();
    if (leaveRef.current) clearTimeout(leaveRef.current);
  }, [clearAdvance]);

  const updateIndexFromPointer = useCallback(
    (clientX: number, target: HTMLDivElement) => {
      if (gallery.length <= 1) return;
      const rect = target.getBoundingClientRect();
      const width = rect.width || 1;
      const x = Math.max(0, Math.min(clientX - rect.left, width));
      const zone = Math.min(gallery.length - 1, Math.floor((x / width) * gallery.length));
      setActiveIndex(zone);
      if (isHovering && autoCycle) startAdvance();
    },
    [gallery.length, setActiveIndex, isHovering, autoCycle, startAdvance]
  );

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    updateIndexFromPointer(e.clientX, e.currentTarget);
  };

  const handleMouseEnter = (e: MouseEvent<HTMLDivElement>) => {
    if (leaveRef.current) {
      clearTimeout(leaveRef.current);
      leaveRef.current = null;
    }
    setIsHovering(true);
    updateIndexFromPointer(e.clientX, e.currentTarget);
    startAdvance();
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    clearAdvance();
    leaveRef.current = setTimeout(() => setActiveIndex(0), LEAVE_RESET_MS);
  };

  if (gallery.length === 0) {
    return <div className={`bg-gray-100 ${className}`} />;
  }

  return (
    <div
      className={`relative z-0 h-full w-full overflow-hidden pointer-events-auto ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {gallery.length > 1 && (
        <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex gap-1">
          {gallery.map((photo, index) => (
            <div key={`${photo}-progress-${index}`} className="h-1 flex-1 overflow-hidden rounded-full bg-white/35">
              <div
                className="h-full rounded-full bg-white/95 ease-linear transition-[width]"
                style={{
                  width: index === activeIndex ? '100%' : index < activeIndex ? '100%' : '0%',
                  transitionDuration:
                    index === activeIndex && isHovering && autoCycle
                      ? `${HOVER_SLIDE_MS}ms`
                      : '350ms',
                }}
              />
            </div>
          ))}
        </div>
      )}

      {showCounter && gallery.length > 1 && (
        <div className="pointer-events-none absolute right-3 top-3 z-10 rounded-full bg-black/50 px-2.5 py-1 backdrop-blur-sm">
          <span className="text-xs font-medium text-white">
            {activeIndex + 1} / {gallery.length}
          </span>
        </div>
      )}

      {gallery.map((photo, index) => (
        <img
          key={`${photo}-${index}`}
          src={photo}
          alt={alt}
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover ease-in-out"
          style={{
            opacity: index === activeIndex ? 1 : 0,
            transition: `opacity ${FADE_MS}ms ease-in-out`,
          }}
        />
      ))}
    </div>
  );
}
