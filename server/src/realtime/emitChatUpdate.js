import { serializeChatDoc } from '../utils/serializeChat.js';

/**
 * Notify all participants with a viewer-specific payload (participant + unread).
 * @param {import('socket.io').Server | undefined} io
 * @param {import('mongoose').Document} chatDoc Mongoose doc; participants should be populated
 */
export function emitChatUpdatedToParticipants(io, chatDoc) {
  if (!io || !chatDoc?.participants?.length) return;
  const chatId = chatDoc._id.toString();
  for (const p of chatDoc.participants) {
    const selfId = p._id ?? p;
    const idStr = selfId.toString();
    const chat = serializeChatDoc(chatDoc, selfId);
    io.to(`user:${idStr}`).emit('chat:update', { chatId, chat });
  }
}
