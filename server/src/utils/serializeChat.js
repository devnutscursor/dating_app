import { serializeUser } from './serializeUser.js';

export function serializeMessage(m) {
  const o = m.toObject ? m.toObject() : { ...m };
  return {
    id: o._id?.toString(),
    senderId: o.senderId?.toString?.() || String(o.senderId),
    content: o.content,
    type: o.type,
    timestamp: o.timestamp,
    isRead: o.isRead,
    mediaUrl: o.mediaUrl,
    giftAmount: o.giftAmount,
  };
}

/** Build one chat object for the authenticated viewer */
export function serializeChatDoc(chatDoc, selfId) {
  const chat = chatDoc.toObject({ virtuals: true });
  const selfStr = selfId.toString();
  const participants = chat.participants || [];
  const other = participants.find((p) => p._id.toString() !== selfStr) || participants[0];
  const out = {
    id: chat._id.toString(),
    participant: serializeUser(other),
    messages: (chat.messages || []).map((m) => serializeMessage(m)),
    unreadCount: chat.unreadCount || 0,
    isBlocked: chat.isBlocked || false,
    isReported: chat.isReported || false,
  };
  if (chat.lastMessage?.content != null) {
    out.lastMessage = {
      id: chat.lastMessage.id || chat.lastMessage._id?.toString(),
      senderId: chat.lastMessage.senderId?.toString?.() || String(chat.lastMessage.senderId),
      content: chat.lastMessage.content,
      type: chat.lastMessage.type || 'text',
      timestamp: chat.lastMessage.timestamp,
      isRead: chat.lastMessage.isRead,
    };
  }
  return out;
}
