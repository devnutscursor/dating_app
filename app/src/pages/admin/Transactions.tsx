import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Download, Coins, CreditCard, ArrowUpRight, ArrowDownRight, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  fetchAdminTransactions,
  fetchAdminTransactionStats,
  type AdminTransaction,
} from '@/lib/adminTransactions';

type FilterType = 'all' | 'purchase' | 'unlock' | 'videoCall' | 'gift' | 'payout';

function formatWhen(iso: string) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function exportCsv(rows: AdminTransaction[]) {
  const header = ['id', 'type', 'user', 'email', 'description', 'amount', 'currency', 'status', 'date'];
  const lines = rows.map((t) =>
    [
      t.id,
      t.type,
      t.userName || '',
      t.userEmail || '',
      (t.description || '').replace(/"/g, '""'),
      t.amount,
      t.currency,
      t.status,
      t.timestamp,
    ]
      .map((c) => `"${String(c)}"`)
      .join(',')
  );
  const blob = new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminTransactions() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [stats, setStats] = useState<{
    totalRevenueUsd: number;
    coinPurchases: number;
    videoCallMinutes: number;
    purchasesChange: string;
    videoCallsChange: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [txRes, statsRes] = await Promise.all([
        fetchAdminTransactions({ type: filter, search: searchDebounced }),
        fetchAdminTransactionStats(),
      ]);
      setTransactions(txRes.transactions);
      setStats(statsRes.stats);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [filter, searchDebounced]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredTransactions = useMemo(() => transactions, [transactions]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <Coins className="w-5 h-5 text-green-600" />;
      case 'unlock':
        return <CreditCard className="w-5 h-5 text-blue-600" />;
      case 'videoCall':
        return <ArrowUpRight className="w-5 h-5 text-purple-600" />;
      case 'gift':
        return <Gift className="w-5 h-5 text-yellow-600" />;
      case 'payout':
        return <ArrowDownRight className="w-5 h-5 text-orange-600" />;
      default:
        return <Coins className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'bg-green-100';
      case 'unlock':
        return 'bg-blue-100';
      case 'videoCall':
        return 'bg-purple-100';
      case 'gift':
        return 'bg-yellow-100';
      case 'payout':
        return 'bg-orange-100';
      default:
        return 'bg-gray-100';
    }
  };

  const isCredit = (type: string) => type === 'purchase';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-500">View all platform transactions</p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          disabled={filteredTransactions.length === 0}
          onClick={() => exportCsv(filteredTransactions)}
        >
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-gray-500 text-sm">Total Revenue (USD)</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {loading && !stats ? '…' : `$${(stats?.totalRevenueUsd ?? 0).toLocaleString()}`}
          </p>
          <p className="text-green-500 text-sm mt-2">{stats?.purchasesChange ?? ''} purchases this week</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-gray-500 text-sm">Coin Purchases</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {loading && !stats ? '…' : (stats?.coinPurchases ?? 0).toLocaleString()}
          </p>
          <p className="text-gray-400 text-sm mt-2">Completed purchases</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-gray-500 text-sm">Video Call (coins billed)</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {loading && !stats ? '…' : (stats?.videoCallMinutes ?? 0).toLocaleString()}
          </p>
          <p className="text-green-500 text-sm mt-2">{stats?.videoCallsChange ?? ''} calls this week</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by member name, email, or description…"
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(['all', 'purchase', 'unlock', 'videoCall', 'gift', 'payout'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                filter === type ? 'bg-green-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {type === 'videoCall' ? 'Video Call' : type}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Type</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Description</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Loading…
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div
                        className={`w-10 h-10 ${getTypeColor(transaction.type)} rounded-full flex items-center justify-center`}
                      >
                        {getTypeIcon(transaction.type)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {transaction.userName || 'Member'}
                        {transaction.userEmail ? ` · ${transaction.userEmail}` : ''}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-semibold ${isCredit(transaction.type) ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {isCredit(transaction.type) ? '+' : '−'}
                        {transaction.amount} {transaction.currency === 'usd' ? 'USD' : 'coins'}
                      </span>
                      {transaction.type === 'purchase' && transaction.priceUsd != null && (
                        <p className="text-xs text-gray-500">${transaction.priceUsd} paid</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{formatWhen(transaction.timestamp)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          transaction.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : transaction.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

