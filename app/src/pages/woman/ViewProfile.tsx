import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePublicProfile } from '@/hooks/usePublicProfile';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, MessageCircle, Video, Lock, Image as ImageIcon, Coins } from 'lucide-react';
import HoverPhotoGallery from '@/components/HoverPhotoGallery';
import DiscoverOnlineBadge from '@/components/profile/DiscoverOnlineBadge';
import ProfileBackLink from '@/components/profile/ProfileBackLink';
import ProfileLikeButton from '@/components/profile/ProfileLikeButton';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import UnlockContentModal from '@/components/modals/UnlockContentModal';
import MediaPreviewModal from '@/components/modals/MediaPreviewModal';
import { formatProfileLocation } from '@/lib/formatProfileLocation';
import ProfileMediaPrivacyLayout from '@/components/profile/ProfileMediaPrivacyLayout';
import {
  isPhotoVisibleToViewer,
  isVideoVisibleToViewer,
  lockedPhotoPlaceholder,
  mediaPrivacyCounts,
} from '@/lib/profileMedia';
import type { Photo, Video as VideoMedia } from '@/types';
import { createOrGetChat } from '@/lib/chats';
import { useCall } from '@/contexts/CallContext';
const FALLBACK_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400';

type PreviewState =
  | { kind: 'photo'; photoUrl: string }
  | { kind: 'video'; videoUrl: string; posterUrl?: string };

export default function WomanViewProfile() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { user: me } = useAuth();
  const { data: user, showInitialLoading: loading } = usePublicProfile(userId, me?.id);
  const loadError = !loading && !user && userId ? 'Failed to load profile' : null;
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [unlockModal, setUnlockModal] = useState<{ open: boolean; type: 'photo' | 'video'; price: number }>({
    open: false,
    type: 'photo',
    price: 100,
  });
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [messageBusy, setMessageBusy] = useState(false);
  const [videoCallBusy, setVideoCallBusy] = useState(false);
  const { initiateCall, callStatus } = useCall();

  useEffect(() => {
    setActivePhotoIndex(0);
  }, [userId]);

  if (!userId) {
    return (
      <div className="flex h-full min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
        <p className="text-gray-600">Missing profile</p>
        <ProfileBackLink area="woman" className="text-green-600 hover:underline" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full min-h-[40vh] items-center justify-center text-gray-500">
        Loading profile…
      </div>
    );
  }

  if (loadError || !user) {
    return (
      <div className="flex h-full min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
        <p className="text-gray-600">{loadError || 'User not found'}</p>
        <ProfileBackLink area="woman" className="text-green-600 hover:underline" />
      </div>
    );
  }

  const galleryUrls = [user.profilePicture, ...user.photos.map((p) => p.url)].filter((u): u is string => Boolean(u));
  const allPhotos = galleryUrls.length ? galleryUrls : [FALLBACK_AVATAR];
  const photoCounts = mediaPrivacyCounts(user.photos);
  const videoCounts = mediaPrivacyCounts(user.videos);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <ProfileBackLink area="woman" />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Photo Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-gray-100">
            <HoverPhotoGallery
              photos={allPhotos}
              alt={user.name}
              className="h-full w-full cursor-zoom-in"
              showCounter
              activeIndex={activePhotoIndex}
              onActiveIndexChange={setActivePhotoIndex}
              onClick={() => setPreview({ kind: 'photo', photoUrl: allPhotos[activePhotoIndex] })}
            />

            <div className="pointer-events-none absolute left-4 top-6 z-10 sm:top-[1.625rem]">
              <DiscoverOnlineBadge isOnline={Boolean(user.isOnline)} />
            </div>

          </div>

          <div className="flex gap-2 overflow-x-auto overflow-y-visible py-1 pb-2">
            {allPhotos.map((photo, i) => (
              <button
                type="button"
                key={i}
                onClick={() => setActivePhotoIndex(i)}
                className={`box-border h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                  i === activePhotoIndex ? 'border-green-500' : 'border-transparent'
                }`}
              >
                <img src={photo} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{user.name}, {user.age}</h1>
            <div className="flex items-center gap-1 text-gray-500 mt-2">
              <MapPin className="w-5 h-5" />
              <span>{formatProfileLocation(user.city, user.country) || 'Location not set'}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              className="flex-1 gap-2 bg-green-500 hover:bg-green-600"
              disabled={messageBusy}
              onClick={() => {
                setMessageBusy(true);
                void createOrGetChat(user.id)
                  .then((chat) => navigate(`/woman/chats/${chat.id}`))
                  .catch((e) => toast.error(e instanceof Error ? e.message : 'Could not open chat'))
                  .finally(() => setMessageBusy(false));
              }}
            >
              <MessageCircle className="h-5 w-5" />
              {messageBusy ? 'Opening…' : 'Message'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 gap-2"
              disabled={videoCallBusy || callStatus !== 'idle' || !user}
              onClick={() => {
                if (!user) return;
                setVideoCallBusy(true);
                void createOrGetChat(user.id)
                  .then((chat) =>
                    initiateCall(user.id, chat.id, 'video', user.name, user.profilePicture)
                  )
                  .catch((e) =>
                    toast.error(e instanceof Error ? e.message : 'Could not start video call')
                  )
                  .finally(() => setVideoCallBusy(false));
              }}
            >
              <Video className="w-5 h-5" />
              {videoCallBusy ? 'Starting…' : 'Video Call'}
            </Button>
            {userId ? <ProfileLikeButton userId={userId} /> : null}
          </div>

          {/* About */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">About</h3>
            <p className="text-gray-600">{user.aboutMe?.trim() || '—'}</p>
          </div>

          {/* Looking For */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Looking For</h3>
            <p className="text-gray-600">{user.lookingFor?.trim() || '—'}</p>
          </div>

          {/* Interests */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {(user.interests ?? []).map((interest, i) => (
                <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Media Tabs */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-100">
              <button
                type="button"
                onClick={() => setActiveTab('photos')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'photos' ? 'text-green-600 bg-green-50' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                Photos ({photoCounts.total})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('videos')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'videos' ? 'text-green-600 bg-green-50' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Video className="w-4 h-4" />
                Videos ({videoCounts.total})
              </button>
            </div>

            <div className="p-4">
              {activeTab === 'photos' && photoCounts.total > 0 ? (
                <p className="mb-3 text-xs text-gray-500">
                  {photoCounts.publicCount} public · {photoCounts.privateCount} private
                </p>
              ) : null}
              {activeTab === 'videos' && videoCounts.total > 0 ? (
                <p className="mb-3 text-xs text-gray-500">
                  {videoCounts.publicCount} public · {videoCounts.privateCount} private
                </p>
              ) : null}

              {activeTab === 'photos' ? (
                <ProfileMediaPrivacyLayout
                  items={user.photos}
                  mediaKind="photo"
                  renderItem={(photo: Photo) => {
                    const canView = isPhotoVisibleToViewer(photo);
                    return (
                      <div key={photo.id || photo.url} className="relative aspect-square overflow-hidden rounded-lg">
                        {canView ? (
                          <button
                            type="button"
                            onClick={() => setPreview({ kind: 'photo', photoUrl: photo.url })}
                            className="h-full w-full border-0 p-0"
                            aria-label="Open photo preview"
                          >
                            <img src={photo.url} alt="" className="h-full w-full object-cover" />
                          </button>
                        ) : (
                          <>
                            <img src={lockedPhotoPlaceholder()} alt="" className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() =>
                                setUnlockModal({ open: true, type: 'photo', price: photo.unlockPrice || 100 })
                              }
                              className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white"
                            >
                              <Lock className="mb-1 h-6 w-6" />
                              <span className="flex items-center gap-1 text-xs">
                                <Coins className="h-3 w-3" />
                                {photo.unlockPrice ?? 100}
                              </span>
                            </button>
                          </>
                        )}
                      </div>
                    );
                  }}
                />
              ) : (
                <ProfileMediaPrivacyLayout
                  items={user.videos}
                  mediaKind="video"
                  renderItem={(video: VideoMedia) => {
                    const canViewVideo = isVideoVisibleToViewer(video);
                    return (
                      <div
                        key={video.id || video.url}
                        className="relative aspect-square overflow-hidden rounded-lg bg-gray-100"
                      >
                        {canViewVideo ? (
                          <button
                            type="button"
                            onClick={() =>
                              setPreview({ kind: 'video', videoUrl: video.url, posterUrl: video.thumbnail })
                            }
                            className="relative h-full w-full border-0 p-0 text-left"
                            aria-label="Open video preview"
                          >
                            <img src={video.thumbnail} alt="" className="h-full w-full object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90">
                                <Video className="h-5 w-5 text-gray-700" />
                              </div>
                            </div>
                          </button>
                        ) : (
                          <>
                            <img src={lockedPhotoPlaceholder()} alt="" className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() =>
                                setUnlockModal({ open: true, type: 'video', price: video.unlockPrice || 500 })
                              }
                              className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white"
                            >
                              <Lock className="mb-1 h-6 w-6" />
                              <span className="flex items-center gap-1 text-xs">
                                <Coins className="h-3 w-3" />
                                {video.unlockPrice ?? 500}
                              </span>
                            </button>
                          </>
                        )}
                      </div>
                    );
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Unlock Modal */}
      <UnlockContentModal
        open={unlockModal.open}
        onClose={() => setUnlockModal({ ...unlockModal, open: false })}
        contentType={unlockModal.type}
        price={unlockModal.price}
        userName={user.name}
        onUnlock={() => setUnlockModal((m) => ({ ...m, open: false }))}
      />

      <MediaPreviewModal
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        kind={preview?.kind ?? 'photo'}
        imageUrl={preview?.kind === 'photo' ? preview.photoUrl : undefined}
        videoUrl={preview?.kind === 'video' ? preview.videoUrl : undefined}
        posterUrl={preview?.kind === 'video' ? preview.posterUrl : undefined}
      />
    </div>
  );
}
