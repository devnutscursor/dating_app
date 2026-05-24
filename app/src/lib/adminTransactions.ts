import { apiGet } from '@/lib/api';
import type { Transaction } from '@/types';

export type AdminTransaction = Transaction & {
  userName?: string;
  userEmail?: string;
  priceUsd?: number;
};

export type AdminTransactionStats = {
  stats: {
    totalRevenueUsd: number;
    coinPurchases: number;
    videoCallMinutes: number;
    purchasesChange: string;
    videoCallsChange: string;
  };
};

export async function fetchAdminTransactions(params?: {
  type?: string;
  search?: string;
}): Promise<{ transactions: AdminTransaction[] }> {
  const q = new URLSearchParams();
  if (params?.type && params.type !== 'all') q.set('type', params.type);
  if (params?.search?.trim()) q.set('search', params.search.trim());
  const qs = q.toString();
  return apiGet(`/admin/transactions${qs ? `?${qs}` : ''}`);
}

export async function fetchAdminTransactionStats(): Promise<AdminTransactionStats> {
  return apiGet<AdminTransactionStats>('/admin/transactions/stats');
}
