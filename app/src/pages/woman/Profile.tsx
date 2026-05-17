import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, MapPin, Edit, Image, Video, Lock, Settings, ChevronRight, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { apiPatch, apiUploadFile } from '@/lib/api';
import { formatProfileLocation } from '@/lib/formatProfileLocation';
import AddMediaModal from '@/components/modals/AddMediaModal';
import MediaPreviewModal from '@/components/modals/MediaPreviewModal';
import { ProfileMediaEmptyState } from '@/components/profile/ProfileMediaEmptyState';

type PreviewState =
  | { kind: 'photo'; photoUrl: string }
  | { kind: 'video'; videoUrl: string; posterUrl?: string };

export default function WomanProfile() {
  const { user: currentWomanUser, refreshUser } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [addMediaModal, setAddMediaModal] = useState<{ open: boolean; type: 'photo' | 'video' }>({
    open: false,
    type: 'photo',
  });

  const changeAvatar = async (file: File) => {
    if (!currentWomanUser) return;
    setAvatarBusy(true);
    try {
      const { url } = await apiUploadFile<{ url: string }>('/uploads/image', file);
      const photos = [
        ...(currentWomanUser.photos ?? []),
        { url, isPublic: true, isUnlocked: false },
      ];
      await apiPatch('/users/me', { profilePicture: url, photos });
      await refreshUser();
      toast.success('Profile picture submitted for review');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setAvatarBusy(false);
    }
  };

  if (!currentWomanUser) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-gray-500">
        Loading profile…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Cover */}
        <div className="relative h-32 bg-gradient-to-r from-pink-400 to-rose-500">
          <Link
            to="/woman/profile/edit"
            className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-rose-700 shadow-md ring-1 ring-rose-500/20 transition hover:bg-rose-50"
          >
            <Edit className="h-3.5 w-3.5" />
            Edit profile
          </Link>
        </div>
        
        {/* Info */}
        <div className="px-6 pb-6">
          <div className="relative -mt-16 mb-4">
            <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-3xl border-4 border-white overflow-hidden bg-white shadow-sm">
              <img
                src={
                  currentWomanUser.profilePicture ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400'
                }
                alt={currentWomanUser.name}
                className="h-full w-full object-cover"
              />
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              tabIndex={-1}
              disabled={avatarBusy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = '';
                if (f) void changeAvatar(f);
              }}
            />
            <button
              type="button"
              disabled={avatarBusy}
              onClick={() => avatarInputRef.current?.click()}
              className="absolute bottom-3 left-[7rem] sm:left-[8rem] flex h-8 w-8 items-center justify-center rounded-full bg-green-500 transition-colors hover:bg-green-600 disabled:opacity-60"
              aria-label="Change profile picture"
            >
              <Camera className="h-4 w-4 text-white" />
            </button>
          </div>

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{currentWomanUser.name}, {currentWomanUser.age}</h2>
              <div className="mt-1 flex items-start gap-1 text-gray-500">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="text-sm leading-snug">
                  {formatProfileLocation(currentWomanUser.city, currentWomanUser.country) || (
                    <span className="text-gray-400">Location not set — add it in edit profile</span>
                  )}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-sm text-gray-600">Online</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{currentWomanUser.photos.length}</p>
              <p className="text-sm text-gray-500">Photos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{currentWomanUser.videos.length}</p>
              <p className="text-sm text-gray-500">Videos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{currentWomanUser.likesReceivedCount ?? 0}</p>
              <p className="text-sm text-gray-500">Likes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{currentWomanUser.coins}</p>
              <p className="text-sm text-gray-500">Coins</p>
            </div>
          </div>

          {/* Media Section */}
          <div className="mt-6 border-t border-gray-100 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('photos')}
                  className={`flex items-center gap-2 pb-2 text-sm font-medium transition-colors relative ${
                    activeTab === 'photos' ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Image className="w-4 h-4" />
                  Photos
                  {activeTab === 'photos' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('videos')}
                  className={`flex items-center gap-2 pb-2 text-sm font-medium transition-colors relative ${
                    activeTab === 'videos' ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  Videos
                  {activeTab === 'videos' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" />
                  )}
                </button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddMediaModal({ open: true, type: activeTab === 'photos' ? 'photo' : 'video' })}
              >
                Add {activeTab === 'photos' ? 'Photo' : 'Video'}
              </Button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {activeTab === 'photos' ? (
                currentWomanUser.photos.length === 0 ? (
                  <ProfileMediaEmptyState media="photo" tone="rose" />
                ) : (
                  currentWomanUser.photos.map((photo) => (
                    <button
                      key={photo.id || photo.url}
                      type="button"
                      onClick={() => setPreview({ kind: 'photo', photoUrl: photo.url })}
                      className="relative aspect-square w-full cursor-pointer overflow-hidden rounded-xl border-0 p-0 text-left ring-green-500/0 transition-shadow hover:ring-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                    >
                      <img src={photo.url} alt="" className="h-full w-full object-cover" />
                      {(photo.status === 'pending' || photo.status === 'rejected') && (
                        <div
                          className={`absolute bottom-2 left-2 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white ${
                            photo.status === 'pending' ? 'bg-amber-600' : 'bg-red-600'
                          }`}
                        >
                          {photo.status === 'pending' ? 'Review' : 'Rejected'}
                        </div>
                      )}
                      {!photo.isPublic && (
                        <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500">
                          <Lock className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))
                )
              ) : currentWomanUser.videos.length === 0 ? (
                <ProfileMediaEmptyState media="video" tone="rose" />
              ) : (
                currentWomanUser.videos.map((video) => (
                  <button
                    key={video.id || video.url}
                    type="button"
                    onClick={() =>
                      setPreview({ kind: 'video', videoUrl: video.url, posterUrl: video.thumbnail })
                    }
                    className="relative aspect-square w-full cursor-pointer overflow-hidden rounded-xl border-0 bg-gray-100 p-0 text-left ring-green-500/0 transition-shadow hover:ring-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                  >
                    <img src={video.thumbnail} alt="" className="h-full w-full object-cover" />
                    {(video.status === 'pending' || video.status === 'rejected') && (
                      <div
                        className={`absolute bottom-2 left-2 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white ${
                          video.status === 'pending' ? 'bg-amber-600' : 'bg-red-600'
                        }`}
                      >
                        {video.status === 'pending' ? 'Review' : 'Rejected'}
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90">
                        <Video className="h-5 w-5 text-gray-700" />
                      </div>
                    </div>
                    {!video.isPublic && (
                      <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500">
                        <Lock className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* About */}
          <div className="mt-6">
            <h3 className="mb-2 font-semibold text-gray-900">About Me</h3>
            <p className="text-gray-600">
              {currentWomanUser.aboutMe?.trim() ? (
                currentWomanUser.aboutMe
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </p>
          </div>

          {/* Looking For */}
          <div className="mt-4">
            <h3 className="mb-2 font-semibold text-gray-900">Looking For</h3>
            <p className="text-gray-600">
              {currentWomanUser.lookingFor?.trim() ? (
                currentWomanUser.lookingFor
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </p>
          </div>

          {/* Interests */}
          <div className="mt-4">
            <h3 className="mb-2 font-semibold text-gray-900">Interests</h3>
            {currentWomanUser.interests?.length ? (
              <div className="flex flex-wrap gap-2">
                {currentWomanUser.interests.map((interest, i) => (
                  <span
                    key={`${interest}-${i}`}
                    className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No interests yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Earnings Card */}
      <Link to="/woman/payouts">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white flex items-center justify-between hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-white/80 text-sm">Total Earnings</p>
              <p className="text-2xl font-bold">{currentWomanUser.coins} coins</p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6" />
        </div>
      </Link>

      {/* Settings */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <Link to="/woman/profile/settings" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-gray-600" />
            </div>
            <span className="font-medium text-gray-900">Account Settings</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </Link>
      </div>

      {/* Add Media Modal */}
      <AddMediaModal
        open={addMediaModal.open}
        onClose={() => setAddMediaModal({ ...addMediaModal, open: false })}
        mediaType={addMediaModal.type}
        isWoman={true}
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
