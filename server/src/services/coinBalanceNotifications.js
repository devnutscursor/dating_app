import { createInAppNotification } from './inAppNotifications.js';

/**
 * Notify a member when their coin balance changes from a platform action
 * (admin adjustment, purchase, payout hold/refund, etc.).
 */
export async function notifyCoinBalanceChange(io, { userId, delta, newBalance, reason }) {
  const change = Math.trunc(Number(delta));
  if (!userId || !Number.isFinite(change) || change === 0) return;

  const abs = Math.abs(change);
  const balance = Math.max(0, Math.trunc(Number(newBalance)) || 0);
  const credit = change > 0;

  const title = credit ? 'Coins added' : 'Coins deducted';
  const body = credit
    ? `${abs} coin${abs === 1 ? '' : 's'} added to your balance. New balance: ${balance} coins.`
    : `${abs} coin${abs === 1 ? '' : 's'} deducted from your balance. New balance: ${balance} coins.`;

  try {
    await createInAppNotification(io, {
      userId,
      kind: 'system',
      title,
      body,
      subtitle: reason ? String(reason).slice(0, 500) : undefined,
    });
  } catch (err) {
    console.error('notifyCoinBalanceChange', err);
  }
}
