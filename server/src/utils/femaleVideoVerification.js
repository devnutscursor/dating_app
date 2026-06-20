/** Women must pass moderator video verification before messaging & member notifications. */
export function femaleNeedsVideoVerification(user) {
  if (!user) return false;
  return user.role === 'female' && user.gender === 'female' && !user.isVerified;
}

export const VIDEO_VERIFICATION_REQUIRED_BODY = {
  error:
    'Only after completing video verification will you be able to receive notifications and send messages.',
  code: 'VIDEO_VERIFICATION_REQUIRED',
};
