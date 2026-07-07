import { Server } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt.js';
import { User } from '../models/User.model.js';
import {
  initPresence,
  onSocketConnect,
  onSocketDisconnect,
  touchPresence,
} from '../services/presence.js';
import {
  getConfiguredCoinsPerMinute,
  callerHasCoinsForCall,
  resolveVideoCallBilling,
  startVideoCallBilling,
  stopVideoCallBilling,
  stopVideoCallBillingForUser,
  setPendingCallType,
  consumePendingCallType,
  clearPendingCallType,
} from '../services/videoCallBilling.js';

/**
 * @param {import('http').Server} httpServer
 * @returns {import('socket.io').Server}
 */
export function initSocketIO(httpServer) {
  const io = new Server(httpServer, {
    path: '/socket.io/',
    cors: {
      origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
      credentials: true,
    },
  });

  initPresence(io);

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token || typeof token !== 'string') {
        return next(new Error('Authentication required'));
      }
      const payload = verifyAccessToken(token);
      const user = await User.findById(payload.sub);
      if (!user) return next(new Error('User not found'));
      if (user.isBlocked) return next(new Error('Account suspended'));
      socket.data.userId = user._id.toString();
      return next();
    } catch {
      return next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const uid = socket.data.userId;
    socket.join(`user:${uid}`);

    void onSocketConnect(uid, socket.id);

    socket.on('presence:ping', () => {
      void touchPresence(uid);
    });

    socket.on('disconnect', () => {
      stopVideoCallBillingForUser(uid);
      void onSocketDisconnect(uid, socket.id);
    });

    // ── Audio / Video call signaling ──────────────────────────────────────────
    // All events are pure relay: the server never inspects media.

    socket.on('call:initiate', async ({ targetUserId, chatId, callType }) => {
      if (!targetUserId || !chatId) return;
      const type = callType === 'audio' ? 'audio' : 'video';
      setPendingCallType(chatId, type);
      const hasCoins = await callerHasCoinsForCall(uid, type);
      if (!hasCoins) {
        clearPendingCallType(chatId);
        const cpm = await getConfiguredCoinsPerMinute(type);
        const label = type === 'audio' ? 'voice call' : 'video chat';
        socket.emit('call:billing-failed', {
          chatId,
          reason: 'insufficient',
          message: `You need at least ${cpm} coins to start a ${label}.`,
        });
        return;
      }
      io.to(`user:${targetUserId}`).emit('call:incoming', {
        from: uid,
        chatId,
        callType: type,
      });
    });

    socket.on('call:accepted', async ({ targetUserId, chatId }) => {
      if (!targetUserId || !chatId) return;

      const callType = consumePendingCallType(chatId);
      const parties = await resolveVideoCallBilling(uid, targetUserId, chatId);
      if (parties) {
        const billingStarted = await startVideoCallBilling(io, chatId, parties, callType);
        if (!billingStarted) {
          io.to(`user:${targetUserId}`).emit('call:billing-failed', {
            chatId,
            reason: 'insufficient',
            message: 'Caller does not have enough coins for this call.',
          });
          io.to(`user:${targetUserId}`).emit('call:rejected', { from: uid, chatId });
          return;
        }
      }

      io.to(`user:${targetUserId}`).emit('call:accepted', { from: uid, chatId });
    });

    socket.on('call:rejected', async ({ targetUserId, chatId }) => {
      if (!targetUserId || !chatId) return;
      clearPendingCallType(chatId);
      await stopVideoCallBilling(chatId);
      io.to(`user:${targetUserId}`).emit('call:rejected', { from: uid, chatId });
    });

    socket.on('call:signal', ({ targetUserId, chatId, signal }) => {
      if (!targetUserId || !chatId || !signal) return;
      io.to(`user:${targetUserId}`).emit('call:signal', { from: uid, chatId, signal });
    });

    socket.on('call:ended', async ({ targetUserId, chatId }) => {
      if (!targetUserId || !chatId) return;
      await stopVideoCallBilling(chatId);
      io.to(`user:${targetUserId}`).emit('call:ended', { from: uid, chatId });
    });
    // ─────────────────────────────────────────────────────────────────────────
  });

  return io;
}
