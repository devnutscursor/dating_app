import { apiGet, apiPost } from '@/lib/api';
import type { CoinPack, Transaction } from '@/types';

export async function fetchCoinPacks(): Promise<CoinPack[]> {
  const data = await apiGet<{ packs: CoinPack[] }>('/payments/packs');
  return data.packs;
}

export async function createCoinPurchase(packId: string): Promise<{ invoiceUrl: string }> {
  const data = await apiPost<{ invoiceUrl: string; orderId: string }>('/payments/create', {
    packId,
  });
  return { invoiceUrl: data.invoiceUrl };
}

export async function fetchMyTransactions(): Promise<Transaction[]> {
  const data = await apiGet<{ transactions: Transaction[] }>('/payments/transactions');
  return data.transactions;
}
