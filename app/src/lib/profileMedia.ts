import type { Photo, User, Video } from '@/types';

const LOCKED_PLACEHOLDER =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="#1f2937" width="100%" height="100%"/></svg>'
  );

/** Whether another member can see the real media URL (approved public, or private unlocked by server). */
export function isPhotoVisibleToViewer(photo: Photo): boolean {
  return photo.status === 'approved' && Boolean(photo.url?.trim());
}

export function isVideoVisibleToViewer(video: Video): boolean {
  return video.status === 'approved' && Boolean(video.url?.trim());
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

export function lockedPhotoPlaceholder(): string {
  return LOCKED_PLACEHOLDER;
}
