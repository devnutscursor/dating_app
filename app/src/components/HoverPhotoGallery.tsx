import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent, TouchEvent } from 'react';

/** Ms each photo stays visible while hovering (auto-cycle). */
const HOVER_SLIDE_MS = 3200;
/** Delay before resetting to first photo after mouse leaves. */
const LEAVE_RESET_MS = 800;
const FADE_MS = 550;
const SWIPE_THRESHOLD_PX = 48;
const TAP_MAX_MOVE_PX = 12;
const TAP_MAX_MS = 320;

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
  /** Override counter badge placement (default: top-right under progress bar area on profile). */
  counterClassName?: string;
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
  counterClassName = 'right-3 top-9 sm:top-10',
}: HoverPhotoGalleryProps) {
  const gallery = useMemo(
    () => Array.from(new Set(photos.filter(Boolean))).slice(0, maxPhotos),
    [photos, maxPhotos]
  );
  const [internalIndex, setInternalIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const advanceRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const leaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const suppressClickRef = useRef(false);
  const blockMouseScrubRef = useRef(false);

  const activeIndex = controlledIndex ?? internalIndex;
  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;
  const autoCycle = controlledIndex === undefined && gallery.length > 1;
  /** Profile-style galleries: one tap = one photo step. Discover desktop keeps hover scrub. */
  const useTapStepNavigation =
    controlledIndex !== undefined ||
    (typeof window !== 'undefined' &&
      (window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window));

  const setActiveIndex = useCallback(
    (index: number) => {
      if (gallery.length === 0) return;
      const next = Math.max(0, Math.min(index, gallery.length - 1));
      if (controlledIndex === undefined) setInternalIndex(next);
      onActiveIndexChange?.(next);
    },
    [controlledIndex, gallery.length, onActiveIndexChange]
  );

  const stepPhoto = useCallback(
    (delta: -1 | 1) => {
      if (gallery.length <= 1) return;
      setActiveIndex(activeIndexRef.current + delta);
    },
    [gallery.length, setActiveIndex]
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

  useEffect(
    () => () => {
      clearAdvance();
      if (leaveRef.current) clearTimeout(leaveRef.current);
    },
    [clearAdvance]
  );

  const updateIndexFromPointer = useCallback(
    (clientX: number, target: HTMLDivElement) => {
      if (useTapStepNavigation || gallery.length <= 1) return;
      const rect = target.getBoundingClientRect();
      const width = rect.width || 1;
      const x = Math.max(0, Math.min(clientX - rect.left, width));
      const zone = Math.min(gallery.length - 1, Math.floor((x / width) * gallery.length));
      setActiveIndex(zone);
      if (isHovering && autoCycle) startAdvance();
    },
    [gallery.length, setActiveIndex, isHovering, autoCycle, startAdvance, useTapStepNavigation]
  );

  /** Left = previous, right = next (one step). Center opens preview when provided. */
  const handleStepTap = useCallback(
    (clientX: number, target: HTMLDivElement) => {
      if (gallery.length <= 1) {
        onClick?.();
        return;
      }
      const rect = target.getBoundingClientRect();
      const x = clientX - rect.left;
      const third = rect.width / 3;
      if (x < third) {
        stepPhoto(-1);
        return;
      }
      if (x > third * 2) {
        stepPhoto(1);
        return;
      }
      onClick?.();
    },
    [gallery.length, onClick, stepPhoto]
  );

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    updateIndexFromPointer(e.clientX, e.currentTarget);
  };

  const handleMouseEnter = (e: MouseEvent<HTMLDivElement>) => {
    if (useTapStepNavigation || blockMouseScrubRef.current) return;
    if (leaveRef.current) {
      clearTimeout(leaveRef.current);
      leaveRef.current = null;
    }
    setIsHovering(true);
    updateIndexFromPointer(e.clientX, e.currentTarget);
    startAdvance();
  };

  const handleMouseLeave = () => {
    if (useTapStepNavigation) return;
    setIsHovering(false);
    clearAdvance();
    leaveRef.current = setTimeout(() => setActiveIndex(0), LEAVE_RESET_MS);
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    blockMouseScrubRef.current = true;
    const touch = e.touches[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, t: Date.now() };
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start) return;

    const touch = e.changedTouches[0];
    if (!touch) return;

    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    const elapsed = Date.now() - start.t;

    if (Math.abs(dx) >= SWIPE_THRESHOLD_PX && Math.abs(dx) > Math.abs(dy)) {
      suppressClickRef.current = true;
      stepPhoto(dx < 0 ? 1 : -1);
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 400);
      return;
    }

    if (Math.abs(dx) <= TAP_MAX_MOVE_PX && Math.abs(dy) <= TAP_MAX_MOVE_PX && elapsed <= TAP_MAX_MS) {
      suppressClickRef.current = true;
      handleStepTap(touch.clientX, e.currentTarget);
      window.setTimeout(() => {
        suppressClickRef.current = false;
        blockMouseScrubRef.current = false;
      }, 400);
      return;
    }

    window.setTimeout(() => {
      blockMouseScrubRef.current = false;
    }, 400);
  };

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (suppressClickRef.current || blockMouseScrubRef.current) return;
    if (useTapStepNavigation) {
      handleStepTap(e.clientX, e.currentTarget);
      return;
    }
    if (gallery.length > 1) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const third = rect.width / 3;
      if (x < third) {
        stepPhoto(-1);
        return;
      }
      if (x > third * 2) {
        stepPhoto(1);
        return;
      }
    }
    onClick?.();
  };

  if (gallery.length === 0) {
    return <div className={`bg-gray-100 ${className}`} />;
  }

  return (
    <div
      className={`relative z-0 h-full w-full max-w-full overflow-hidden [touch-action:manipulation] select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'ArrowLeft') {
                e.preventDefault();
                stepPhoto(-1);
              } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                stepPhoto(1);
              } else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={
        onClick
          ? `${alt}. Tap left or right to change photo, center to open.`
          : `${alt}. Tap left or right to change photo.`
      }
    >
      {gallery.length > 1 && (
        <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex gap-1">
          {gallery.map((photo, index) => (
            <div key={`${photo}-progress-${index}`} className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-white/35">
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
        <div
          className={`pointer-events-none absolute z-10 rounded-full bg-black/50 px-2.5 py-1 backdrop-blur-sm ${counterClassName}`}
        >
          <span className="text-xs font-medium text-white">
            {activeIndex + 1} / {gallery.length}
          </span>
        </div>
      )}

      {gallery.map((photo, index) => (
        <img
          key={`${photo}-${index}`}
          src={photo}
          alt={index === activeIndex ? alt : ''}
          draggable={false}
          loading={index === 0 ? 'eager' : 'lazy'}
          className="pointer-events-none absolute inset-0 h-full w-full max-w-full select-none object-cover object-center ease-in-out"
          style={{
            opacity: index === activeIndex ? 1 : 0,
            transition: `opacity ${FADE_MS}ms ease-in-out`,
          }}
        />
      ))}
    </div>
  );
}
