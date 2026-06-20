import { useCallback, useEffect, useState } from 'react';
import { useCachedQuery } from '@/hooks/useCachedQuery';
import { CACHE } from '@/lib/cacheKeys';
import { useSearchParams } from 'react-router-dom';
import { Coins, CreditCard, History, Gift, Check, Zap, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import type { CoinPack, Transaction } from '@/types';
import { createCoinPurchase, fetchCoinPacks, fetchMyTransactions } from '@/lib/payments';
import TransactionHistoryList from '@/components/wallet/TransactionHistoryList';

export default function ManWallet() {
  const { user: currentUser, refreshUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'buy' | 'history'>('buy');
  const [purchasingPackId, setPurchasingPackId] = useState<string | null>(null);

  const {
    data: packs = [],
    showInitialLoading: loadingPacks,
  } = useCachedQuery<CoinPack[]>({
    cacheKey: CACHE.coinPacks,
    fetcher: fetchCoinPacks,
    userId: currentUser?.id,
    enabled: Boolean(currentUser),
  });

  const {
    data: transactions = [],
    showInitialLoading: loadingHistory,
    refresh: refreshHistory,
  } = useCachedQuery<Transaction[]>({
    cacheKey: CACHE.transactions,
    fetcher: fetchMyTransactions,
    userId: currentUser?.id,
    enabled: Boolean(currentUser) && activeTab === 'history',
  });

  const loadHistory = useCallback(async () => {
    try {
      await refreshHistory(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not load transactions');
    }
  }, [refreshHistory]);

  useEffect(() => {
    if (activeTab === 'history') void refreshHistory(true);
  }, [activeTab, refreshHistory]);

  useEffect(() => {
    const payment = searchParams.get('payment');
    if (!payment) return;

    if (payment === 'success') {
      toast.success('Payment received! Your coins will appear shortly.');
      void refreshUser();
      void loadHistory();
    } else if (payment === 'cancelled') {
      toast.info('Payment was cancelled.');
    }

    searchParams.delete('payment');
    setSearchParams(searchParams, { replace: true });
  }, [searchParams, setSearchParams, refreshUser, loadHistory]);

  const handlePurchase = async (pack: CoinPack) => {
    setPurchasingPackId(pack.id);
    try {
      const { invoiceUrl } = await createCoinPurchase(pack.id);
      if (!invoiceUrl) {
        throw new Error('No checkout URL returned');
      }
      window.location.href = invoiceUrl;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not start payment');
      setPurchasingPackId(null);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-gray-500">
        Loading…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Wallet</h1>
        <p className="text-gray-500">Manage your coins and transactions</p>
      </div>

      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 mb-1">Current Balance</p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Coins className="w-6 h-6" />
              </div>
              <span className="text-4xl font-bold">{currentUser.coins}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/80 text-sm">Estimated Value</p>
            <p className="text-2xl font-bold">${(currentUser.coins * 0.15).toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('buy')}
          className={`pb-3 text-sm font-medium transition-colors relative ${
            activeTab === 'buy' ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Buy Coins
          </div>
          {activeTab === 'buy' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 text-sm font-medium transition-colors relative ${
            activeTab === 'history' ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <History className="w-4 h-4" />
            Transaction History
          </div>
          {activeTab === 'history' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" />
          )}
        </button>
      </div>

      {activeTab === 'buy' ? (
        <div className="space-y-6">
          {loadingPacks ? (
            <div className="flex justify-center py-12 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {packs.map((pack) => (
                <div
                  key={pack.id}
                  className={`bg-white rounded-2xl p-6 shadow-sm ${
                    pack.isPopular ? 'ring-2 ring-green-500 relative' : ''
                  }`}
                >
                  {pack.isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Most Popular
                    </div>
                  )}
                  <h3 className="font-semibold text-gray-900 mb-2">{pack.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-bold text-gray-900">${pack.price}</span>
                    {pack.originalPrice != null && (
                      <span className="text-gray-400 line-through text-sm">
                        ${pack.originalPrice}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Coins className="w-4 h-4 text-yellow-600" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{pack.coins}</span>
                    <span className="text-gray-500">coins</span>
                  </div>
                  <ul className="space-y-2 mb-4">
                    {pack.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${pack.isPopular ? 'bg-green-500 hover:bg-green-600' : ''}`}
                    variant={pack.isPopular ? 'default' : 'outline'}
                    disabled={purchasingPackId !== null}
                    onClick={() => void handlePurchase(pack)}
                  >
                    {purchasingPackId === pack.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Redirecting…
                      </>
                    ) : (
                      'Purchase with Crypto'
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
            <Gift className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-700 font-medium">Crypto payments</p>
              <p className="text-sm text-blue-600">
                You will be redirected to NOWPayments to pay with Bitcoin, Ethereum, USDT, and
                other cryptocurrencies. Coins are added after payment is confirmed.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <TransactionHistoryList
            transactions={transactions}
            role="male"
            loading={loadingHistory}
          />
        </div>
      )}
    </div>
  );
}
