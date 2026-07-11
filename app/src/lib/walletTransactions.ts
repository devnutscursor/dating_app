import type { Transaction, User } from '@/types';

type MemberRole = User['role'];

export function formatTransactionDate(timestamp: string): string {
  const d = new Date(timestamp);
  if (Number.isNaN(d.getTime())) return timestamp;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

/** Whether this transaction increased the member's balance (for display sign/color). */
export function isTransactionCredit(tx: Transaction, role: MemberRole): boolean {
  if (tx.status !== 'completed') return false;
  if (role === 'female') {
    return tx.type === 'videoCall' || tx.type === 'gift' || tx.type === 'tip' || tx.type === 'unlock';
  }
  return tx.type === 'purchase';
}

export function earningsOverview(transactions: Transaction[]) {
  const completed = transactions.filter((t) => t.status === 'completed');
  const sum = (type: Transaction['type']) =>
    completed.filter((t) => t.type === type).reduce((n, t) => n + t.amount, 0);

  const videoCallEarnings = sum('videoCall');
  const giftEarnings = sum('gift');
  const tipEarnings = sum('tip');
  const unlockEarnings = sum('unlock');
  const totalEarnings = videoCallEarnings + giftEarnings + tipEarnings + unlockEarnings;

  return { videoCallEarnings, giftEarnings, tipEarnings, unlockEarnings, totalEarnings };
}
