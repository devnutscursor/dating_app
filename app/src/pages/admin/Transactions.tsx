import { useState } from 'react';
import { Search, Download, Coins, CreditCard, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockTransactions } from '@/data/mockData';

export default function AdminTransactions() {
  const [filter, setFilter] = useState<'all' | 'purchase' | 'unlock' | 'videoCall' | 'gift'>('all');

  const filteredTransactions = mockTransactions.filter(t => {
    if (filter === 'all') return true;
    return t.type === filter;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'purchase': return <Coins className="w-5 h-5 text-green-600" />;
      case 'unlock': return <CreditCard className="w-5 h-5 text-blue-600" />;
      case 'videoCall': return <ArrowUpRight className="w-5 h-5 text-purple-600" />;
      case 'gift': return <ArrowDownRight className="w-5 h-5 text-yellow-600" />;
      default: return <Coins className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'purchase': return 'bg-green-100';
      case 'unlock': return 'bg-blue-100';
      case 'videoCall': return 'bg-purple-100';
      case 'gift': return 'bg-yellow-100';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-500">View all platform transactions</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-gray-500 text-sm">Total Revenue</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">$45,892</p>
          <p className="text-green-500 text-sm mt-2">+12% from last month</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-gray-500 text-sm">Coin Purchases</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">2,456</p>
          <p className="text-green-500 text-sm mt-2">+8% from last month</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-gray-500 text-sm">Video Call Minutes</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">12,345</p>
          <p className="text-green-500 text-sm mt-2">+23% from last month</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'purchase', 'unlock', 'videoCall', 'gift'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                filter === type ? 'bg-green-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {type === 'videoCall' ? 'Video Call' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
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
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className={`w-10 h-10 ${getTypeColor(transaction.type)} rounded-full flex items-center justify-center`}>
                      {getTypeIcon(transaction.type)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">User ID: {transaction.userId}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${
                      transaction.type === 'purchase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'purchase' ? '+' : '-'}{transaction.amount} coins
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {transaction.timestamp}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      transaction.status === 'completed' ? 'bg-green-100 text-green-700' :
                      transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
