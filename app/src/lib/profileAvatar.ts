export function isFemaleUser(gender?: string | null, role?: string | null): boolean {
  return gender === 'female' || role === 'female';
}

export function getProfileInitials(name?: string | null): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

/** Placeholder tile styling when the member has not uploaded a photo yet. */
export function profileAvatarPlaceholderClass(
  gender?: string | null,
  role?: string | null
): string {
  if (isFemaleUser(gender, role)) {
    return 'bg-gradient-to-br from-pink-400 to-rose-500 text-white';
  }
  if (gender === 'male' || role === 'male') {
    return 'bg-gradient-to-br from-sky-500 to-blue-600 text-white';
  }
  return 'bg-gradient-to-br from-gray-400 to-gray-600 text-white';
}

export function resolveProfilePicture(profilePicture?: string | null): string | null {
  const url = profilePicture?.trim();
  return url || null;
}
