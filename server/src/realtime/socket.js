import { Server } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt.js';
import { User } from '../models/User.model.js';

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

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token || typeof token !== 'string') {
        return next(new Error('Authentication required'));
      }
      const payload = verifyAccessToken(token);
      const user = await User.findById(payload.sub);
      if (!user) return next(new Error('User not found'));
      socket.data.userId = user._id.toString();
      return next();
    } catch {
      return next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const uid = socket.data.userId;
    socket.join(`user:${uid}`);

    // ── Audio / Video call signaling ──────────────────────────────────────────
    // All events are pure relay: the server never inspects media.

    // Caller → callee: announce an incoming call
    socket.on('call:initiate', ({ targetUserId, chatId, callType }) => {
      if (!targetUserId || !chatId) return;
      io.to(`user:${targetUserId}`).emit('call:incoming', {
        from: uid,
        chatId,
        callType: callType === 'audio' ? 'audio' : 'video',
      });
    });

    // Callee → caller: call was accepted
    socket.on('call:accepted', ({ targetUserId, chatId }) => {
      if (!targetUserId || !chatId) return;
      io.to(`user:${targetUserId}`).emit('call:accepted', { from: uid, chatId });
    });

    // Callee → caller: call was rejected / declined
    socket.on('call:rejected', ({ targetUserId, chatId }) => {
      if (!targetUserId || !chatId) return;
      io.to(`user:${targetUserId}`).emit('call:rejected', { from: uid, chatId });
    });

    // Either peer → other peer: WebRTC signal data (offer / answer / ICE candidate)
    socket.on('call:signal', ({ targetUserId, chatId, signal }) => {
      if (!targetUserId || !chatId || !signal) return;
      io.to(`user:${targetUserId}`).emit('call:signal', { from: uid, chatId, signal });
    });

    // Either peer → other peer: call has ended / hung up
    socket.on('call:ended', ({ targetUserId, chatId }) => {
      if (!targetUserId || !chatId) return;
      io.to(`user:${targetUserId}`).emit('call:ended', { from: uid, chatId });
    });
    // ─────────────────────────────────────────────────────────────────────────
  });

  return io;
}
