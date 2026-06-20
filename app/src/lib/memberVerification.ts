import type { User } from '@/types';

export const VIDEO_VERIFICATION_REQUIRED_MESSAGE =
  'Only after completing video verification will you be able to receive notifications and send messages.';

export function needsVideoVerification(
  user: Pick<User, 'role' | 'gender' | 'isVerified'> | null | undefined
): boolean {
  if (!user) return false;
  return (user.role === 'female' || user.gender === 'female') && !user.isVerified;
}
