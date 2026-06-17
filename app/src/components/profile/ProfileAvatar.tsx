import { cn } from '@/lib/utils';
import {
  getProfileInitials,
  profileAvatarPlaceholderClass,
  resolveProfilePicture,
} from '@/lib/profileAvatar';

type ProfileAvatarProps = {
  src?: string | null;
  name?: string | null;
  gender?: string | null;
  role?: string | null;
  className?: string;
  textClassName?: string;
  alt?: string;
};

export default function ProfileAvatar({
  src,
  name,
  gender,
  role,
  className,
  textClassName,
  alt,
}: ProfileAvatarProps) {
  const url = resolveProfilePicture(src);
  if (url) {
    return (
      <img
        src={url}
        alt={alt ?? name ?? 'Profile'}
        className={cn('object-cover', className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center font-semibold select-none',
        profileAvatarPlaceholderClass(gender, role),
        className
      )}
      aria-hidden={!alt}
      title={name ?? undefined}
    >
      <span className={cn('text-sm sm:text-base', textClassName)}>
        {getProfileInitials(name)}
      </span>
    </div>
  );
}
