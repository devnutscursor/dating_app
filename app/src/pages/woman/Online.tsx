import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useCall } from '@/contexts/CallContext';
import HoverPhotoGallery from '@/components/HoverPhotoGallery';
import DiscoverCardActionButtons from '@/components/profile/DiscoverCardActionButtons';
import { formatProfileLocation } from '@/lib/formatProfileLocation';
import { fetchOnlineUsers, userGalleryPhotos } from '@/lib/social';
import { subscribePresenceChanged } from '@/lib/chatSocket';
import { createOrGetChat } from '@/lib/chats';
import { profileReturnState } from '@/lib/profileNavigation';
import type { User } from '@/types';

export default function WomanOnline() {
  const navigate = useNavigate();
  const location = useLocation();
  const profileNavState = profileReturnState(location.pathname + location.search);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { initiateCall, callStatus } = useCall();
  const [videoCallUserId, setVideoCallUserId] = useState<string | null>(null);
  const [openingChatUserId, setOpeningChatUserId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchOnlineUsers();
      setUsers(list);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not load online members');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const unsub = subscribePresenceChanged((payload) => {
      if (payload.isOnline) {
        void load();
      } else {
        setUsers((prev) => prev.filter((u) => u.id !== payload.userId));
      }
    });
    const onFocus = () => void load();
    window.addEventListener('focus', onFocus);
    const poll = window.setInterval(() => void load(), 60_000);
    return () => {
      unsub();
      window.removeEventListener('focus', onFocus);
      clearInterval(poll);
    };
  }, [load]);

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
          <Link to="/woman/home" className="mt-4 inline-block">
            <Button className="bg-green-500 hover:bg-green-600">Browse all</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {users.map((user) => (
            <div key={user.id} className="rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md">
              <div className="relative aspect-[3/4] w-full">
                <div className="absolute inset-0 overflow-hidden rounded-t-2xl">
                  <HoverPhotoGallery photos={userGalleryPhotos(user)} alt={user.name} className="h-full w-full" />
                </div>

                {user.isOnline && (
                  <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-full bg-green-500 px-2 py-1 sm:left-3 sm:top-3">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
                    <span className="text-xs font-medium text-white">Online</span>
                  </div>
                )}

                <div className="pointer-events-none absolute bottom-2.5 left-2.5 right-2.5 z-20 rounded-lg bg-gradient-to-t from-black/85 via-black/45 to-transparent pb-2 pt-9 sm:bottom-3 sm:left-3 sm:right-3 sm:pb-2.5 sm:pt-10">
                  <div className="pointer-events-auto w-full min-w-0 max-w-full">
                    <DiscoverCardActionButtons
                      onMessage={() => void openChatWith(user)}
                      onVideo={() => void startVideoCall(user)}
                      messageDisabled={openingChatUserId === user.id}
                      videoDisabled={callStatus !== 'idle' || videoCallUserId === user.id}
                      messageLabel={`Message ${user.name}`}
                      videoLabel={`Video call ${user.name}`}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4">
                <Link to={`/woman/view-profile/${user.id}`} state={profileNavState.state}>
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

    </div>
  );
}
