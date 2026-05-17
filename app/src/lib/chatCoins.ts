import type { Message } from '@/types';

/** Sum gift coins received from the chat partner (not sent by the viewer). */
export function sumCoinsReceivedFromPeer(messages: Message[] | undefined, viewerId: string | undefined): number {
  if (!messages?.length || !viewerId) return 0;
  return messages.reduce((sum, msg) => {
    if (msg.type !== 'gift') return sum;
    if (msg.senderId === viewerId) return sum;
    const amt = Number(msg.giftAmount);
    return sum + (Number.isFinite(amt) && amt > 0 ? amt : 0);
  }, 0);
}
