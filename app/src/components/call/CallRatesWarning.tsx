import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useCallPricing } from '@/lib/callPricing';
import {
  isCallRatesWarningDismissed,
  persistCallRatesWarningDismissed,
} from '@/lib/callRatesDismiss';
import { cn } from '@/lib/utils';

type CallRatesWarningProps = {
  compact?: boolean;
  className?: string;
  /** When set, user can dismiss the banner (optionally permanently). */
  dismissible?: boolean;
  userId?: string;
};

export default function CallRatesWarning({
  compact = false,
  className,
  dismissible = false,
  userId,
}: CallRatesWarningProps) {
  const { audioCallPerMinute, videoCallPerMinute } = useCallPricing();
  const [hidden, setHidden] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (dismissible && userId && isCallRatesWarningDismissed(userId)) {
      setHidden(true);
    }
  }, [dismissible, userId]);

  const dismiss = () => {
    if (dismissible && dontShowAgain && userId) {
      persistCallRatesWarningDismissed(userId);
    }
    setHidden(true);
  };

  if (hidden) return null;

  const message = (
    <>
      <span className="font-semibold">Call charges:</span> voice{' '}
      <span className="font-medium">{audioCallPerMinute} Coins/min</span>, video{' '}
      <span className="font-medium">{videoCallPerMinute} Coins/min</span> while connected.
    </>
  );

  if (compact) {
    return (
      <div
        className={cn(
          'rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900',
          className
        )}
        role="note"
      >
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
          <p className="min-w-0 flex-1 leading-snug">{message}</p>
          {dismissible ? (
            <button
              type="button"
              onClick={dismiss}
              className="shrink-0 rounded-md p-0.5 text-amber-700 hover:bg-amber-100 hover:text-amber-950"
              aria-label="Dismiss call charges notice"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
        {dismissible ? (
          <label className="mt-2 flex cursor-pointer items-center gap-2 pl-6 text-[11px] text-amber-800">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
            />
            Don&apos;t show again
          </label>
        ) : null}
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
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-amber-950">Call charges apply</p>
            {dismissible ? (
              <button
                type="button"
                onClick={dismiss}
                className="shrink-0 rounded-md p-1 text-amber-700 hover:bg-amber-100 hover:text-amber-950"
                aria-label="Dismiss call charges notice"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
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
          {dismissible ? (
            <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs text-amber-800">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
              />
              Don&apos;t show again
            </label>
          ) : null}
        </div>
      </div>
    </div>
  );
}
