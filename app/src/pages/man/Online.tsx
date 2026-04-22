import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, MessageCircle, Video } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import VideoCallModal from '@/components/modals/VideoCallModal';
import HoverPhotoGallery from '@/components/HoverPhotoGallery';
import { formatProfileLocation } from '@/lib/formatProfileLocation';
import { fetchOnlineUsers, userGalleryPhotos } from '@/lib/social';
import { createOrGetChat } from '@/lib/chats';
import type { User } from '@/types';

export default function ManOnline() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
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

  const videoPeer = videoCallUserId ? users.find((u) => u.id === videoCallUserId) : undefined;

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
            <div key={user.id} className="overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md">
              <div className="relative aspect-[3/4]">
                <HoverPhotoGallery photos={userGalleryPhotos(user)} alt={user.name} className="h-full w-full" />

                <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-green-500 px-2 py-1">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
                  <span className="text-xs font-medium text-white">Online</span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      disabled={openingChatUserId === user.id}
                      onClick={() => void openChatWith(user)}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-colors hover:bg-white/30 disabled:opacity-50"
                      aria-label={`Message ${user.name}`}
                    >
                      <MessageCircle className="h-5 w-5 text-white" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoCallUserId(user.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 transition-colors hover:bg-green-600"
                      aria-label={`Video call ${user.name}`}
                    >
                      <Video className="h-5 w-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <Link to={`/man/view-profile/${user.id}`}>
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

      <VideoCallModal
        open={Boolean(videoCallUserId)}
        onClose={() => setVideoCallUserId(null)}
        userId={videoCallUserId || users[0]?.id || ''}
        peerName={videoPeer?.name}
        peerPicture={videoPeer?.profilePicture}
      />
    </div>
  );
}
