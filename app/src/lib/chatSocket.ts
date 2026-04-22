import { io, type Socket } from 'socket.io-client';
import type { Chat } from '@/types';

export type ChatUpdatePayload = { chatId: string; chat: Chat };

let socket: Socket | null = null;
const chatUpdateSubscribers = new Set<(payload: ChatUpdatePayload) => void>();

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

  socket.on('connect_error', (err) => {
    console.warn('[chat socket]', err.message);
  });
}

export function disconnectChatSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

export function subscribeChatUpdate(handler: (payload: ChatUpdatePayload) => void) {
  chatUpdateSubscribers.add(handler);
  return () => {
    chatUpdateSubscribers.delete(handler);
  };
}

export function isChatSocketConnected(): boolean {
  return socket?.connected ?? false;
}
