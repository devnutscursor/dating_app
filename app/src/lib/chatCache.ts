import type { Chat } from '@/types';

let cacheUserId: string | null = null;
let threadsCache: Chat[] | null = null;
const chatById = new Map<string, Chat>();
const draftsByChatId = new Map<string, string>();

export function ensureChatCacheUser(userId: string): void {
  if (cacheUserId === userId) return;
  clearChatCache();
  cacheUserId = userId;
}

export function clearChatCache(): void {
  cacheUserId = null;
  threadsCache = null;
  chatById.clear();
  draftsByChatId.clear();
}

export function getCachedThreads(): Chat[] | null {
  return threadsCache;
}

export function setCachedThreads(threads: Chat[]): void {
  threadsCache = threads;
  for (const t of threads) {
    const existing = chatById.get(t.id);
    if (!existing || existing.messages.length <= t.messages.length) {
      chatById.set(t.id, t);
    }
  }
}

export function getCachedChat(chatId: string): Chat | undefined {
  return chatById.get(chatId);
}

export function setCachedChat(chat: Chat): void {
  chatById.set(chat.id, chat);
  if (threadsCache) {
    const idx = threadsCache.findIndex((t) => t.id === chat.id);
    if (idx >= 0) {
      const next = [...threadsCache];
      next[idx] = chat;
      threadsCache = next;
    }
  }
}

export function clearCachedChat(chatId: string): void {
  chatById.delete(chatId);
  draftsByChatId.delete(chatId);
}

export function getChatDraft(chatId: string): string {
  return draftsByChatId.get(chatId) ?? '';
}

export function setChatDraft(chatId: string, text: string): void {
  if (text.trim()) draftsByChatId.set(chatId, text);
  else draftsByChatId.delete(chatId);
}
