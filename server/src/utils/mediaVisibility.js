/**
 * Hide non-approved gallery media for female members when the viewer is not the owner.
 * Private media URLs are omitted unless the viewer has unlocked that item.
 */
export function applyPublicMediaFilter(
  user,
  { isViewerOwnerOfProfile, unlockedPhotoIds = new Set(), unlockedVideoIds = new Set() }
) {
  if (!user || isViewerOwnerOfProfile) return user;
  if (!(user.gender === 'female' && user.role === 'female')) return user;

  const approvedPhotos = (user.photos || []).filter((p) => p.status === 'approved');
  const approvedVideos = (user.videos || []).filter((v) => v.status === 'approved');

  const photoId = (p) => (p.id || p._id?.toString?.() || '').toString();

  const shapePhoto = (p) => {
    const id = photoId(p);
    const isPrivate = p.isPublic === false;
    const unlocked = id && unlockedPhotoIds.has(id);
    if (!isPrivate || unlocked) {
      return { ...p, id: id || p.id, isUnlocked: unlocked || !isPrivate };
    }
    return {
      ...p,
      id: id || p.id,
      url: '',
      thumbnail: '',
      isUnlocked: false,
    };
  };

  const shapeVideo = (v) => {
    const id = (v.id || v._id?.toString?.() || '').toString();
    const isPrivate = v.isPublic === false;
    const unlocked = id && unlockedVideoIds.has(id);
    if (!isPrivate || unlocked) {
      return { ...v, id: id || v.id, isUnlocked: unlocked || !isPrivate };
    }
    return {
      ...v,
      id: id || v.id,
      url: '',
      thumbnail: '',
      isUnlocked: false,
    };
  };

  const photos = approvedPhotos.map(shapePhoto);
  const videos = approvedVideos.map(shapeVideo);

  const publicPhotoUrls = new Set(
    photos.filter((p) => p.isPublic !== false && p.url).map((p) => p.url)
  );

  let profilePicture = user.profilePicture || '';
  if (profilePicture && !publicPhotoUrls.has(profilePicture)) {
    const firstPublic = photos.find((p) => p.isPublic !== false && p.url);
    profilePicture = firstPublic?.url || '';
  }

  return {
    ...user,
    profilePicture,
    photos,
    videos,
  };
}
