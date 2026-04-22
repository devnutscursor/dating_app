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
  });

  return io;
}
