import { serializeUser } from './serializeUser.js';
import { applyPublicMediaFilter } from './mediaVisibility.js';

function messagePlain(m) {
  return m.toObject ? m.toObject() : { ...m };
}

export function isMessageVisibleToViewer(m, selfStr) {
  const o = messagePlain(m);
  if ((o.visibility || 'all') === 'sender_only') {
    const sid = o.senderId?.toString?.() || String(o.senderId);
    return sid === selfStr;
  }
  return true;
}

/** Messages the viewer is allowed to see (hides reporter-only confirmations from the peer). */
export function visibleMessagesForViewer(messages, selfStr) {
  if (!messages?.length) return [];
  return messages.filter((m) => isMessageVisibleToViewer(m, selfStr));
}

/** Unread for this viewer among messages they can see. */
function countUnreadForViewer(visibleMsgs, selfStr) {
  if (!visibleMsgs?.length) return 0;
  return visibleMsgs.filter((m) => {
    const o = messagePlain(m);
    const sid = o.senderId?.toString?.() || String(o.senderId);
    return sid !== selfStr && !o.isRead;
  }).length;
}

export function serializeMessage(m) {
  const o = messagePlain(m);
  return {
    id: o._id?.toString(),
    senderId: o.senderId?.toString?.() || String(o.senderId),
    content: o.content,
    type: o.type,
    timestamp: o.timestamp,
    isRead: o.isRead,
    mediaUrl: o.mediaUrl,
    giftAmount: o.giftAmount,
    giftNote: o.giftNote,
  };
}

function isPinnedForViewer(chat, selfStr) {
  return (chat.pinnedBy || []).some((id) => {
    const s = id?.toString?.() || String(id);
    return s === selfStr;
  });
}

/** Total coins received from the other participant via gift messages in this thread. */
export function sumCoinsReceivedFromPeer(messages, selfStr) {
  if (!messages?.length) return 0;
  return messages.reduce((sum, m) => {
    const o = messagePlain(m);
    if (o.type !== 'gift') return sum;
    const sid = o.senderId?.toString?.() || String(o.senderId);
    if (sid === selfStr) return sum;
    const amt = Number(o.giftAmount);
    return sum + (Number.isFinite(amt) && amt > 0 ? amt : 0);
  }, 0);
}

/** Build one chat object for the authenticated viewer */
export function serializeChatDoc(chatDoc, selfId) {
  const chat = chatDoc.toObject({ virtuals: true });
  const selfStr = selfId.toString();
  const participants = chat.participants || [];
  const other = participants.find((p) => p._id.toString() !== selfStr) || participants[0];

  const rawMessages = chat.messages || [];
  const visible = visibleMessagesForViewer(rawMessages, selfStr);

  const otherIdStr = other?._id?.toString?.() || '';
  let participant = serializeUser(other);
  if (participant?.gender === 'female' && participant?.role === 'female') {
    participant = applyPublicMediaFilter(participant, {
      isViewerOwnerOfProfile: otherIdStr !== '' && otherIdStr === selfStr,
    });
  }

  const serializedMessages = visible.map((m) => {
    const o = messagePlain(m);
    return {
      ...serializeMessage(m),
      isPrivateNotice: (o.visibility || 'all') === 'sender_only',
    };
  });

  let lastMessageOut;
  if (visible.length) {
    const last = visible[visible.length - 1];
    const lm = messagePlain(last);
    lastMessageOut = {
      ...serializeMessage(last),
      isRead: lm.isRead,
    };
  }

  const out = {
    id: chat._id.toString(),
    chatKind: chat.chatKind || 'direct',
    participant,
    messages: serializedMessages,
    unreadCount: countUnreadForViewer(visible, selfStr),
    isBlocked: chat.isBlocked || false,
    isReported: chat.isReported || false,
    isPinned: isPinnedForViewer(chat, selfStr),
    coinsReceivedFromPeer: sumCoinsReceivedFromPeer(visible, selfStr),
  };

  if (lastMessageOut) {
    out.lastMessage = lastMessageOut;
  }

  return out;
}
