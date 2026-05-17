/**
 * Push a realtime notification to a user's socket room (`user:userId`).
 * @param {import('socket.io').Server | undefined} io
 */
export function emitInAppNotification(io, userId, payload) {
  if (!io || userId == null) return;
  const id = typeof userId === 'string' ? userId : userId.toString();
  io.to(`user:${id}`).emit('notification:new', payload);
}
