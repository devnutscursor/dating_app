import { Coins, CreditCard, Gift, History, Loader2, TrendingUp, Video, Wallet } from 'lucide-react';
import type { Transaction, User } from '@/types';
import { formatTransactionDate, isTransactionCredit } from '@/lib/walletTransactions';

type TransactionHistoryListProps = {
  transactions: Transaction[];
  role: User['role'];
  loading?: boolean;
  emptyMessage?: string;
};

function TransactionIcon({ type }: { type: Transaction['type'] }) {
  const shell =
    type === 'purchase'
      ? 'bg-green-100'
      : type === 'unlock'
        ? 'bg-blue-100'
        : type === 'videoCall'
          ? 'bg-purple-100'
          : type === 'payout'
            ? 'bg-rose-100'
            : type === 'tip'
              ? 'bg-cyan-100'
              : 'bg-yellow-100';

  return (
    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${shell}`}>
      {type === 'purchase' && <Coins className="h-5 w-5 text-green-600" />}
      {type === 'unlock' && <TrendingUp className="h-5 w-5 text-blue-600" />}
      {type === 'videoCall' && <Video className="h-5 w-5 text-purple-600" />}
      {type === 'gift' && <Gift className="h-5 w-5 text-yellow-600" />}
      {type === 'payout' && <Wallet className="h-5 w-5 text-rose-600" />}
      {type === 'tip' && <CreditCard className="h-5 w-5 text-cyan-600" />}
      {!['purchase', 'unlock', 'videoCall', 'gift', 'payout', 'tip'].includes(type) && (
        <History className="h-5 w-5 text-gray-600" />
      )}
    </div>
  );
}

export default function TransactionHistoryList({
  transactions,
  role,
  loading = false,
  emptyMessage = 'No transactions yet.',
}: TransactionHistoryListProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-12 text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (transactions.length === 0) {
    return <p className="p-8 text-center text-gray-500">{emptyMessage}</p>;
  }

  return (
    <div className="divide-y divide-gray-100">
      {transactions.map((transaction) => {
        const credit = isTransactionCredit(transaction, role);
        return (
          <div key={transaction.id} className="flex items-center justify-between p-4">
            <div className="flex min-w-0 items-center gap-3">
              <TransactionIcon type={transaction.type} />
              <div className="min-w-0">
                <p className="truncate font-medium text-gray-900">{transaction.description}</p>
                <p className="text-sm text-gray-500">
                  {formatTransactionDate(transaction.timestamp)}
                  {transaction.status === 'pending' && (
                    <span className="ml-2 text-amber-600">· Pending</span>
                  )}
                  {transaction.status === 'failed' && (
                    <span className="ml-2 text-red-600">· Failed</span>
                  )}
                </p>
              </div>
            </div>
            <div className={`shrink-0 pl-3 font-semibold ${credit ? 'text-green-600' : 'text-red-600'}`}>
              {credit ? '+' : '-'}
              {transaction.amount} Koins
            </div>
          </div>
        );
      })}
    </div>
  );
}
