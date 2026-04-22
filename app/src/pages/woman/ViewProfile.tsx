import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Heart, MessageCircle, Video, Lock, Image as ImageIcon, ChevronLeft, ChevronRight, Coins } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import UnlockContentModal from '@/components/modals/UnlockContentModal';
import MediaPreviewModal from '@/components/modals/MediaPreviewModal';
import { formatProfileLocation } from '@/lib/formatProfileLocation';
import { fetchPublicUser } from '@/lib/social';
import { createOrGetChat } from '@/lib/chats';
import type { User } from '@/types';

const FALLBACK_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400';

type PreviewState =
  | { kind: 'photo'; photoUrl: string }
  | { kind: 'video'; videoUrl: string; posterUrl?: string };

export default function WomanViewProfile() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [unlockModal, setUnlockModal] = useState<{ open: boolean; type: 'photo' | 'video'; price: number }>({
    open: false,
    type: 'photo',
    price: 100,
  });
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [messageBusy, setMessageBusy] = useState(false);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setLoadError('Missing profile');
      return;
    }
    let cancelled = false;
    setLoading(true);
    void fetchPublicUser(userId)
      .then((u) => {
        if (!cancelled) {
          setUser(u);
          setActivePhotoIndex(0);
          setLoadError(null);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setUser(null);
          setLoadError(e instanceof Error ? e.message : 'Failed to load profile');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

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
        <Link to="/woman/home" className="text-green-600 hover:underline">
          Back to Discover
        </Link>
      </div>
    );
  }

  const galleryUrls = [user.profilePicture, ...user.photos.map((p) => p.url)].filter((u): u is string => Boolean(u));
  const allPhotos = galleryUrls.length ? galleryUrls : [FALLBACK_AVATAR];

  const nextPhoto = () => {
    setActivePhotoIndex((prev) => (prev + 1) % allPhotos.length);
  };

  const prevPhoto = () => {
    setActivePhotoIndex((prev) => (prev - 1 + allPhotos.length) % allPhotos.length);
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link to="/woman/home" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-5 h-5" />
        Back to Discover
      </Link>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Photo Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-gray-100">
            <button
              type="button"
              onClick={() => setPreview({ kind: 'photo', photoUrl: allPhotos[activePhotoIndex] })}
              className="relative block h-full w-full cursor-zoom-in border-0 p-0 text-left"
              aria-label="Open photo preview"
            >
              <img src={allPhotos[activePhotoIndex]} alt={user.name} className="h-full w-full object-cover" />
            </button>

            {/* Navigation */}
            {allPhotos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevPhoto}
                  className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={nextPhoto}
                  className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Online / offline status */}
            <div className="absolute left-4 top-4 z-10 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1 backdrop-blur-sm">
              <div
                className={`h-2 w-2 rounded-full ${user.isOnline ? 'animate-pulse bg-green-500' : 'bg-gray-400'}`}
              />
              <span className="text-xs font-medium text-white">{user.isOnline ? 'Online' : 'Offline'}</span>
            </div>

            {/* Photo Counter */}
            <div className="absolute right-4 top-4 z-10 rounded-full bg-black/50 px-3 py-1 backdrop-blur-sm">
              <span className="text-xs text-white">
                {activePhotoIndex + 1} / {allPhotos.length}
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="flex gap-2 overflow-auto pb-2">
            {allPhotos.map((photo, i) => (
              <button
                type="button"
                key={i}
                onClick={() => setActivePhotoIndex(i)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden ${
                  i === activePhotoIndex ? 'ring-2 ring-green-500' : ''
                }`}
              >
                <img src={photo} alt="" className="w-full h-full object-cover" />
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
            <Button variant="outline" className="flex-1 gap-2">
              <Video className="w-5 h-5" />
              Video Call
            </Button>
            <Button variant="outline" size="icon">
              <Heart className="w-5 h-5" />
            </Button>
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
                Photos ({user.photos.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('videos')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'videos' ? 'text-green-600 bg-green-50' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Video className="w-4 h-4" />
                Videos ({user.videos.length})
              </button>
            </div>

            <div className="p-4">
              {activeTab === 'photos' ? (
                <div className="grid grid-cols-3 gap-2">
                  {user.photos.map((photo) => (
                    <div key={photo.id || photo.url} className="relative aspect-square overflow-hidden rounded-lg">
                      {photo.isPublic ? (
                        <button
                          type="button"
                          onClick={() => setPreview({ kind: 'photo', photoUrl: photo.url })}
                          className="h-full w-full border-0 p-0"
                          aria-label="Open photo preview"
                        >
                          <img src={photo.url} alt="" className="h-full w-full object-cover" />
                        </button>
                      ) : (
                        <img src={photo.url} alt="" className="h-full w-full object-cover" />
                      )}
                      {!photo.isPublic && (
                        <button
                          type="button"
                          onClick={() => setUnlockModal({ open: true, type: 'photo', price: photo.unlockPrice || 100 })}
                          className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white"
                        >
                          <Lock className="w-6 h-6 mb-1" />
                          <span className="text-xs flex items-center gap-1">
                            <Coins className="w-3 h-3" />
                            {photo.unlockPrice}
                          </span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {user.videos.map((video) => (
                    <div key={video.id || video.url} className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                      {video.isPublic ? (
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
                          <img src={video.thumbnail} alt="" className="h-full w-full object-cover" />
                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90">
                              <Video className="h-5 w-5 text-gray-700" />
                            </div>
                          </div>
                        </>
                      )}
                      {!video.isPublic && (
                        <button
                          type="button"
                          onClick={() => setUnlockModal({ open: true, type: 'video', price: video.unlockPrice || 500 })}
                          className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white"
                        >
                          <Lock className="w-6 h-6 mb-1" />
                          <span className="text-xs flex items-center gap-1">
                            <Coins className="w-3 h-3" />
                            {video.unlockPrice}
                          </span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
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
