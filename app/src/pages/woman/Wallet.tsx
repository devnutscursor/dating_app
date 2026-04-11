import { useState } from 'react';
import { Coins, History, Gift, Video, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { currentWomanUser, mockTransactions } from '@/data/mockData';

export default function WomanWallet() {
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');

  // Calculate earnings
  const videoCallEarnings = 700;
  const giftEarnings = 150;
  const totalEarnings = videoCallEarnings + giftEarnings;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Wallet</h1>
        <p className="text-gray-500">Track your earnings and balance</p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 mb-1">Available Balance</p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Coins className="w-6 h-6" />
              </div>
              <span className="text-4xl font-bold">{currentWomanUser.coins}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/80 text-sm">Estimated Value</p>
            <p className="text-2xl font-bold">${(currentWomanUser.coins * 0.15).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Quick Action */}
      <Link to="/woman/payouts">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white flex items-center justify-between hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-lg">Go to Payouts</p>
              <p className="text-white/80 text-sm">Withdraw your earnings</p>
            </div>
          </div>
          <ArrowRight className="w-6 h-6" />
        </div>
      </Link>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-sm font-medium transition-colors relative ${
            activeTab === 'overview' ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Earnings Overview
          </div>
          {activeTab === 'overview' && (
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

      {/* Content */}
      {activeTab === 'overview' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Video className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Video Calls</p>
                <p className="text-sm text-gray-500">10 coins/minute</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-purple-600">+{videoCallEarnings} coins</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-pink-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                <Gift className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Gifts Received</p>
                <p className="text-sm text-gray-500">From your fans</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-pink-600">+{giftEarnings} coins</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">Total Earnings</span>
              <span className="text-2xl font-bold text-green-600">{totalEarnings} coins</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">≈ ${(totalEarnings * 0.15).toFixed(2)} USD</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100">
            {mockTransactions.map((transaction) => (
              <div key={transaction.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'purchase' ? 'bg-green-100' :
                    transaction.type === 'unlock' ? 'bg-blue-100' :
                    transaction.type === 'videoCall' ? 'bg-purple-100' :
                    'bg-yellow-100'
                  }`}>
                    {transaction.type === 'purchase' && <Coins className="w-5 h-5 text-green-600" />}
                    {transaction.type === 'unlock' && <TrendingUp className="w-5 h-5 text-blue-600" />}
                    {transaction.type === 'videoCall' && <Video className="w-5 h-5 text-purple-600" />}
                    {transaction.type === 'gift' && <Gift className="w-5 h-5 text-yellow-600" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">{transaction.timestamp}</p>
                  </div>
                </div>
                <div className={`font-semibold ${
                  transaction.type === 'purchase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'purchase' ? '+' : '-'}{transaction.amount} coins
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
