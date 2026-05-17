import { io, type Socket } from 'socket.io-client';
import type { Chat } from '@/types';

export type ChatUpdatePayload = { chatId: string; chat: Chat };

let socket: Socket | null = null;
const chatUpdateSubscribers = new Set<(payload: ChatUpdatePayload) => void>();

export type NotificationNewPayload = {
  id: string;
  title: string;
  body: string;
  subtitle?: string;
  kind: string;
  createdAt: string;
};
const notificationSubscribers = new Set<(payload: NotificationNewPayload) => void>();

// ── Presence types ────────────────────────────────────────────────────────
export type PresenceChangedPayload = {
  userId: string;
  isOnline: boolean;
  lastActive?: string;
};
const presenceSubscribers = new Set<(payload: PresenceChangedPayload) => void>();

const PRESENCE_PING_MS = 45_000;
let presencePingTimer: ReturnType<typeof setInterval> | null = null;

function startPresencePing() {
  stopPresencePing();
  const emitPing = () => {
    if (socket?.connected) socket.emit('presence:ping');
  };
  emitPing();
  presencePingTimer = setInterval(emitPing, PRESENCE_PING_MS);
}

function stopPresencePing() {
  if (presencePingTimer) {
    clearInterval(presencePingTimer);
    presencePingTimer = null;
  }
}
// ─────────────────────────────────────────────────────────────────────────

// ── Call signaling types ──────────────────────────────────────────────────
export type CallType = 'audio' | 'video';

export type CallIncomingPayload = {
  from: string;
  chatId: string;
  callType: CallType;
};

export type CallSignalPayload = {
  from: string;
  chatId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signal: any;
};

export type CallStatusPayload = {
  from: string;
  chatId: string;
};

const callIncomingSubscribers = new Set<(payload: CallIncomingPayload) => void>();
const callAcceptedSubscribers = new Set<(payload: CallStatusPayload) => void>();
const callRejectedSubscribers = new Set<(payload: CallStatusPayload) => void>();
const callSignalSubscribers = new Set<(payload: CallSignalPayload) => void>();
const callEndedSubscribers = new Set<(payload: CallStatusPayload) => void>();
// ─────────────────────────────────────────────────────────────────────────

function socketBaseUrl(): string {
  const custom = (import.meta.env.VITE_SOCKET_URL as string | undefined)?.trim();
  if (custom) return custom.replace(/\/$/, '');
  const api = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  if (api && /^https?:\/\//i.test(api)) {
    try {
      return new URL(api).origin;
    } catch {
      /* ignore */
    }
  }
  return typeof window !== 'undefined' ? window.location.origin : '';
}

/** Single shared connection while logged in. */
export function connectChatSocket(token: string) {
  disconnectChatSocket();
  const url = socketBaseUrl();
  socket = io(url, {
    path: '/socket.io/',
    auth: { token },
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1500,
  });

  socket.on('chat:update', (payload: ChatUpdatePayload) => {
    if (!payload?.chatId || !payload.chat) return;
    for (const cb of chatUpdateSubscribers) {
      try {
        cb(payload);
      } catch {
        /* ignore subscriber errors */
      }
    }
  });

  socket.on('notification:new', (payload: NotificationNewPayload) => {
    if (!payload?.id) return;
    for (const cb of notificationSubscribers) {
      try {
        cb(payload);
      } catch {
        /* ignore */
      }
    }
  });

  socket.on('connect', () => {
    startPresencePing();
  });

  socket.on('presence:changed', (payload: PresenceChangedPayload) => {
    if (!payload?.userId) return;
    for (const cb of presenceSubscribers) {
      try {
        cb(payload);
      } catch {
        /* ignore */
      }
    }
  });

  socket.on('connect_error', (err) => {
    console.warn('[chat socket]', err.message);
  });

  // ── Call signaling listeners ──────────────────────────────────────────────
  socket.on('call:incoming', (payload: CallIncomingPayload) => {
    for (const cb of callIncomingSubscribers) {
      try { cb(payload); } catch { /* ignore */ }
    }
  });

  socket.on('call:accepted', (payload: CallStatusPayload) => {
    for (const cb of callAcceptedSubscribers) {
      try { cb(payload); } catch { /* ignore */ }
    }
  });

  socket.on('call:rejected', (payload: CallStatusPayload) => {
    for (const cb of callRejectedSubscribers) {
      try { cb(payload); } catch { /* ignore */ }
    }
  });

  socket.on('call:signal', (payload: CallSignalPayload) => {
    for (const cb of callSignalSubscribers) {
      try { cb(payload); } catch { /* ignore */ }
    }
  });

  socket.on('call:ended', (payload: CallStatusPayload) => {
    for (const cb of callEndedSubscribers) {
      try { cb(payload); } catch { /* ignore */ }
    }
  });
  // ─────────────────────────────────────────────────────────────────────────
}

export function disconnectChatSocket() {
  stopPresencePing();
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

export function subscribePresenceChanged(handler: (payload: PresenceChangedPayload) => void) {
  presenceSubscribers.add(handler);
  return () => {
    presenceSubscribers.delete(handler);
  };
}

export function subscribeChatUpdate(handler: (payload: ChatUpdatePayload) => void) {
  chatUpdateSubscribers.add(handler);
  return () => {
    chatUpdateSubscribers.delete(handler);
  };
}

export function subscribeNotificationNew(handler: (payload: NotificationNewPayload) => void) {
  notificationSubscribers.add(handler);
  return () => {
    notificationSubscribers.delete(handler);
  };
}

export function isChatSocketConnected(): boolean {
  return socket?.connected ?? false;
}

// ── Call signaling emitters ───────────────────────────────────────────────
export function emitCallInitiate(targetUserId: string, chatId: string, callType: CallType) {
  socket?.emit('call:initiate', { targetUserId, chatId, callType });
}

export function emitCallAccepted(targetUserId: string, chatId: string) {
  socket?.emit('call:accepted', { targetUserId, chatId });
}

export function emitCallRejected(targetUserId: string, chatId: string) {
  socket?.emit('call:rejected', { targetUserId, chatId });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function emitCallSignal(targetUserId: string, chatId: string, signal: any) {
  socket?.emit('call:signal', { targetUserId, chatId, signal });
}

export function emitCallEnded(targetUserId: string, chatId: string) {
  socket?.emit('call:ended', { targetUserId, chatId });
}

// ── Call signaling subscribers ────────────────────────────────────────────
export function subscribeCallIncoming(handler: (payload: CallIncomingPayload) => void) {
  callIncomingSubscribers.add(handler);
  return () => { callIncomingSubscribers.delete(handler); };
}

export function subscribeCallAccepted(handler: (payload: CallStatusPayload) => void) {
  callAcceptedSubscribers.add(handler);
  return () => { callAcceptedSubscribers.delete(handler); };
}

export function subscribeCallRejected(handler: (payload: CallStatusPayload) => void) {
  callRejectedSubscribers.add(handler);
  return () => { callRejectedSubscribers.delete(handler); };
}

export function subscribeCallSignal(handler: (payload: CallSignalPayload) => void) {
  callSignalSubscribers.add(handler);
  return () => { callSignalSubscribers.delete(handler); };
}

export function subscribeCallEnded(handler: (payload: CallStatusPayload) => void) {
  callEndedSubscribers.add(handler);
  return () => { callEndedSubscribers.delete(handler); };
}
// ─────────────────────────────────────────────────────────────────────────
