import { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import VideoCallConfirmModal from '@/components/modals/VideoCallConfirmModal';
import DiscoverProfileCardImage from '@/components/profile/DiscoverProfileCardImage';
import DiscoverCardActionButtons from '@/components/profile/DiscoverCardActionButtons';
import { useCall } from '@/contexts/CallContext';
import { useCallPricing } from '@/lib/callPricing';
import { formatProfileLocation } from '@/lib/formatProfileLocation';
import { fetchDiscoverUsers, sendLike } from '@/lib/social';
import AppliedSearchFiltersBar from '@/components/AppliedSearchFiltersBar';
import { useSearchFilters } from '@/contexts/SearchFiltersContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCachedQuery } from '@/hooks/useCachedQuery';
import { CACHE } from '@/lib/cacheKeys';
import { createOrGetChat } from '@/lib/chats';
import { profileReturnState } from '@/lib/profileNavigation';
import type { User } from '@/types';

export default function ManHome() {
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
  const callPricing = useCallPricing();
  const { initiateCall, callStatus } = useCall();
  const [videoConfirmUserId, setVideoConfirmUserId] = useState<string | null>(null);
  const [videoCallBusy, setVideoCallBusy] = useState(false);
  const [openingChatUserId, setOpeningChatUserId] = useState<string | null>(null);

  const loadDiscover = useCallback(async () => {
    try {
      await refreshDiscover(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not load discover');
    }
  }, [refreshDiscover]);

  const videoPeer = videoConfirmUserId ? users.find((u) => u.id === videoConfirmUserId) : undefined;

  const startVideoCall = async () => {
    if (!videoPeer || videoCallBusy || callStatus !== 'idle') return;
    setVideoCallBusy(true);
    try {
      const chat = await createOrGetChat(videoPeer.id);
      await initiateCall(videoPeer.id, chat.id, 'video', videoPeer.name, videoPeer.profilePicture);
      setVideoConfirmUserId(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not start video call');
    } finally {
      setVideoCallBusy(false);
    }
  };

  const openChatWith = async (user: User) => {
    setOpeningChatUserId(user.id);
    try {
      const chat = await createOrGetChat(user.id);
      navigate(`/man/chats/${chat.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not open chat');
    } finally {
      setOpeningChatUserId(null);
    }
  };

  const handleQuickLike = async (user: User) => {
    try {
      const res = await sendLike(user.id);
      toast.success(res.alreadyLiked ? 'Already liked' : 'Like sent');
      if (!res.alreadyLiked) setUsers((prev) => (prev ?? []).filter((u) => u.id !== user.id));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not send like');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Discover</h1>
        <Link to="/man/swipes">
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
                profilePath={`/man/view-profile/${user.id}`}
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
                    onLike={(e) => {
                      e.stopPropagation();
                      void handleQuickLike(user);
                    }}
                    onMessage={(e) => {
                      e.stopPropagation();
                      void openChatWith(user);
                    }}
                    onVideo={(e) => {
                      e.stopPropagation();
                      if (callStatus !== 'idle') {
                        toast.message('Finish or end your current call first');
                        return;
                      }
                      setVideoConfirmUserId(user.id);
                    }}
                    messageDisabled={openingChatUserId === user.id}
                    videoDisabled={callStatus !== 'idle'}
                    messageLabel={`Message ${user.name}`}
                    videoLabel={`Video call ${user.name}`}
                  />
                }
              />

              <div className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <Link to={`/man/view-profile/${user.id}`} state={profileNavState.state}>
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

      <VideoCallConfirmModal
        open={Boolean(videoConfirmUserId)}
        onClose={() => !videoCallBusy && setVideoConfirmUserId(null)}
        onConfirm={() => void startVideoCall()}
        peerName={videoPeer?.name}
        peerPicture={videoPeer?.profilePicture}
        busy={videoCallBusy}
        callType="video"
        audioRate={callPricing.audioCallPerMinute}
        videoRate={callPricing.videoCallPerMinute}
      />
    </div>
  );
}
