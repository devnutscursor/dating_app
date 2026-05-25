import { useCallback, useMemo, useState } from 'react';
import type { MouseEvent } from 'react';

interface HoverPhotoGalleryProps {
  photos: string[];
  alt: string;
  className?: string;
  maxPhotos?: number;
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  onClick?: () => void;
}

export default function HoverPhotoGallery({
  photos,
  alt,
  className = '',
  maxPhotos = 10,
  activeIndex: controlledIndex,
  onActiveIndexChange,
  onClick,
}: HoverPhotoGalleryProps) {
  const gallery = useMemo(
    () => Array.from(new Set(photos.filter(Boolean))).slice(0, maxPhotos),
    [photos, maxPhotos]
  );
  const [internalIndex, setInternalIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const activeIndex = controlledIndex ?? internalIndex;

  const setActiveIndex = useCallback(
    (index: number) => {
      if (gallery.length === 0) return;
      const next = Math.max(0, Math.min(index, gallery.length - 1));
      if (controlledIndex === undefined) setInternalIndex(next);
      onActiveIndexChange?.(next);
    },
    [controlledIndex, gallery.length, onActiveIndexChange]
  );

  const updateIndexFromPointer = useCallback(
    (clientX: number, target: HTMLDivElement) => {
      if (gallery.length <= 1) return;
      const rect = target.getBoundingClientRect();
      const width = rect.width || 1;
      const x = Math.max(0, Math.min(clientX - rect.left, width));
      const zone = Math.min(gallery.length - 1, Math.floor((x / width) * gallery.length));
      setActiveIndex(zone);
    },
    [gallery.length, setActiveIndex]
  );

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    updateIndexFromPointer(e.clientX, e.currentTarget);
  };

  const handleMouseEnter = (e: MouseEvent<HTMLDivElement>) => {
    setIsHovering(true);
    updateIndexFromPointer(e.clientX, e.currentTarget);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setActiveIndex(0);
  };

  if (gallery.length === 0) {
    return <div className={`bg-gray-100 ${className}`} />;
  }

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${onClick ? 'cursor-pointer' : ''} ${className}`}
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
        <div
          className={`pointer-events-none absolute inset-x-3 top-3 z-10 flex gap-1 transition-opacity duration-200 ${
            isHovering ? 'opacity-100' : 'opacity-70'
          }`}
        >
          {gallery.map((photo, index) => (
            <div key={`${photo}-progress-${index}`} className="h-1 flex-1 overflow-hidden rounded-full bg-white/35">
              <div
                className="h-full rounded-full bg-white/95 transition-[width] duration-150 ease-out"
                style={{ width: index === activeIndex ? '100%' : index < activeIndex ? '100%' : '0%' }}
              />
            </div>
          ))}
        </div>
      )}

      {gallery.map((photo, index) => (
        <img
          key={`${photo}-${index}`}
          src={photo}
          alt={alt}
          draggable={false}
          className={`pointer-events-none absolute inset-0 h-full w-full select-none object-cover transition-opacity duration-300 ${
            index === activeIndex ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
    </div>
  );
}
