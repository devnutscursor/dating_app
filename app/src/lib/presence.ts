import type { Chat } from '@/types';
import type { PresenceChangedPayload } from '@/lib/chatSocket';

export function patchChatWithPresence(chat: Chat, payload: PresenceChangedPayload): Chat {
  if (chat.participant.id !== payload.userId) return chat;
  return {
    ...chat,
    participant: {
      ...chat.participant,
      isOnline: payload.isOnline,
      lastActive: payload.lastActive ?? chat.participant.lastActive,
    },
  };
}

export function patchThreadsWithPresence(threads: Chat[], payload: PresenceChangedPayload): Chat[] {
  return threads.map((t) => patchChatWithPresence(t, payload));
}
