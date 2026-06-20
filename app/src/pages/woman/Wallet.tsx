import { useCallback, useEffect, useState } from 'react';
import { Coins, History, Gift, Video, TrendingUp, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useCachedQuery } from '@/hooks/useCachedQuery';
import { CACHE } from '@/lib/cacheKeys';
import { fetchMyTransactions } from '@/lib/payments';
import { earningsOverview } from '@/lib/walletTransactions';
import { useCallPricing } from '@/lib/callPricing';
import TransactionHistoryList from '@/components/wallet/TransactionHistoryList';
import type { Transaction } from '@/types';

export default function WomanWallet() {
  const { user: currentWomanUser } = useAuth();
  const callPricing = useCallPricing();
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');

  const {
    data: transactions = [],
    showInitialLoading: loading,
    refresh: refreshHistory,
  } = useCachedQuery<Transaction[]>({
    cacheKey: CACHE.transactions,
    fetcher: fetchMyTransactions,
    userId: currentWomanUser?.id,
    enabled: Boolean(currentWomanUser),
  });

  const loadHistory = useCallback(async () => {
    try {
      await refreshHistory(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not load transactions');
    }
  }, [refreshHistory]);

  useEffect(() => {
    if (currentWomanUser) void refreshHistory(true);
  }, [currentWomanUser, refreshHistory]);

  if (!currentWomanUser) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-gray-500">Loading…</div>
    );
  }

  const { videoCallEarnings, giftEarnings, tipEarnings, totalEarnings } =
    earningsOverview(transactions);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Wallet</h1>
        <p className="text-gray-500">Track your earnings and balance</p>
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="mb-1 text-white/80">Available Balance</p>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                <Coins className="h-6 w-6" />
              </div>
              <span className="text-4xl font-bold">{currentWomanUser.coins}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/80">Estimated Value</p>
            <p className="text-2xl font-bold">${(currentWomanUser.coins * 0.15).toFixed(2)}</p>
          </div>
        </div>
      </div>

      <Link to="/woman/payouts">
        <div className="flex cursor-pointer items-center justify-between rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white transition-shadow hover:shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-semibold">Go to Payouts</p>
              <p className="text-sm text-white/80">Withdraw your earnings</p>
            </div>
          </div>
          <ArrowRight className="h-6 w-6" />
        </div>
      </Link>

      <div className="flex gap-4 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`relative pb-3 text-sm font-medium transition-colors ${
            activeTab === 'overview' ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Earnings Overview
          </div>
          {activeTab === 'overview' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" />
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('history');
            void loadHistory();
          }}
          className={`relative pb-3 text-sm font-medium transition-colors ${
            activeTab === 'history' ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Transaction History
          </div>
          {activeTab === 'history' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" />
          )}
        </button>
      </div>

      {loading && activeTab === 'overview' ? (
        <div className="flex justify-center py-12 text-gray-500">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : activeTab === 'overview' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-purple-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <Video className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Video Calls</p>
                <p className="text-sm text-gray-500">
                  {callPricing.videoCallPerMinute} Koins/minute earned
                </p>
              </div>
            </div>
            <p className="font-semibold text-purple-600">+{videoCallEarnings} Koins</p>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-pink-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100">
                <Gift className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Gifts Received</p>
                <p className="text-sm text-gray-500">From your fans</p>
              </div>
            </div>
            <p className="font-semibold text-pink-600">+{giftEarnings} Koins</p>
          </div>

          {tipEarnings > 0 ? (
            <div className="flex items-center justify-between rounded-xl bg-cyan-50 p-4">
              <div>
                <p className="font-medium text-gray-900">Messages</p>
                <p className="text-sm text-gray-500">Paid chat replies</p>
              </div>
              <p className="font-semibold text-cyan-600">+{tipEarnings} Koins</p>
            </div>
          ) : null}

          <div className="rounded-xl bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">Total Earnings</span>
              <span className="text-2xl font-bold text-green-600">{totalEarnings} Koins</span>
            </div>
            <p className="mt-1 text-sm text-gray-500">≈ ${(totalEarnings * 0.15).toFixed(2)} USD</p>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <TransactionHistoryList
            transactions={transactions}
            role="female"
            loading={loading}
          />
        </div>
      )}
    </div>
  );
}

