import { User } from '../models/User.model.js';
import { formatLastActive } from '../utils/formatLastActive.js';

/** No socket ping for this long → mark offline (ms). */
const IDLE_MS = Number(process.env.PRESENCE_IDLE_MS) || 2 * 60 * 1000;
const SWEEP_MS = 30_000;
const HEARTBEAT_DB_THROTTLE_MS = 45_000;

/** @type {import('socket.io').Server | null} */
let io = null;

/** userId → Set<socketId> */
const socketsByUser = new Map();
/** userId → last ping timestamp */
const lastPingAt = new Map();
/** userId → last DB lastActive write */
const lastDbTouchAt = new Map();

export function initPresence(socketServer) {
  io = socketServer;
  setInterval(() => {
    void sweepIdleUsers();
  }, SWEEP_MS).unref?.();
}

function broadcastPresence(userId, isOnline, lastActive) {
  if (!io) return;
  io.emit('presence:changed', {
    userId: String(userId),
    isOnline: Boolean(isOnline),
    lastActive: lastActive ?? undefined,
  });
}

async function setUserOnline(userId) {
  const now = new Date();
  await User.findByIdAndUpdate(userId, {
    isOnline: true,
    lastActive: formatLastActive(now),
  });
  lastDbTouchAt.set(String(userId), Date.now());
  broadcastPresence(userId, true, formatLastActive(now));
}

async function setUserOffline(userId) {
  const now = new Date();
  const label = formatLastActive(now);
  await User.findByIdAndUpdate(userId, {
    isOnline: false,
    lastActive: label,
  });
  lastDbTouchAt.delete(String(userId));
  broadcastPresence(userId, false, label);
}

/**
 * Socket connected for a member (after JWT auth).
 * @param {string} userId
 * @param {string} socketId
 */
export async function onSocketConnect(userId, socketId) {
  const uid = String(userId);
  let set = socketsByUser.get(uid);
  const firstConnection = !set || set.size === 0;
  if (!set) {
    set = new Set();
    socketsByUser.set(uid, set);
  }
  set.add(socketId);
  lastPingAt.set(uid, Date.now());
  if (firstConnection) {
    await setUserOnline(uid);
  } else {
    await touchPresence(uid, { forceDb: false });
  }
}

/**
 * Socket disconnected.
 * @param {string} userId
 * @param {string} socketId
 */
export async function onSocketDisconnect(userId, socketId) {
  const uid = String(userId);
  const set = socketsByUser.get(uid);
  if (!set) return;
  set.delete(socketId);
  if (set.size === 0) {
    socketsByUser.delete(uid);
    lastPingAt.delete(uid);
    await setUserOffline(uid);
  }
}

/**
 * Client heartbeat while app is open.
 * @param {string} userId
 */
export async function touchPresence(userId, { forceDb = false } = {}) {
  const uid = String(userId);
  const now = Date.now();
  lastPingAt.set(uid, now);

  const lastDb = lastDbTouchAt.get(uid) ?? 0;
  if (!forceDb && now - lastDb < HEARTBEAT_DB_THROTTLE_MS) return;

  const stamp = formatLastActive(new Date(now));
  await User.findByIdAndUpdate(uid, {
    isOnline: true,
    lastActive: stamp,
  });
  lastDbTouchAt.set(uid, now);
}

/** Explicit logout or admin action — mark offline even if sockets linger briefly. */
export async function forceUserOffline(userId) {
  const uid = String(userId);
  socketsByUser.delete(uid);
  lastPingAt.delete(uid);
  if (io) {
    const room = io.sockets.adapter.rooms.get(`user:${uid}`);
    if (room) {
      for (const sid of room) {
        const s = io.sockets.sockets.get(sid);
        if (s) s.disconnect(true);
      }
    }
  }
  await setUserOffline(uid);
}

async function sweepIdleUsers() {
  const now = Date.now();
  for (const [uid, last] of lastPingAt) {
    if (now - last <= IDLE_MS) continue;
    const set = socketsByUser.get(uid);
    if (!set?.size) {
      lastPingAt.delete(uid);
      continue;
    }
    if (io) {
      for (const sid of set) {
        const s = io.sockets.sockets.get(sid);
        if (s) s.disconnect(true);
      }
    }
    socketsByUser.delete(uid);
    lastPingAt.delete(uid);
    await setUserOffline(uid);
  }
}
