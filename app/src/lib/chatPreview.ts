import type { Chat } from '@/types';

/** Single-line preview for chat list rows (sidebar / threads). */
export function chatPreviewLine(lastMessage: Chat['lastMessage'] | undefined): string {
  if (!lastMessage?.type) return 'No messages yet';
  switch (lastMessage.type) {
    case 'text':
      return lastMessage.content?.trim() || 'Message';
    case 'image':
      return 'Photo';
    case 'video':
      return 'Video';
    case 'gift':
      return 'Sent a gift';
    default:
      return 'Message';
  }
}
