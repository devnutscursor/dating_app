import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCachedQuery } from '@/hooks/useCachedQuery';
import { CACHE } from '@/lib/cacheKeys';
import { Link } from 'react-router-dom';
import { X, Heart, Star, MapPin, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import HoverPhotoGallery from '@/components/HoverPhotoGallery';
import { formatProfileLocation } from '@/lib/formatProfileLocation';
import AppliedSearchFiltersBar from '@/components/AppliedSearchFiltersBar';
import { useSearchFilters } from '@/contexts/SearchFiltersContext';
import { fetchDiscoverUsers, sendLike, toggleFavorite, userGalleryPhotos } from '@/lib/social';
import { cn } from '@/lib/utils';
import type { User } from '@/types';

export default function WomanSwipes() {
  const { user: me } = useAuth();
  const { filters, userIdSearch, version } = useSearchFilters();
  const discoverKey = useMemo(
    () => CACHE.discover(filters, userIdSearch, version),
    [filters, userIdSearch, version]
  );
  const fetchDiscover = useCallback(
    () =>
      fetchDiscoverUsers({
        ...filters,
        userId: userIdSearch || undefined,
      }),
    [filters, userIdSearch]
  );
  const {
    data: users = [],
    setData: setUsers,
    showInitialLoading: loading,
    refresh: refreshDiscover,
  } = useCachedQuery<User[]>({
    cacheKey: discoverKey,
    fetcher: fetchDiscover,
    userId: me?.id,
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);

  useEffect(() => {
    setCurrentIndex(0);
  }, [discoverKey]);

  const currentUser = users[currentIndex];

  const handleFavorite = () => {
    if (!currentUser) return;
    const id = currentUser.id;
    const wasFavorited = Boolean(currentUser.favoritedByMe);
    void toggleFavorite(id)
      .then((res) => {
        toast.success(res.favorited ? 'Added to favorites' : 'Removed from favorites');
        setUsers((prev) =>
          (prev ?? []).map((u) => (u.id === id ? { ...u, favoritedByMe: res.favorited } : u))
        );
        if (res.favorited && !wasFavorited) {
          setCurrentIndex((i) => (i < users.length - 1 ? i + 1 : i));
        }
      })
      .catch((e) => {
        toast.error(e instanceof Error ? e.message : 'Could not update favorites');
      });
  };

  const handleSwipe = (dir: 'left' | 'right') => {
    if (!currentUser) return;
    const id = currentUser.id;
    setDirection(dir);
    const advanceDeck = () => {
      setDirection(null);
      setUsers((prev) => (prev ?? []).filter((u) => u.id !== id));
      setCurrentIndex(0);
    };
    if (dir === 'left') {
      setTimeout(advanceDeck, 300);
      return;
    }
    void sendLike(id)
      .then((res) => {
        if (res.liked) toast('Like sent');
        setTimeout(advanceDeck, 300);
      })
      .catch((e) => {
        toast.error(e instanceof Error ? e.message : 'Like failed');
        setDirection(null);
      });
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        Loading…
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-lg font-medium text-gray-900">You are all caught up</p>
        <p className="max-w-sm text-sm text-gray-600">
          There is no one new around you right now. Check back later or open Discover to browse the grid.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => void refreshDiscover(false)}
            className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            Refresh list
          </button>
          <Link
            to="/woman/home"
            className="rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            Discover
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 flex items-center gap-4">
        <Link to="/woman/home" className="-ml-2 rounded-full p-2 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Discover</h1>
      </div>

      <AppliedSearchFiltersBar resultCount={users.length} loading={loading} />

      <div className="flex flex-1 items-center justify-center p-4">
        <div
          className={`relative w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl transition-transform duration-300 ${
            direction === 'left'
              ? '-translate-x-full rotate-[-10deg] opacity-0'
              : direction === 'right'
                ? 'translate-x-full rotate-[10deg] opacity-0'
                : ''
          }`}
        >
          <div className="relative aspect-[3/4]">
            <HoverPhotoGallery photos={userGalleryPhotos(currentUser)} alt={currentUser.name} className="h-full w-full" />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

            <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1 backdrop-blur-sm">
              <div
                className={`h-2 w-2 rounded-full ${currentUser.isOnline ? 'animate-pulse bg-green-500' : 'bg-gray-400'}`}
              />
              <span className="text-xs font-medium text-white">
                {currentUser.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>

            <div className="pointer-events-none absolute bottom-0 left-0 right-0 p-6 text-white">
              <h2 className="mb-1 text-3xl font-bold">
                {currentUser.name}, {currentUser.age}
              </h2>
              <div className="mb-3 flex items-center gap-1 text-white/80">
                <MapPin className="h-4 w-4" />
                <span>{formatProfileLocation(currentUser.city, currentUser.country) || '—'}</span>
              </div>
              <p className="line-clamp-2 text-sm text-white/70">{currentUser.aboutMe?.trim() || '—'}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {(currentUser.interests ?? []).slice(0, 3).map((interest, i) => (
                  <span key={i} className="rounded-full bg-white/20 px-2 py-1 text-xs backdrop-blur-sm">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 p-6">
        <button
          type="button"
          onClick={() => handleSwipe('left')}
          className="flex h-16 w-16 items-center justify-center rounded-full border border-gray-200 bg-white shadow-lg transition-colors hover:bg-gray-50"
          aria-label="Pass"
        >
          <X className="h-8 w-8 text-red-500" />
        </button>

        <button
          type="button"
          onClick={() => handleSwipe('right')}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500 shadow-lg transition-colors hover:bg-green-600"
          aria-label="Like"
        >
          <Heart className="h-10 w-10 fill-white text-white" />
        </button>

        <button
          type="button"
          onClick={handleFavorite}
          className={cn(
            'flex h-16 w-16 items-center justify-center rounded-full border shadow-lg transition-colors',
            currentUser.favoritedByMe
              ? 'border-amber-300 bg-amber-50 hover:bg-amber-100'
              : 'border-gray-200 bg-white hover:bg-gray-50'
          )}
          aria-label={currentUser.favoritedByMe ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={Boolean(currentUser.favoritedByMe)}
        >
          <Star
            className={cn(
              'h-8 w-8',
              currentUser.favoritedByMe ? 'fill-amber-400 text-amber-500' : 'text-amber-500'
            )}
          />
        </button>
      </div>

      <div className="flex justify-center gap-1 pb-4">
        {users.map((_, i) => (
          <div key={i} className={`h-2 w-2 rounded-full ${i === currentIndex ? 'bg-green-500' : 'bg-gray-300'}`} />
        ))}
      </div>
    </div>
  );
}
