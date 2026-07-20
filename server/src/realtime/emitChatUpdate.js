import { serializeChatDoc } from '../utils/serializeChat.js';
import { User } from '../models/User.model.js';

/**
 * Notify all participants with a viewer-specific payload (participant + unread).
 * For moderator_support threads, also notify every moderator (shared inbox).
 * @param {import('socket.io').Server | undefined} io
 * @param {import('mongoose').Document} chatDoc Mongoose doc; participants should be populated
 */
export function emitChatUpdatedToParticipants(io, chatDoc) {
  if (!io || !chatDoc?.participants?.length) return;
  const chatId = chatDoc._id.toString();
  const notified = new Set();
  for (const p of chatDoc.participants) {
    const selfId = p._id ?? p;
    const idStr = selfId.toString();
    notified.add(idStr);
    const chat = serializeChatDoc(chatDoc, selfId);
    io.to(`user:${idStr}`).emit('chat:update', { chatId, chat });
  }

  const kind = chatDoc.chatKind || chatDoc.toObject?.()?.chatKind;
  if (kind === 'moderator_support') {
    void User.find({ role: { $in: ['moderator', 'admin'] } })
      .select('_id')
      .lean()
      .then((staff) => {
        for (const s of staff) {
          const idStr = s._id.toString();
          if (notified.has(idStr)) continue;
          const chat = serializeChatDoc(chatDoc, s._id);
          io.to(`user:${idStr}`).emit('chat:update', { chatId, chat });
        }
      })
      .catch(() => {});
  }
}
