import { apiGet, apiPatch, apiPost } from '@/lib/api';
import type { PayoutRequest } from '@/types';

export type PayoutConfig = {
  coinToUsd: number;
  minWithdrawalUsd: number;
  feeRate: number;
};

/** Coin → USD display rate ($5 per 100 coins). */
export const COIN_TO_USD = 0.05;

/** @deprecated Use COIN_TO_USD */
export const FEMALE_COIN_TO_USD = COIN_TO_USD;

export function coinsToUsdDisplay(coins: number): string {
  return (Math.round(coins * COIN_TO_USD * 100) / 100).toFixed(2);
}

/** @deprecated Use coinsToUsdDisplay */
export function femaleCoinsToUsd(coins: number): string {
  return coinsToUsdDisplay(coins);
}

export type AdminPayout = PayoutRequest & {
  userName?: string;
  userEmail?: string;
  wallet?: string;
  netUsd?: number;
  feeCoins?: number;
  amountCoins?: number;
};

export type AdminPayoutStats = {
  stats: {
    pendingCount: number;
    processingCount: number;
    completedTodayCount: number;
    pendingUsdTotal: number;
    processingUsdTotal: number;
    completedTodayUsd: number;
    monthCompletedUsd: number;
  };
};

export async function requestPayout(body: {
  amountCoins: number;
  walletAddress: string;
}): Promise<{ payout: AdminPayout; coins: number; config: PayoutConfig }> {
  return apiPost('/payouts/request', body);
}

export async function fetchMyPayouts(): Promise<{
  payouts: AdminPayout[];
  walletAddress: string;
  config: PayoutConfig;
}> {
  return apiGet('/payouts/mine');
}

export async function fetchAdminPayouts(params?: {
  status?: string;
  search?: string;
}): Promise<{ payouts: AdminPayout[] }> {
  const q = new URLSearchParams();
  if (params?.status && params.status !== 'all') q.set('status', params.status);
  if (params?.search?.trim()) q.set('search', params.search.trim());
  const qs = q.toString();
  return apiGet(`/admin/payouts${qs ? `?${qs}` : ''}`);
}

export async function fetchAdminPayoutStats(): Promise<AdminPayoutStats> {
  return apiGet<AdminPayoutStats>('/admin/payouts/stats');
}

export async function patchAdminPayout(
  id: string,
  body: { status: 'processing' | 'completed' | 'rejected'; adminNote?: string }
): Promise<{ payout: AdminPayout }> {
  return apiPatch(`/admin/payouts/${id}`, body);
}
