import mongoose from 'mongoose';
import { User } from '../models/User.model.js';
import { createInAppNotification } from '../services/inAppNotifications.js';
import { serializeUser } from '../utils/serializeUser.js';

async function loadSuspendableMember(userId, res) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400).json({ error: 'Invalid user id' });
    return null;
  }
  const user = await User.findById(userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return null;
  }
  if (!['male', 'female'].includes(user.role)) {
    res.status(403).json({ error: 'Only male or female dating members can be suspended this way' });
    return null;
  }
  return user;
}

/** POST body: `{ reason?: string, reportId?: string }` — suspend for ToS violations */
export async function suspendPlatformMember(req, res) {
  const user = await loadSuspendableMember(req.params.userId, res);
  if (!user) return;

  const reasonRaw = typeof req.body?.reason === 'string' ? req.body.reason.trim() : '';
  const reason = reasonRaw.slice(0, 500);
  let reportOid;
  if (req.body?.reportId && mongoose.Types.ObjectId.isValid(String(req.body.reportId))) {
    reportOid = new mongoose.Types.ObjectId(String(req.body.reportId));
  }

  user.isBlocked = true;
  user.platformSuspendedReason = reason || 'Terms of Service violation';
  user.platformSuspendedAt = new Date();
  user.platformSuspendedBy = req.user._id;
  await user.save();

  const io = req.app.get('io');
  await createInAppNotification(io, {
    userId: user._id,
    kind: 'system',
    title: 'Account suspended',
    body: 'Your MemberDate account has been suspended for violating our Terms of Service. You may no longer use the dating features until this is reversed by our team.',
    subtitle: reason ? `Details: ${reason}` : undefined,
    reportId: reportOid || undefined,
  });

  res.json({ user: serializeUser(user), ok: true });
}

export async function unsuspendPlatformMember(req, res) {
  const user = await loadSuspendableMember(req.params.userId, res);
  if (!user) return;

  user.isBlocked = false;
  user.platformSuspendedReason = undefined;
  user.platformSuspendedAt = undefined;
  user.platformSuspendedBy = undefined;
  await user.save();

  const io = req.app.get('io');
  await createInAppNotification(io, {
    userId: user._id,
    kind: 'system',
    title: 'Account reinstated',
    body: 'Your MemberDate account is active again. Please follow our Community Guidelines.',
  });

  res.json({ user: serializeUser(user), ok: true });
}
