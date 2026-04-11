import { useEffect, useMemo, useState } from 'react';

interface HoverPhotoGalleryProps {
  photos: string[];
  alt: string;
  className?: string;
}

export default function HoverPhotoGallery({ photos, alt, className = '' }: HoverPhotoGalleryProps) {
  const gallery = useMemo(() => Array.from(new Set(photos.filter(Boolean))).slice(0, 3), [photos]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const slideDurationMs = 1800;

  useEffect(() => {
    if (!isHovering || gallery.length <= 1) return;

    const timeout = window.setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % gallery.length);
    }, slideDurationMs);

    return () => window.clearTimeout(timeout);
  }, [activeIndex, gallery.length, isHovering]);

  useEffect(() => {
    if (!isHovering) {
      setActiveIndex(0);
    }
  }, [isHovering]);

  if (gallery.length === 0) {
    return <div className={`bg-gray-100 ${className}`} />;
  }

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {gallery.length > 1 && (
        <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex gap-1.5">
          {gallery.map((photo, index) => (
            <div key={`${photo}-progress`} className="h-1 flex-1 overflow-hidden rounded-full bg-white/35">
              <div
                className="h-full rounded-full bg-white/95 transition-[width] ease-linear"
                style={{
                  width: index < activeIndex ? '100%' : index === activeIndex && isHovering ? '100%' : '0%',
                  transitionDuration: index === activeIndex ? `${slideDurationMs}ms` : '200ms',
                }}
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
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            index === activeIndex ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
    </div>
  );
}
