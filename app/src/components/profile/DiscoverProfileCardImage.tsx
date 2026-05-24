import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import HoverPhotoGallery from '@/components/HoverPhotoGallery';
import { userGalleryPhotos } from '@/lib/social';
import { countLockedPrivatePhotos, countLockedPrivateVideos } from '@/lib/profileMedia';
import type { ProfileLocationState } from '@/lib/profileNavigation';
import type { User } from '@/types';
import type { ReactNode } from 'react';

type DiscoverProfileCardImageProps = {
  user: User;
  profilePath: string;
  profileState?: { state: ProfileLocationState };
  topLeft?: ReactNode;
  bottomActions: ReactNode;
};

export default function DiscoverProfileCardImage({
  user,
  profilePath,
  profileState,
  topLeft,
  bottomActions,
}: DiscoverProfileCardImageProps) {
  const lockedPhotos = countLockedPrivatePhotos(user);
  const lockedVideos = countLockedPrivateVideos(user);
  const hasPrivateMedia = lockedPhotos > 0 || lockedVideos > 0;
  const privateCount = lockedPhotos + lockedVideos;
  const mediaTab: 'photos' | 'videos' = lockedPhotos > 0 ? 'photos' : 'videos';
  const privateHint =
    lockedPhotos > 0
      ? `${lockedPhotos} private photo${lockedPhotos === 1 ? '' : 's'}`
      : `${lockedVideos} private video${lockedVideos === 1 ? '' : 's'}`;

  const linkState: ProfileLocationState = {
    ...profileState?.state,
    ...(hasPrivateMedia ? { mediaTab } : {}),
  };

  return (
    <div className="relative aspect-[3/4] w-full">
      {/* Photo only — overflow clip must not include action buttons (fixes 150% DPI clipping). */}
      <div className="absolute inset-0 overflow-hidden rounded-t-2xl">
        <Link
          to={profilePath}
          state={linkState}
          className="block h-full w-full cursor-pointer"
          aria-label={`View ${user.name}'s profile`}
        >
          <HoverPhotoGallery photos={userGalleryPhotos(user)} alt={user.name} className="h-full w-full" />
        </Link>
      </div>

      {topLeft ? (
        <div className="pointer-events-none absolute left-2.5 top-2.5 z-20 sm:left-3 sm:top-3">{topLeft}</div>
      ) : null}

      {hasPrivateMedia ? (
        <Link
          to={profilePath}
          state={linkState}
          className="pointer-events-auto absolute right-2.5 top-2.5 z-30 flex h-8 min-w-8 items-center justify-center gap-1 rounded-full bg-yellow-500 px-2 transition-colors hover:bg-yellow-600 sm:right-3 sm:top-3"
          title={`${privateHint} — not shown here. Open profile to unlock.`}
          aria-label={`${privateHint}. Open profile to unlock.`}
          onClick={(e) => e.stopPropagation()}
        >
          <Lock className="h-4 w-4 shrink-0 text-white" />
          {privateCount > 1 ? (
            <span className="pr-0.5 text-xs font-semibold text-white">{privateCount}</span>
          ) : null}
        </Link>
      ) : null}

      <div className="pointer-events-none absolute bottom-2.5 left-2.5 right-2.5 z-20 rounded-lg bg-gradient-to-t from-black/85 via-black/45 to-transparent pb-2 pt-9 sm:bottom-3 sm:left-3 sm:right-3 sm:pb-2.5 sm:pt-10">
        <div className="pointer-events-auto w-full min-w-0 max-w-full">{bottomActions}</div>
      </div>
    </div>
  );
}
