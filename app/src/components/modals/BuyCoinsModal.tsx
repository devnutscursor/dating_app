import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Coins, Loader2, Zap, Wallet, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { createCoinPurchase, fetchCoinPacks } from '@/lib/payments';
import type { CoinPack } from '@/types';

type BuyCoinsModalProps = {
  open: boolean;
  onClose: () => void;
  reason?: string;
};

export default function BuyCoinsModal({ open, onClose, reason }: BuyCoinsModalProps) {
  const { user } = useAuth();
  const [packs, setPacks] = useState<CoinPack[]>([]);
  const [loading, setLoading] = useState(false);
  const [purchasingPackId, setPurchasingPackId] = useState<string | null>(null);

  const loadPacks = useCallback(async () => {
    setLoading(true);
    try {
      setPacks(await fetchCoinPacks());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not load coin packs');
      setPacks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      setPurchasingPackId(null);
      return;
    }
    void loadPacks();
  }, [open, loadPacks]);

  if (!open) return null;

  const balance = user?.coins ?? 0;
  const minPackUsd = packs.length ? Math.min(...packs.map((p) => p.price)) : 14.99;

  const handlePurchase = async (pack: CoinPack) => {
    setPurchasingPackId(pack.id);
    try {
      const { invoiceUrl } = await createCoinPurchase(pack.id);
      if (!invoiceUrl) throw new Error('No checkout URL returned');
      window.location.href = invoiceUrl;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not start payment');
      setPurchasingPackId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/55" onClick={onClose} aria-hidden />
      <div className="relative flex max-h-[min(92dvh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl">
        <div className="flex shrink-0 items-start justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Get more coins</h2>
            <p className="mt-1 text-sm text-gray-500">
              {reason || 'You need more coins to continue.'}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={purchasingPackId !== null}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex shrink-0 items-start gap-2 border-b border-amber-200 bg-amber-50 px-5 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-xs text-amber-800">
            Pay the full invoice amount (from ${minPackUsd.toFixed(2)}). Underpayments are not
            credited and may not be refundable.
          </p>
        </div>

        <div className="flex items-center gap-3 border-b border-gray-100 bg-amber-50/50 px-5 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
            <Coins className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-amber-900/70">Your balance</p>
            <p className="text-xl font-bold text-amber-950">{balance} coins</p>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex justify-center py-10 text-gray-500">
              <Loader2 className="h-7 w-7 animate-spin" />
            </div>
          ) : packs.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">No coin packs available right now.</p>
          ) : (
            <div className="space-y-3">
              {packs.map((pack) => (
                <div
                  key={pack.id}
                  className={`rounded-2xl border p-4 ${
                    pack.isPopular ? 'border-green-300 bg-green-50/40' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{pack.name}</h3>
                        {pack.isPopular ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
                            <Zap className="h-3 w-3" />
                            Popular
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        <span className="font-bold text-gray-900">{pack.coins}</span> coins · ${pack.price}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className={pack.isPopular ? 'bg-green-500 hover:bg-green-600' : ''}
                      variant={pack.isPopular ? 'default' : 'outline'}
                      disabled={purchasingPackId !== null}
                      onClick={() => void handlePurchase(pack)}
                    >
                      {purchasingPackId === pack.id ? (
                        <>
                          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                          Redirecting…
                        </>
                      ) : (
                        'Buy'
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="mt-4 text-center text-xs text-gray-500">
            Pay with crypto via NOWPayments. Coins appear after payment confirms.
          </p>
        </div>

        <div className="shrink-0 border-t border-gray-200 px-5 py-4">
          <Button variant="outline" className="w-full gap-2" asChild onClick={onClose}>
            <Link to="/man/wallet">
              <Wallet className="h-4 w-4" />
              Open full wallet
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
