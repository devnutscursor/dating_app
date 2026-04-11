import { useState } from 'react';
import { DollarSign, Check, X, Clock, Search, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';

const payoutRequests = [
  { id: 1, user: 'Sarah M.', amount: 500, wallet: 'TRX...8x2a', status: 'pending', date: '2 hours ago' },
  { id: 2, user: 'Emma W.', amount: 1200, wallet: 'TRX...3b9c', status: 'processing', date: '5 hours ago' },
  { id: 3, user: 'Lisa K.', amount: 350, wallet: 'TRX...7d4e', status: 'completed', date: '1 day ago' },
  { id: 4, user: 'Anna P.', amount: 800, wallet: 'TRX...1f5g', status: 'pending', date: '2 days ago' },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-700';
    case 'processing': return 'bg-blue-100 text-blue-700';
    case 'completed': return 'bg-green-100 text-green-700';
    case 'rejected': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending': return <Clock className="w-4 h-4" />;
    case 'processing': return <Wallet className="w-4 h-4" />;
    case 'completed': return <Check className="w-4 h-4" />;
    case 'rejected': return <X className="w-4 h-4" />;
    default: return null;
  }
};

export default function AdminPayouts() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'completed'>('all');

  const filteredPayouts = payoutRequests.filter(p => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const totalPending = payoutRequests
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payouts</h1>
          <p className="text-gray-500">Manage withdrawal requests</p>
        </div>
        <div className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg">
          <DollarSign className="w-4 h-4" />
          <span className="font-medium">${totalPending} pending</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-gray-500 text-sm">Pending</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">$2,850</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-gray-500 text-sm">Processing</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">$1,200</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-gray-500 text-sm">Completed (Today)</p>
          <p className="text-2xl font-bold text-green-600 mt-1">$5,430</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-gray-500 text-sm">Total (This Month)</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">$45,892</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search payouts..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'processing', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                filter === status ? 'bg-green-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Payouts List */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100">
          {filteredPayouts.map((payout) => (
            <div key={payout.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}>
                      {getStatusIcon(payout.status)}
                      {payout.status}
                    </span>
                    <span className="text-sm text-gray-400">{payout.date}</span>
                  </div>

                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-sm text-gray-500">User</p>
                      <p className="font-medium text-gray-900">{payout.user}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Amount</p>
                      <p className="font-medium text-gray-900">${payout.amount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Wallet</p>
                      <p className="font-medium text-gray-900 font-mono">{payout.wallet}</p>
                    </div>
                  </div>
                </div>

                {payout.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-green-500 hover:bg-green-600 gap-1">
                      <Check className="w-4 h-4" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-500 hover:bg-red-50 gap-1">
                      <X className="w-4 h-4" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
