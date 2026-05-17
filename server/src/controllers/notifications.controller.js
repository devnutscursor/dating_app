import { InAppNotification } from '../models/InAppNotification.model.js';

function rowToClient(n) {
  const type =
    n.kind === 'moderator_dm' ? 'message' : n.kind === 'report_outcome' ? 'system' : 'system';
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
  };
}

export async function listMine(req, res) {
  const items = await InAppNotification.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
  res.json({ notifications: items.map(rowToClient) });
}

export async function unreadCount(req, res) {
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
