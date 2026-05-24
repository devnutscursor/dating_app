import { getPlatformSettings } from '../services/siteSettings.js';
import { serializeUser } from './serializeUser.js';

/** Whether a dating member must complete email verification before using the app. */
export function memberNeedsEmailVerification(userDoc, settings) {
  if (!userDoc) return false;
  const role = userDoc.role || userDoc.gender;
  if (!['male', 'female'].includes(role)) return false;
  if (userDoc.emailVerified) return false;
  return Boolean(settings?.security?.requireVerification);
}

/** User JSON for API responses, with `emailVerificationRequired` for members. */
export async function serializeUserForClient(doc) {
  const u = serializeUser(doc);
  if (!u) return null;
  if (['male', 'female'].includes(u.role || u.gender)) {
    const settings = await getPlatformSettings();
    u.emailVerificationRequired = memberNeedsEmailVerification(doc, settings);
  }
  return u;
}
