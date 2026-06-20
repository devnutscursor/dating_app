import { AlertTriangle } from 'lucide-react';
import { useCallPricing } from '@/lib/callPricing';
import { cn } from '@/lib/utils';

type CallRatesWarningProps = {
  compact?: boolean;
  className?: string;
};

export default function CallRatesWarning({ compact = false, className }: CallRatesWarningProps) {
  const { audioCallPerMinute, videoCallPerMinute } = useCallPricing();

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900',
          className
        )}
        role="note"
      >
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
        <p>
          <span className="font-semibold">Call charges:</span> voice{' '}
          <span className="font-medium">{audioCallPerMinute} Coins/min</span>, video{' '}
          <span className="font-medium">{videoCallPerMinute} Coins/min</span> while connected.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn('rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900', className)}
      role="note"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
        <div>
          <p className="font-semibold text-amber-950">Call charges apply</p>
          <ul className="mt-2 space-y-1">
            <li>
              Voice call: <span className="font-medium">{audioCallPerMinute} Coins per minute</span>
            </li>
            <li>
              Video call: <span className="font-medium">{videoCallPerMinute} Coins per minute</span>
            </li>
          </ul>
          <p className="mt-2 text-amber-800">
            Coins are deducted from your balance while you stay connected.
          </p>
        </div>
      </div>
    </div>
  );
}
