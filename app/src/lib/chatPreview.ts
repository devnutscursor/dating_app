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

/** Pinned threads first, then most recently updated (server also sorts; this keeps UI consistent after local updates). */
export function sortChatThreadsPinnedFirst(threads: Chat[]): Chat[] {
  return [...threads].sort((a, b) => {
    const aPin = a.isPinned ? 1 : 0;
    const bPin = b.isPinned ? 1 : 0;
    if (aPin !== bPin) return bPin - aPin;
    return 0;
  });
}

/** Filter chat sidebar threads by participant name, preview text, or user id. */
export function filterChatThreads(threads: Chat[], query: string): Chat[] {
  const q = query.trim().toLowerCase();
  if (!q) return sortChatThreadsPinnedFirst(threads);
  const filtered = threads.filter((thread) => {
    const name = thread.participant.name?.toLowerCase() ?? '';
    const preview = chatPreviewLine(thread.lastMessage).toLowerCase();
    const id = thread.participant.id?.toLowerCase() ?? '';
    return name.includes(q) || preview.includes(q) || id.includes(q);
  });
  return sortChatThreadsPinnedFirst(filtered);
}
