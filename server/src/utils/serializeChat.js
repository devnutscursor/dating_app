import { serializeUser } from './serializeUser.js';

/** Unread for this viewer: messages from the other person that are not read yet. */
function countUnreadForViewer(messages, selfStr) {
  if (!messages?.length) return 0;
  return messages.filter((m) => {
    const sid = m.senderId?.toString?.() || String(m.senderId);
    return sid !== selfStr && !m.isRead;
  }).length;
}

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
  const rawMessages = chat.messages || [];
  const out = {
    id: chat._id.toString(),
    participant: serializeUser(other),
    messages: rawMessages.map((m) => serializeMessage(m)),
    unreadCount: countUnreadForViewer(rawMessages, selfStr),
    isBlocked: chat.isBlocked || false,
    isReported: chat.isReported || false,
  };
  if (chat.lastMessage != null && typeof chat.lastMessage === 'object') {
    const lm = chat.lastMessage;
    out.lastMessage = {
      id: lm.id || lm._id?.toString(),
      senderId: lm.senderId?.toString?.() || String(lm.senderId),
      content: lm.content ?? '',
      type: lm.type || 'text',
      timestamp: lm.timestamp,
      isRead: lm.isRead,
      mediaUrl: lm.mediaUrl,
      giftAmount: lm.giftAmount,
    };
  }
  return out;
}
