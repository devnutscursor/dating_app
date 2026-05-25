import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCachedQuery } from '@/hooks/useCachedQuery';
import { CACHE } from '@/lib/cacheKeys';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import VideoCallConfirmModal from '@/components/modals/VideoCallConfirmModal';
import { useCall } from '@/contexts/CallContext';
import { useCallPricing } from '@/lib/callPricing';
import DiscoverProfileCardImage from '@/components/profile/DiscoverProfileCardImage';
import DiscoverCardActionButtons from '@/components/profile/DiscoverCardActionButtons';
import { formatProfileLocation } from '@/lib/formatProfileLocation';
import { fetchOnlineUsers } from '@/lib/social';
import { subscribePresenceChanged } from '@/lib/chatSocket';
import { createOrGetChat } from '@/lib/chats';
import { profileReturnState } from '@/lib/profileNavigation';
import type { User } from '@/types';

export default function ManOnline() {
  const navigate = useNavigate();
  const location = useLocation();
  const profileNavState = profileReturnState(location.pathname + location.search);
  const { user: me } = useAuth();
  const {
    data: users = [],
    setData: setUsers,
    showInitialLoading: loading,
    refresh: refreshOnline,
  } = useCachedQuery<User[]>({
    cacheKey: CACHE.online,
    fetcher: fetchOnlineUsers,
    userId: me?.id,
  });
  const callPricing = useCallPricing();
  const { initiateCall, callStatus } = useCall();
  const [videoConfirmUserId, setVideoConfirmUserId] = useState<string | null>(null);
  const [videoCallBusy, setVideoCallBusy] = useState(false);
  const [openingChatUserId, setOpeningChatUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribePresenceChanged((payload) => {
      if (payload.isOnline) {
        void refreshOnline(true);
      } else {
        setUsers((prev) => (prev ?? []).filter((u) => u.id !== payload.userId));
      }
    });
    const onFocus = () => void refreshOnline(true);
    window.addEventListener('focus', onFocus);
    const poll = window.setInterval(() => void refreshOnline(true), 60_000);
    return () => {
      unsub();
      window.removeEventListener('focus', onFocus);
      clearInterval(poll);
    };
  }, [refreshOnline, setUsers]);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Online Now</h1>
        <p className="text-gray-500">{loading ? 'Loading…' : `${users.length} people are online`}</p>
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center text-gray-500">Loading…</div>
      ) : users.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <div className="h-10 w-10 rounded-full bg-gray-400" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">No one is online</h3>
          <p className="text-gray-500">Check back later or browse all profiles</p>
          <Link to="/man/home" className="mt-4 inline-block">
            <Button className="bg-green-500 hover:bg-green-600">Browse all</Button>
          </Link>
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
                  user.isOnline ? (
                    <div className="flex items-center gap-1.5 rounded-full bg-green-500 px-2 py-1">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
                      <span className="text-xs font-medium text-white">Online</span>
                    </div>
                  ) : null
                }
                bottomActions={
                  <DiscoverCardActionButtons
                    onMessage={(e) => {
                      e.stopPropagation();
                      void openChatWith(user);
                    }}
                    onVideo={(e) => {
                      e.stopPropagation();
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
                <Link to={`/man/view-profile/${user.id}`} state={profileNavState.state}>
                  <h3 className="font-semibold text-gray-900 transition-colors hover:text-green-600">
                    {user.name}, {user.age}
                  </h3>
                </Link>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <MapPin className="h-4 w-4" />
                  <span>{formatProfileLocation(user.city, user.country) || 'Location not set'}</span>
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
