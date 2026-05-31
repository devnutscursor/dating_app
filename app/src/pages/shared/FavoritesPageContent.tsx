import { Link, useLocation } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatProfileLocation } from '@/lib/formatProfileLocation';
import { profileReturnState } from '@/lib/profileNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { useFavoritesPage } from '@/hooks/useFavoritesPage';
import { toggleFavorite } from '@/lib/social';
import { toast } from 'sonner';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400';

type FavoritesPageContentProps = {
  area: 'man' | 'woman';
};

export default function FavoritesPageContent({ area }: FavoritesPageContentProps) {
  const location = useLocation();
  const { user: me } = useAuth();
  const profileNavState = profileReturnState(location.pathname + location.search);
  const { users, count, showInitialLoading, refresh } = useFavoritesPage(me?.id);
  const homePath = `/${area}/home`;
  const profilePrefix = `/${area}/view-profile`;

  const handleRemove = async (userId: string) => {
    try {
      const res = await toggleFavorite(userId);
      if (!res.favorited) {
        toast.success('Removed from favorites');
        await refresh(true);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not update favorites');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Favorites</h1>
        <p className="text-gray-500">
          Profiles you saved with the star in Swipe mode
          {count > 0 ? ` · ${count}` : ''}
        </p>
      </div>

      {showInitialLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center text-gray-500">Loading…</div>
      ) : users.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-14 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <Star className="h-8 w-8 text-amber-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No favorites yet</h3>
          <p className="mt-2 text-sm text-gray-600">
            Tap the star while swiping to save someone here for quick access later.
          </p>
          <Link to={`/${area}/swipes`} className="mt-4 mr-2 inline-block">
            <Button variant="outline">Open Swipe mode</Button>
          </Link>
          <Link to={homePath} className="mt-4 inline-block">
            <Button className="bg-green-500 hover:bg-green-600">Discover people</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <div key={user.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="relative aspect-square">
                <img
                  src={user.profilePicture || FALLBACK_IMG}
                  alt={user.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="pointer-events-none absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-400">
                  <Star className="h-5 w-5 fill-white text-white" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">
                  {user.name}, {user.age}
                </h3>
                <p className="mb-3 text-sm text-gray-500">
                  {formatProfileLocation(user.city, user.country) || 'Location not set'}
                </p>
                <div className="flex flex-col gap-2">
                  <Link to={`${profilePrefix}/${user.id}`} state={profileNavState.state}>
                    <Button variant="outline" className="w-full gap-2">
                      View profile
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-gray-600"
                    onClick={() => void handleRemove(user.id)}
                  >
                    Remove from favorites
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
