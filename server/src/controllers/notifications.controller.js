import { InAppNotification } from '../models/InAppNotification.model.js';
import {
  femaleNeedsVideoVerification,
  VIDEO_VERIFICATION_REQUIRED_BODY,
} from '../utils/femaleVideoVerification.js';

function rowToClient(n) {
  let type = 'system';
  if (n.kind === 'moderator_dm' || n.kind === 'message') type = 'message';
  else if (n.kind === 'report_outcome') type = 'system';
  else if (n.kind === 'admin_new_user' || n.kind === 'admin_new_report') type = 'system';
  else if (n.kind === 'gift') type = 'gift';
  else if (n.kind === 'like') type = 'like';
  else if (n.kind === 'view') type = 'view';

  return {
    id: n._id.toString(),
    kind: n.kind,
    type,
    title: n.title,
    message: n.body,
    outcomeDetail: n.subtitle ?? undefined,
    timestamp: n.createdAt,
    isRead: n.read,
    reportId: n.reportId?.toString?.() ?? undefined,
    relatedUserId: n.relatedUserId?.toString?.() ?? undefined,
  };
}

export async function listMine(req, res) {
  if (femaleNeedsVideoVerification(req.user)) {
    return res.json({ notifications: [], ...VIDEO_VERIFICATION_REQUIRED_BODY });
  }
  const items = await InAppNotification.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
  res.json({ notifications: items.map(rowToClient) });
}

export async function unreadCount(req, res) {
  if (femaleNeedsVideoVerification(req.user)) {
    return res.json({ unreadCount: 0, ...VIDEO_VERIFICATION_REQUIRED_BODY });
  }
  const unreadCount = await InAppNotification.countDocuments({
    userId: req.user._id,
    read: false,
  });
  res.json({ unreadCount });
}

export async function markNotificationRead(req, res) {
  const doc = await InAppNotification.findOneAndUpdate(
    { _id: req.params.notificationId, userId: req.user._id },
    { read: true },
    { new: true }
  ).lean();
  if (!doc) {
    return res.status(404).json({ error: 'Notification not found' });
  }
  res.json({ ok: true, notification: rowToClient(doc) });
}

export async function markAllNotificationsRead(req, res) {
  await InAppNotification.updateMany({ userId: req.user._id, read: false }, { $set: { read: true } });
  res.json({ ok: true });
}
