import { InAppNotification } from '../models/InAppNotification.model.js';
import { emitInAppNotification } from '../realtime/emitNotification.js';

/**
 * Persist an in-app notification and push it over Socket.IO to `user:userId`.
 * @param {import('socket.io').Server | undefined} io
 */
export async function createInAppNotification(
  io,
  { userId, kind, title, body, subtitle, reportId, relatedUserId }
) {
  const doc = await InAppNotification.create({
    userId,
    kind,
    title: String(title).slice(0, 400),
    body: String(body).slice(0, 2000),
    subtitle: subtitle != null ? String(subtitle).slice(0, 2000) : undefined,
    reportId: reportId || undefined,
    relatedUserId: relatedUserId || undefined,
  });
  emitInAppNotification(io, userId, {
    id: doc._id.toString(),
    title: doc.title,
    body: doc.body,
    subtitle: doc.subtitle,
    kind: doc.kind,
    createdAt: doc.createdAt,
    reportId: doc.reportId?.toString?.(),
    relatedUserId: doc.relatedUserId?.toString?.(),
  });
  return doc;
}
