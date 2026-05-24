import { Chat } from '../models/Chat.model.js';
import { User } from '../models/User.model.js';
import { Transaction } from '../models/Transaction.model.js';
import { getPlatformSettings } from './siteSettings.js';

/** @type {Map<string, 'audio' | 'video'>} */
const pendingCallTypesByChat = new Map();

function sessionKey(chatId) {
  return String(chatId);
}

export function setPendingCallType(chatId, callType) {
  pendingCallTypesByChat.set(sessionKey(chatId), callType === 'audio' ? 'audio' : 'video');
}

export function consumePendingCallType(chatId) {
  const key = sessionKey(chatId);
  const type = pendingCallTypesByChat.get(key) || 'video';
  pendingCallTypesByChat.delete(key);
  return type;
}

export function clearPendingCallType(chatId) {
  pendingCallTypesByChat.delete(sessionKey(chatId));
}

/** Reads from DB settings (cached). Falls back to env → defaults. */
async function getCoinsPerMinute(callType = 'video') {
  const s = await getPlatformSettings();
  if (callType === 'audio') {
    const fromSettings = s?.coinPricing?.audioCallPerMinute;
    if (Number.isFinite(fromSettings) && fromSettings > 0) return fromSettings;
    return Math.max(1, Math.floor(Number(process.env.AUDIO_CALL_COINS_PER_MINUTE) || 5));
  }
  const fromSettings = s?.coinPricing?.videoCallPerMinute;
  if (Number.isFinite(fromSettings) && fromSettings > 0) return fromSettings;
  return Math.max(1, Math.floor(Number(process.env.VIDEO_CALL_COINS_PER_MINUTE) || 10));
}

export async function getConfiguredCoinsPerMinute(callType = 'video') {
  return getCoinsPerMinute(callType);
}

/** @deprecated use getConfiguredCoinsPerMinute('video') */
export const COINS_PER_MINUTE = 10;

/** @type {Map<string, { timer: NodeJS.Timeout; payerId: string; earnerId: string; payerName: string; earnerName: string; callType: 'audio' | 'video' }>} */
const activeSessions = new Map();

/**
 * Male pays, female earns. Returns null when billing does not apply.
 */
export async function resolveVideoCallBilling(acceptorId, otherUserId, chatId) {
  const chat = await Chat.findById(chatId).select('participants chatKind');
  if (!chat || chat.chatKind === 'moderator_support') return null;

  const acceptorStr = String(acceptorId);
  const otherStr = String(otherUserId);
  const participantIds = chat.participants.map((p) => p.toString());
  if (!participantIds.includes(acceptorStr) || !participantIds.includes(otherStr)) {
    return null;
  }

  const users = await User.find({ _id: { $in: [acceptorId, otherUserId] } }).select('gender name');
  const male = users.find((u) => u.gender === 'male');
  const female = users.find((u) => u.gender === 'female');
  if (!male || !female) return null;

  return {
    payerId: male._id.toString(),
    earnerId: female._id.toString(),
    payerName: male.name || 'Member',
    earnerName: female.name || 'Member',
  };
}

export async function chargeVideoCallMinute({ payerId, earnerId, payerName, earnerName, callType = 'video' }) {
  const amt = await getCoinsPerMinute(callType);
  const label = callType === 'audio' ? 'Voice call' : 'Video call';

  const payerAfter = await User.findOneAndUpdate(
    { _id: payerId, coins: { $gte: amt } },
    { $inc: { coins: -amt } },
    { new: true }
  );
  if (!payerAfter) {
    return { ok: false, reason: 'insufficient' };
  }

  await User.findByIdAndUpdate(earnerId, { $inc: { coins: amt } });

  const ts = new Date().toISOString().slice(0, 10);
  try {
    await Transaction.create([
      {
        userId: payerId,
        type: 'videoCall',
        amount: amt,
        currency: 'coins',
        description: `${label} with ${earnerName}`,
        status: 'completed',
        relatedUserId: earnerId,
        timestamp: ts,
      },
      {
        userId: earnerId,
        type: 'videoCall',
        amount: amt,
        currency: 'coins',
        description: `${label} with ${payerName}`,
        status: 'completed',
        relatedUserId: payerId,
        timestamp: ts,
      },
    ]);
  } catch (ledgerErr) {
    console.error('Call transaction ledger failed', ledgerErr);
  }

  const earnerAfter = await User.findById(earnerId).select('coins');
  return {
    ok: true,
    amount: amt,
    payerCoins: payerAfter.coins,
    earnerCoins: earnerAfter?.coins ?? null,
  };
}

function emitBillingUpdate(io, parties, chargeResult) {
  io.to(`user:${parties.payerId}`).emit('call:coins-updated', {
    chatId: parties.chatId,
    coins: chargeResult.payerCoins,
    amount: chargeResult.amount,
  });
  io.to(`user:${parties.earnerId}`).emit('call:coins-updated', {
    chatId: parties.chatId,
    coins: chargeResult.earnerCoins,
    amount: chargeResult.amount,
    earned: true,
  });
}

function emitBillingFailed(io, chatId, payerId, earnerId, reason) {
  const payload = { chatId, reason };
  io.to(`user:${payerId}`).emit('call:billing-failed', payload);
  io.to(`user:${earnerId}`).emit('call:billing-failed', payload);
}

async function tickMinute(io, chatId, parties) {
  const result = await chargeVideoCallMinute(parties);
  if (!result.ok) {
    stopVideoCallBilling(chatId);
    emitBillingFailed(io, chatId, parties.payerId, parties.earnerId, result.reason);
    io.to(`user:${parties.payerId}`).emit('call:ended', { from: parties.earnerId, chatId, reason: 'billing' });
    io.to(`user:${parties.earnerId}`).emit('call:ended', { from: parties.payerId, chatId, reason: 'billing' });
    return;
  }
  emitBillingUpdate(io, { ...parties, chatId }, result);
}

/**
 * Charge first minute on accept, then every 60s while the call stays active.
 */
export async function startVideoCallBilling(io, chatId, parties, callType = 'video') {
  stopVideoCallBilling(chatId);

  const key = sessionKey(chatId);
  const sessionParties = { ...parties, chatId, callType };

  const first = await chargeVideoCallMinute(sessionParties);
  if (!first.ok) {
    emitBillingFailed(io, chatId, parties.payerId, parties.earnerId, first.reason);
    return false;
  }
  emitBillingUpdate(io, sessionParties, first);

  let minutesElapsed = 1;

  const timer = setInterval(async () => {
    const s = await getPlatformSettings();
    const maxMin = Math.max(1, Math.floor(Number(s?.videoCall?.maxDuration) || 120));
    minutesElapsed += 1;
    if (minutesElapsed > maxMin) {
      stopVideoCallBilling(chatId);
      io.to(`user:${parties.payerId}`).emit('call:ended', { from: parties.earnerId, chatId, reason: 'maxDuration' });
      io.to(`user:${parties.earnerId}`).emit('call:ended', { from: parties.payerId, chatId, reason: 'maxDuration' });
      return;
    }
    void tickMinute(io, chatId, sessionParties);
  }, 60_000);

  activeSessions.set(key, { timer, ...sessionParties });
  return true;
}

export function stopVideoCallBilling(chatId) {
  const key = sessionKey(chatId);
  const session = activeSessions.get(key);
  if (session?.timer) {
    clearInterval(session.timer);
  }
  activeSessions.delete(key);
  clearPendingCallType(chatId);
}

export function stopVideoCallBillingForUser(userId) {
  const uid = String(userId);
  for (const [key, session] of activeSessions.entries()) {
    if (session.payerId === uid || session.earnerId === uid) {
      if (session.timer) clearInterval(session.timer);
      activeSessions.delete(key);
    }
  }
}

export async function callerHasCoinsForCall(callerId, callType = 'video') {
  const caller = await User.findById(callerId).select('gender coins');
  if (!caller || caller.gender !== 'male') return true;
  const cpm = await getCoinsPerMinute(callType);
  return caller.coins >= cpm;
}
