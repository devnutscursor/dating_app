import { apiPost } from '@/lib/api';
import type { Chat } from '@/types';

export async function createOrGetChat(participantId: string): Promise<Chat> {
  const data = await apiPost<{ chat: Chat }>('/chats', { participantId });
  return data.chat;
}

export type PostChatMessageBody = {
  content?: string;
  type?: 'text' | 'image' | 'video' | 'gift';
  mediaUrl?: string;
  giftAmount?: number;
};

export type PostChatMessageResult = { chat: Chat; coins?: number };

export async function postChatMessage(
  chatId: string,
  body: PostChatMessageBody
): Promise<PostChatMessageResult> {
  const data = await apiPost<{ chat: Chat; coins?: number }>(`/chats/${chatId}/messages`, body);
  return { chat: data.chat, coins: data.coins };
}
