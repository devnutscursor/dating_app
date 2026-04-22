import { apiPost } from '@/lib/api';
import type { Chat } from '@/types';

export async function createOrGetChat(participantId: string): Promise<Chat> {
  const data = await apiPost<{ chat: Chat }>('/chats', { participantId });
  return data.chat;
}
