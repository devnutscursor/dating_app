import { Chat } from '../models/Chat.model.js';
import { emitChatUpdatedToParticipants } from '../realtime/emitChatUpdate.js';

function formatDurationLabel(totalSeconds) {
  const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Insert a system-style call summary into the chat thread when billing ends.
 */
export async function persistCallEndedMessage(io, chatId, session) {
  if (!io || !chatId || !session) return;
  const coins = Math.max(0, Math.floor(Number(session.totalCoinsCharged) || 0));
  if (coins <= 0) return;

  const chat = await Chat.findById(chatId);
  if (!chat || chat.chatKind === 'moderator_support') return;

  const callKind = session.callType === 'audio' ? 'audio' : 'video';
  const label = callKind === 'audio' ? 'Voice call' : 'Video call';
  const startedAt = session.startedAt || Date.now();
  const durationSeconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
  const durationLabel = formatDurationLabel(durationSeconds);
  const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const msg = {
    senderId: session.payerId,
    content: `${label} ended · ${durationLabel} · ${coins} coins`,
    type: 'call',
    callDurationSeconds: durationSeconds,
    callCoinsTotal: coins,
    callKind,
    isRead: false,
    timestamp: ts,
  };

  chat.messages.push(msg);
  const last = chat.messages[chat.messages.length - 1];
  chat.lastMessage = {
    id: last._id.toString(),
    senderId: last.senderId,
    content: last.content,
    type: last.type,
    timestamp: last.timestamp,
    isRead: false,
    callDurationSeconds: last.callDurationSeconds,
    callCoinsTotal: last.callCoinsTotal,
    callKind: last.callKind,
  };
  await chat.save();

  const populated = await Chat.findById(chatId).populate(
    'participants',
    'name email gender role age country city profilePicture photos videos isOnline isVerified isBlocked coins likesReceivedCount profileSetupComplete emailVerified createdAt updatedAt'
  );
  if (populated) {
    emitChatUpdatedToParticipants(io, populated);
  }
}
