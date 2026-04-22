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
    case 'gift': {
      const label = lastMessage.content?.trim();
      const coins = lastMessage.giftAmount;
      if (label && coins != null) return `${label} (${coins} coins)`;
      if (label) return label;
      return 'Sent a gift';
    }
    default:
      return 'Message';
  }
}
