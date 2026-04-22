import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { interestTags } from '@/config/design';
import { useAuth } from '@/contexts/AuthContext';
import { apiPatch, apiUploadFile } from '@/lib/api';
import AddMediaModal from '@/components/modals/AddMediaModal';
import { ProfileMediaEmptyState } from '@/components/profile/ProfileMediaEmptyState';
import type { Photo, User, Video } from '@/types';

function photosForApi(photos: Photo[]) {
  return photos.map((p) => ({
    url: p.url,
    ...(p.thumbnail ? { thumbnail: p.thumbnail } : {}),
    isPublic: p.isPublic !== false,
    isUnlocked: Boolean(p.isUnlocked),
    status: p.status,
    ...(p.unlockPrice != null && Number.isFinite(p.unlockPrice) ? { unlockPrice: p.unlockPrice } : {}),
  }));
}

function videosForApi(videos: Video[]) {
  return videos.map((v) => ({
    url: v.url,
    thumbnail: v.thumbnail,
    isPublic: v.isPublic !== false,
    isUnlocked: Boolean(v.isUnlocked),
    status: v.status,
    ...(v.duration != null && Number.isFinite(v.duration) ? { duration: v.duration } : {}),
    ...(v.unlockPrice != null && Number.isFinite(v.unlockPrice) ? { unlockPrice: v.unlockPrice } : {}),
  }));
}

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [aboutMe, setAboutMe] = useState('');
  const [lookingFor, setLookingFor] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [addMedia, setAddMedia] = useState<{ open: boolean; type: 'photo' | 'video' }>({ open: false, type: 'photo' });
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const profileBase = user?.role === 'female' ? '/woman/profile' : '/man/profile';
  const isWoman = user?.role === 'female';

  useEffect(() => {
    if (!user) return;
    setAboutMe(user.aboutMe ?? '');
    setLookingFor(user.lookingFor ?? '');
    setCity(user.city ?? '');
    setCountry(user.country ?? '');
    setInterests([...(user.interests ?? [])]);
  }, [user]);

  const toggleInterest = (tag: string) => {
    setInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const saveText = async () => {
    if (!user) return;
    if (!aboutMe.trim() || !lookingFor.trim()) {
      toast.error('About Me and Looking For are required');
      return;
    }
    if (interests.length === 0) {
      toast.error('Select at least one interest');
      return;
    }
    setSaving(true);
    try {
      await apiPatch<{ user: User }>('/users/me', {
        aboutMe: aboutMe.trim(),
        lookingFor: lookingFor.trim(),
        city: city.trim(),
        country: country.trim(),
        interests,
      });
      await refreshUser();
      toast.success('Profile updated');
      navigate(profileBase, { replace: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const removePhoto = async (key: string) => {
    if (!user) return;
    const next = user.photos.filter((p) => (p.id || p.url) !== key);
    try {
      await apiPatch('/users/me', { photos: photosForApi(next) });
      await refreshUser();
      toast.success('Photo removed');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not remove photo');
    }
  };

  const removeVideo = async (key: string) => {
    if (!user) return;
    const next = user.videos.filter((v) => (v.id || v.url) !== key);
    try {
      await apiPatch('/users/me', { videos: videosForApi(next) });
      await refreshUser();
      toast.success('Video removed');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not remove video');
    }
  };

  const changeAvatar = async (file: File) => {
    setAvatarBusy(true);
    try {
      const { url } = await apiUploadFile<{ url: string }>('/uploads/image', file);
      await apiPatch('/users/me', { profilePicture: url });
      await refreshUser();
      toast.success('Profile picture updated');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setAvatarBusy(false);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-gray-500">Loading…</div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-10">
      <div className="flex items-center gap-3">
        <Link
          to={profileBase}
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to profile
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit profile</h1>
        <p className="text-sm text-gray-500">Update your bio, interests, and media.</p>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Profile picture</h2>
        <div className="flex flex-wrap items-center gap-4">
          <img
            src={user.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'}
            alt=""
            className="h-24 w-24 rounded-2xl border border-gray-200 object-cover"
          />
          <div>
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
            <Button
              type="button"
              variant="outline"
              disabled={avatarBusy}
              onClick={() => avatarInputRef.current?.click()}
            >
              {avatarBusy ? 'Uploading…' : 'Change photo'}
            </Button>
            <p className="mt-2 text-xs text-gray-500">Uploaded to Cloudinary when configured.</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">About you</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">About Me *</label>
            <textarea
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Looking For *</label>
            <textarea
              value={lookingFor}
              onChange={(e) => setLookingFor(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. London"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. UK or GB"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Interests *</label>
            <div className="flex flex-wrap gap-2">
              {interestTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleInterest(tag)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    interests.includes(tag) ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Photos & videos</h2>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => setAddMedia({ open: true, type: 'photo' })}>
              <ImageIcon className="h-4 w-4" />
              Add photo
            </Button>
            <Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => setAddMedia({ open: true, type: 'video' })}>
              <VideoIcon className="h-4 w-4" />
              Add video
            </Button>
          </div>
        </div>

        <h3 className="mb-2 text-sm font-medium text-gray-700">Photos</h3>
        <div className="mb-6 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {user.photos.length === 0 ? (
            <ProfileMediaEmptyState media="photo" tone="neutral" compact />
          ) : (
            user.photos.map((p) => (
              <div key={p.id || p.url} className="group relative aspect-square overflow-hidden rounded-xl border border-gray-100">
                <img src={p.url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => void removePhoto(p.id || p.url)}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                  aria-label="Remove photo"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        <h3 className="mb-2 text-sm font-medium text-gray-700">Videos</h3>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {user.videos.length === 0 ? (
            <ProfileMediaEmptyState media="video" tone="neutral" compact />
          ) : (
            user.videos.map((v) => (
              <div key={v.id || v.url} className="group relative aspect-square overflow-hidden rounded-xl border border-gray-100 bg-gray-900">
                <img src={v.thumbnail} alt="" className="h-full w-full object-cover opacity-90" />
                <button
                  type="button"
                  onClick={() => void removeVideo(v.id || v.url)}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                  aria-label="Remove video"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      <div className="flex flex-wrap justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => navigate(profileBase)}>
          Cancel
        </Button>
        <Button type="button" className="bg-green-500 hover:bg-green-600" disabled={saving} onClick={() => void saveText()}>
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
      </div>

      <AddMediaModal
        open={addMedia.open}
        onClose={() => setAddMedia({ ...addMedia, open: false })}
        mediaType={addMedia.type}
        isWoman={Boolean(isWoman)}
      />
    </div>
  );
}
