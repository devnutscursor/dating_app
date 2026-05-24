import { verifyAccessToken } from '../utils/jwt.js';
import { User } from '../models/User.model.js';
import { getPlatformSettings } from '../services/siteSettings.js';

export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    /** Block suspended dating members from the API except auth routes they need to understand status / log out */
    const path = (req.originalUrl || req.url || '').split('?')[0];
    const isAuthBypass = /\/auth\/(me|logout|verify-email|resend-verification)$/.test(path);
    if (user.isBlocked && ['male', 'female'].includes(user.role) && !isAuthBypass) {
      return res.status(403).json({
        error: 'Account suspended',
        code: 'ACCOUNT_SUSPENDED',
      });
    }

    /** Enforce email verification gate when enabled in admin settings */
    const isVerifyBypass = isAuthBypass || /\/auth\/(login|register)$/.test(path);
    if (!isVerifyBypass && ['male', 'female'].includes(user.role) && !user.emailVerified) {
      const settings = await getPlatformSettings();
      if (settings?.security?.requireVerification) {
        return res.status(403).json({
          error: 'Email verification required',
          code: 'EMAIL_VERIFICATION_REQUIRED',
        });
      }
    }

    req.user = user;
    req.auth = { userId: user._id.toString(), role: user.role };
    next();
  } catch (err) {
    next(err);
  }
}
