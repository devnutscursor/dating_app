import { useCallback, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCachedQuery } from '@/hooks/useCachedQuery';
import { CACHE } from '@/lib/cacheKeys';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useCall } from '@/contexts/CallContext';
import DiscoverProfileCardImage from '@/components/profile/DiscoverProfileCardImage';
import DiscoverCardActionButtons from '@/components/profile/DiscoverCardActionButtons';
import { formatProfileLocation } from '@/lib/formatProfileLocation';
import { fetchDiscoverUsers, sendLike } from '@/lib/social';
import AppliedSearchFiltersBar from '@/components/AppliedSearchFiltersBar';
import { useSearchFilters } from '@/contexts/SearchFiltersContext';
import { createOrGetChat } from '@/lib/chats';
import { profileReturnState } from '@/lib/profileNavigation';
import type { User } from '@/types';

export default function WomanHome() {
  const navigate = useNavigate();
  const location = useLocation();
  const profileNavState = profileReturnState(location.pathname + location.search);
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
  const { initiateCall, callStatus } = useCall();
  const [videoCallUserId, setVideoCallUserId] = useState<string | null>(null);
  const [openingChatUserId, setOpeningChatUserId] = useState<string | null>(null);

  const loadDiscover = useCallback(async () => {
    try {
      await refreshDiscover(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not load discover');
    }
  }, [refreshDiscover]);

  const startVideoCall = async (user: User) => {
    if (callStatus !== 'idle') return;
    setVideoCallUserId(user.id);
    try {
      const chat = await createOrGetChat(user.id);
      await initiateCall(user.id, chat.id, 'video', user.name, user.profilePicture);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not start video call');
    } finally {
      setVideoCallUserId(null);
    }
  };

  const openChatWith = async (user: User) => {
    setOpeningChatUserId(user.id);
    try {
      const chat = await createOrGetChat(user.id);
      navigate(`/woman/chats/${chat.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not open chat');
    } finally {
      setOpeningChatUserId(null);
    }
  };

  const handleQuickLike = async (user: User) => {
    try {
      const res = await sendLike(user.id);
      toast.success(res.liked ? 'Like sent' : 'Like removed');
      setUsers((prev) =>
        (prev ?? []).map((u) => (u.id === user.id ? { ...u, likedByMe: res.liked } : u))
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not update like');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Discover</h1>
        <Link to="/woman/swipes">
          <Button variant="outline" className="gap-2">
            <Heart className="h-4 w-4" />
            Swipe Mode
          </Button>
        </Link>
      </div>

      <AppliedSearchFiltersBar resultCount={users.length} loading={loading} />

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center text-gray-500">Loading people…</div>
      ) : users.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-6 py-16 text-center">
          <p className="text-lg font-medium text-gray-900">No profiles to show yet</p>
          <p className="mt-2 text-sm text-gray-600">
            When more members join—or after you have liked everyone in view—new people will appear here.
          </p>
          <Button type="button" variant="outline" className="mt-6" onClick={() => void loadDiscover()}>
            Refresh
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {users.map((user) => (
            <div key={user.id} className="rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md">
              <DiscoverProfileCardImage
                user={user}
                profilePath={`/woman/view-profile/${user.id}`}
                profileState={profileNavState}
                topLeft={
                  <div className="flex items-center gap-1.5 rounded-full bg-black/50 px-2 py-1 backdrop-blur-sm">
                    <div
                      className={`h-2 w-2 rounded-full ${user.isOnline ? 'animate-pulse bg-green-500' : 'bg-gray-400'}`}
                    />
                    <span className="text-xs font-medium text-white">{user.isOnline ? 'Online' : 'Offline'}</span>
                  </div>
                }
                bottomActions={
                  <DiscoverCardActionButtons
                    liked={Boolean(user.likedByMe)}
                    onLike={() => void handleQuickLike(user)}
                    onMessage={() => void openChatWith(user)}
                    onVideo={() => void startVideoCall(user)}
                    messageDisabled={openingChatUserId === user.id}
                    videoDisabled={callStatus !== 'idle' || videoCallUserId === user.id}
                    messageLabel={`Message ${user.name}`}
                    videoLabel={`Video call ${user.name}`}
                  />
                }
              />

              <div className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <Link to={`/woman/view-profile/${user.id}`} state={profileNavState.state}>
                    <h3 className="font-semibold text-gray-900 transition-colors hover:text-green-600">
                      {user.name}, {user.age}
                    </h3>
                  </Link>
                </div>
                <div className="mb-2 flex items-center gap-1 text-sm text-gray-500">
                  <MapPin className="h-4 w-4" />
                  <span>{formatProfileLocation(user.city, user.country) || 'Location not set'}</span>
                </div>
                <p className="line-clamp-2 text-sm text-gray-600">{user.aboutMe?.trim() || '—'}</p>

                <div className="mt-3 flex flex-wrap gap-1">
                  {(user.interests ?? []).slice(0, 3).map((interest, i) => (
                    <span key={i} className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                      {interest}
                    </span>
                  ))}
                  {(user.interests ?? []).length > 3 && (
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                      +{(user.interests ?? []).length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
