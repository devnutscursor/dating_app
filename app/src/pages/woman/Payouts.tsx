import { useState } from 'react';
import { Coins, DollarSign, History, Gift, Video, CreditCard, Copy, Check, Wallet, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { currentWomanUser, mockTransactions } from '@/data/mockData';

export default function WomanPayouts() {
  const [activeTab, setActiveTab] = useState<'overview' | 'withdraw' | 'history'>('overview');
  const [walletAddress, setWalletAddress] = useState('');
  const [copied, setCopied] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const referralLink = `https://memberdate.com/ref/${currentWomanUser.id}`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate earnings
  const videoCallEarnings = 700;
  const giftEarnings = 150;
  const totalEarnings = videoCallEarnings + giftEarnings;
  const coinToUsdRate = 0.15;
  const minWithdrawalUsd = 60;
  const minWithdrawalCoins = Math.ceil(minWithdrawalUsd / coinToUsdRate);
  const withdrawCoins = Number(withdrawAmount) || 0;
  const withdrawFeeCoins = Math.floor(withdrawCoins * 0.05);
  const withdrawUsd = withdrawCoins * coinToUsdRate * 0.95;
  const meetsMinimumWithdrawal = withdrawUsd >= minWithdrawalUsd;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payouts</h1>
        <p className="text-gray-500">Manage your earnings and withdrawals</p>
      </div>

      {/* Balance Cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <p className="text-white/80 text-sm">Available Balance</p>
              <p className="text-3xl font-bold">{currentWomanUser.coins} coins</p>
            </div>
          </div>
          <p className="text-white/70 text-sm">≈ ${(currentWomanUser.coins * 0.15).toFixed(2)} USD</p>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-white/80 text-sm">Total Earnings</p>
              <p className="text-3xl font-bold">{totalEarnings} coins</p>
            </div>
          </div>
          <p className="text-white/70 text-sm">≈ ${(totalEarnings * 0.15).toFixed(2)} USD</p>
        </div>
      </div>

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
            Overview
          </div>
          {activeTab === 'overview' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('withdraw')}
          className={`pb-3 text-sm font-medium transition-colors relative ${
            activeTab === 'withdraw' ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Withdraw
          </div>
          {activeTab === 'withdraw' && (
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
            History
          </div>
          {activeTab === 'history' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" />
          )}
        </button>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Earnings Breakdown */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Earnings Breakdown</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Video className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Video Calls</p>
                    <p className="text-sm text-gray-500">60 minutes total</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-purple-600">+{videoCallEarnings} coins</p>
                  <p className="text-sm text-gray-500">≈ ${(videoCallEarnings * 0.15).toFixed(2)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-pink-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                    <Gift className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Gifts Received</p>
                    <p className="text-sm text-gray-500">3 gifts</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-pink-600">+{giftEarnings} coins</p>
                  <p className="text-sm text-gray-500">≈ ${(giftEarnings * 0.15).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Referral Program */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl p-6 text-white">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">Referral Program</h3>
                <p className="text-white/80 text-sm mb-4">
                  Invite friends and earn 10% of their first purchase!
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white/20 rounded-lg px-3 py-2 text-sm truncate">
                    {referralLink}
                  </div>
                  <button
                    onClick={copyReferralLink}
                    className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-white/90 transition-colors flex items-center gap-2"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'withdraw' && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Withdraw Funds</h3>
          
          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-900">Withdrawal notice</p>
                <p className="mt-2 text-sm leading-6 text-amber-800">
                  Payments are made for amounts over ${minWithdrawalUsd}; a transfer fee may also apply.
                </p>
                <p className="mt-2 text-sm text-amber-700">
                  Minimum recommended withdrawal: {minWithdrawalCoins} coins
                </p>
              </div>

              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-900">Verification Status</p>
                <p className="mt-1 text-sm font-medium text-blue-800">Payment Details: In Progress</p>
                <p className="mt-2 text-sm leading-6 text-blue-800">
                  Your coins will be credited to your account within 48 hours. Please make sure your crypto wallet
                  address is entered correctly below. If you have any issues with the funds being credited to your
                  account, please contact the website&apos;s support team.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Withdrawal Amount (coins)
              </label>
              <div className="relative">
                <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-500" />
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount"
                  max={currentWomanUser.coins}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Available: {currentWomanUser.coins} coins
              </p>
              <p className="text-sm text-amber-700 mt-2">
                Withdrawals below ${minWithdrawalUsd} are not processed.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wallet Address (USDT TRC20)
              </label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Enter your USDT TRC20 wallet address"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
              <p className="text-sm text-gray-500 mt-2">
                Confirm/check your wallet address carefully before submitting the withdrawal request.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Amount</span>
                <span className="font-medium">{withdrawCoins} coins</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Fee (5%)</span>
                <span className="font-medium">-{withdrawFeeCoins} coins</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <span className="font-medium">You receive</span>
                <span className="font-bold text-green-600">
                  ${withdrawUsd.toFixed(2)} USD
                </span>
              </div>
            </div>

            {withdrawAmount && !meetsMinimumWithdrawal && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                The withdrawal amount must be at least ${minWithdrawalUsd} after calculation to be processed.
              </div>
            )}

            <Button 
              className="w-full bg-green-500 hover:bg-green-600"
              disabled={
                !withdrawAmount ||
                withdrawCoins > currentWomanUser.coins ||
                !walletAddress ||
                !meetsMinimumWithdrawal
              }
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Request Withdrawal
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
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
                    {transaction.type === 'unlock' && <CreditCard className="w-5 h-5 text-blue-600" />}
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
