import { apiPost } from '@/lib/api';
import type { Chat } from '@/types';

export async function createOrGetChat(participantId: string): Promise<Chat> {
  const data = await apiPost<{ chat: Chat }>('/chats', { participantId });
  return data.chat;
}

export async function createOrGetSupportChat(): Promise<Chat> {
  const data = await apiPost<{ chat: Chat }>('/chats/support', {});
  return data.chat;
}

export type PostChatMessageBody = {
  content?: string;
  type?: 'text' | 'image' | 'video' | 'gift';
  mediaUrl?: string;
  giftAmount?: number;
  giftComment?: string;
};

export async function setChatPinned(chatId: string, pinned: boolean): Promise<{ chat: Chat }> {
  return apiPost(`/chats/${chatId}/pin`, { pinned });
}

export type PostChatMessageResult = { chat: Chat; coins?: number };

export async function postChatMessage(
  chatId: string,
  body: PostChatMessageBody
): Promise<PostChatMessageResult> {
  const data = await apiPost<{ chat: Chat; coins?: number }>(`/chats/${chatId}/messages`, body);
  return { chat: data.chat, coins: data.coins };
}

export async function postBlockChat(chatId: string): Promise<{ ok: boolean; chat?: Chat; alreadyBlocked?: boolean }> {
  return apiPost(`/chats/${chatId}/block`, {});
}

export type PostReportChatBody = {
  type: 'financial' | 'profile' | 'harassment';
  topic: string;
  comment: string;
};

export async function postReportChat(
  chatId: string,
  body: PostReportChatBody
): Promise<{ ok: boolean; chat: Chat }> {
  return apiPost(`/chats/${chatId}/report`, body);
}
