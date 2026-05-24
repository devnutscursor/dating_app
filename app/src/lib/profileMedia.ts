import type { Photo, User, Video } from '@/types';

const LOCKED_PLACEHOLDER =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="#1f2937" width="100%" height="100%"/></svg>'
  );

/** Approved private media that the viewer has not unlocked yet. */
export function isPhotoLockedForViewer(photo: Photo): boolean {
  return (
    photo.status === 'approved' &&
    photo.isPublic === false &&
    !photo.isUnlocked &&
    !photo.url?.trim()
  );
}

/** Whether another member can see the real photo (public, or private unlocked with URL from API). */
export function isPhotoVisibleToViewer(photo: Photo): boolean {
  if (photo.status !== 'approved' || !photo.url?.trim()) return false;
  if (photo.isPublic === false && !photo.isUnlocked) return false;
  return true;
}

export function isVideoLockedForViewer(video: Video): boolean {
  return (
    video.status === 'approved' &&
    video.isPublic === false &&
    !video.isUnlocked &&
    !video.url?.trim()
  );
}

export function isVideoVisibleToViewer(video: Video): boolean {
  if (video.status !== 'approved' || !video.url?.trim()) return false;
  if (video.isPublic === false && !video.isUnlocked) return false;
  return true;
}

/** Public-only URLs for carousels (excludes locked private even if listed). */
export function isPublicApprovedPhoto(photo: Photo): boolean {
  return photo.status === 'approved' && photo.isPublic !== false && Boolean(photo.url?.trim());
}

/** URLs for profile carousel / discover cards — public approved only. */
export function publicGalleryPhotoUrls(user: User, profilePicture?: string): string[] {
  const pic = profilePicture ?? user.profilePicture;
  const fromPhotos = (user.photos ?? []).filter(isPublicApprovedPhoto).map((p) => p.url);
  const urls = [pic, ...fromPhotos].filter((u): u is string => Boolean(u?.trim()));
  const unique = [...new Set(urls)];
  return unique;
}

/** Hero carousel: all photos the viewer may see (public + unlocked private). */
export function visibleGalleryPhotoUrls(user: User, profilePicture?: string): string[] {
  const pic = profilePicture ?? user.profilePicture;
  const fromPhotos = (user.photos ?? []).filter(isPhotoVisibleToViewer).map((p) => p.url);
  const visible = fromPhotos.filter((u): u is string => Boolean(u?.trim()));
  let hero = pic?.trim() || '';
  if (hero && !visible.includes(hero)) {
    hero = visible[0] || '';
  }
  return [...new Set([hero, ...visible].filter(Boolean))];
}

export function lockedPhotoPlaceholder(): string {
  return LOCKED_PLACEHOLDER;
}

/** Private photos the viewer has not unlocked yet (discover lock badge). */
export function countLockedPrivatePhotos(user: User): number {
  return (user.photos ?? []).filter(
    (p) => p.status === 'approved' && !isPhotoVisibleToViewer(p) && p.isPublic === false
  ).length;
}

/** Private videos the viewer has not unlocked yet. */
export function countLockedPrivateVideos(user: User): number {
  return (user.videos ?? []).filter(
    (v) => v.status === 'approved' && !isVideoVisibleToViewer(v) && v.isPublic === false
  ).length;
}
