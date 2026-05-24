import { useCallback, useEffect, useState } from 'react';
import { DollarSign, Check, X, Clock, Search, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  fetchAdminPayouts,
  fetchAdminPayoutStats,
  patchAdminPayout,
  type AdminPayout,
} from '@/lib/payouts';

type StatusFilter = 'all' | 'pending' | 'processing' | 'completed' | 'rejected';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-700';
    case 'processing':
      return 'bg-blue-100 text-blue-700';
    case 'completed':
      return 'bg-green-100 text-green-700';
    case 'rejected':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="w-4 h-4" />;
    case 'processing':
      return <Wallet className="w-4 h-4" />;
    case 'completed':
      return <Check className="w-4 h-4" />;
    case 'rejected':
      return <X className="w-4 h-4" />;
    default:
      return null;
  }
};

function formatWhen(iso: string) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function AdminPayouts() {
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [payouts, setPayouts] = useState<AdminPayout[]>([]);
  const [stats, setStats] = useState<{
    pendingUsdTotal: number;
    processingUsdTotal: number;
    completedTodayUsd: number;
    monthCompletedUsd: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [listRes, statsRes] = await Promise.all([
        fetchAdminPayouts({ status: filter, search: searchDebounced }),
        fetchAdminPayoutStats(),
      ]);
      setPayouts(listRes.payouts);
      setStats(statsRes.stats);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load payouts');
    } finally {
      setLoading(false);
    }
  }, [filter, searchDebounced]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleAction = async (
    id: string,
    status: 'processing' | 'completed' | 'rejected',
    adminNote?: string
  ) => {
    if (status === 'rejected' && !window.confirm('Reject this payout? Coins will be refunded to the member.')) {
      return;
    }
    setActingId(id);
    try {
      await patchAdminPayout(id, { status, adminNote });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payouts</h1>
          <p className="text-gray-500">Manage withdrawal requests</p>
        </div>
        <div className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg">
          <DollarSign className="w-4 h-4" />
          <span className="font-medium">
            ${(stats?.pendingUsdTotal ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} pending
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-gray-500 text-sm">Pending (net USD)</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            ${(stats?.pendingUsdTotal ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-gray-500 text-sm">Processing</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            ${(stats?.processingUsdTotal ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-gray-500 text-sm">Completed (Today)</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            ${(stats?.completedTodayUsd ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-gray-500 text-sm">Total (This Month)</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            ${(stats?.monthCompletedUsd ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or wallet…"
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(['all', 'pending', 'processing', 'completed', 'rejected'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                filter === status ? 'bg-green-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100">
          {loading && payouts.length === 0 ? (
            <p className="p-8 text-center text-gray-500">Loading…</p>
          ) : payouts.length === 0 ? (
            <p className="p-8 text-center text-gray-500">No payout requests found</p>
          ) : (
            payouts.map((payout) => (
              <div key={payout.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}
                      >
                        {getStatusIcon(payout.status)}
                        {payout.status}
                      </span>
                      <span className="text-sm text-gray-400">{formatWhen(payout.requestedAt)}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-6">
                      <div>
                        <p className="text-sm text-gray-500">User</p>
                        <p className="font-medium text-gray-900">{payout.userName || 'Member'}</p>
                        {payout.userEmail && <p className="text-xs text-gray-500">{payout.userEmail}</p>}
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Amount</p>
                        <p className="font-medium text-gray-900">
                          {payout.amountCoins ?? payout.amount} coins
                        </p>
                        <p className="text-xs text-gray-500">
                          ≈ ${(payout.netUsd ?? 0).toFixed(2)} net after fee
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-gray-500">Wallet</p>
                        <p className="font-medium text-gray-900 font-mono text-sm truncate max-w-xs" title={payout.walletAddress}>
                          {payout.walletAddress || payout.wallet}
                        </p>
                      </div>
                    </div>
                    {payout.adminNote && (
                      <p className="mt-2 text-sm text-red-600">Note: {payout.adminNote}</p>
                    )}
                  </div>

                  {payout.status === 'pending' && (
                    <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        disabled={actingId === payout.id}
                        onClick={() => void handleAction(payout.id, 'processing')}
                      >
                        <Wallet className="w-4 h-4" />
                        Processing
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 gap-1"
                        disabled={actingId === payout.id}
                        onClick={() => void handleAction(payout.id, 'completed')}
                      >
                        <Check className="w-4 h-4" />
                        Complete
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-500 hover:bg-red-50 gap-1"
                        disabled={actingId === payout.id}
                        onClick={() => {
                          const note = window.prompt('Rejection reason (optional):') ?? '';
                          void handleAction(payout.id, 'rejected', note || undefined);
                        }}
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </Button>
                    </div>
                  )}
                  {payout.status === 'processing' && (
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 gap-1"
                        disabled={actingId === payout.id}
                        onClick={() => void handleAction(payout.id, 'completed')}
                      >
                        <Check className="w-4 h-4" />
                        Complete
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-500 hover:bg-red-50 gap-1"
                        disabled={actingId === payout.id}
                        onClick={() => {
                          const note = window.prompt('Rejection reason (optional):') ?? '';
                          void handleAction(payout.id, 'rejected', note || undefined);
                        }}
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
