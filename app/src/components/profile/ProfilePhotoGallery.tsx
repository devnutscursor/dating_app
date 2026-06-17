import HoverPhotoGallery from '@/components/HoverPhotoGallery';
import ProfileAvatar from '@/components/profile/ProfileAvatar';
import { userGalleryPhotos } from '@/lib/social';
import { cn } from '@/lib/utils';
import type { User } from '@/types';

type ProfilePhotoGalleryProps = {
  user: Pick<User, 'name' | 'gender' | 'role' | 'profilePicture' | 'photos'>;
  photos?: string[];
  className?: string;
  alt?: string;
  onClick?: () => void;
  showCounter?: boolean;
  counterClassName?: string;
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  avatarTextClassName?: string;
};

export default function ProfilePhotoGallery({
  user,
  photos,
  className = 'h-full w-full',
  alt,
  onClick,
  showCounter,
  counterClassName,
  activeIndex,
  onActiveIndexChange,
  avatarTextClassName = 'text-4xl sm:text-5xl',
}: ProfilePhotoGalleryProps) {
  const gallery = photos ?? userGalleryPhotos(user);

  if (gallery.length === 0) {
    return (
      <div
        className={cn(className, onClick && 'cursor-pointer')}
        onClick={onClick}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        <ProfileAvatar
          src={null}
          name={user.name}
          gender={user.gender}
          role={user.role}
          className="h-full w-full"
          textClassName={avatarTextClassName}
          alt={alt ?? user.name}
        />
      </div>
    );
  }

  return (
    <HoverPhotoGallery
      photos={gallery}
      alt={alt ?? user.name}
      className={className}
      onClick={onClick}
      showCounter={showCounter}
      counterClassName={counterClassName}
      activeIndex={activeIndex}
      onActiveIndexChange={onActiveIndexChange}
    />
  );
}
