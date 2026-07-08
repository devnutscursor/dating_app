import { useEffect, useState } from 'react';
import { Coins, Gift } from 'lucide-react';

export type CallGiftNotificationData = {
  key: string;
  giftName: string;
  coins: number;
  fromName: string;
};

type Props = {
  notice: CallGiftNotificationData | null;
};

export default function CallGiftNotification({ notice }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!notice) {
      setVisible(false);
      return;
    }
    const show = requestAnimationFrame(() => setVisible(true));
    const hide = window.setTimeout(() => setVisible(false), 3600);
    return () => {
      cancelAnimationFrame(show);
      window.clearTimeout(hide);
    };
  }, [notice?.key, notice]);

  if (!notice) return null;

  return (
    <div
      className={`pointer-events-none absolute left-1/2 top-24 z-20 w-[min(92vw,20rem)] -translate-x-1/2 transition-all duration-500 ease-out ${
        visible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-2 opacity-0 scale-95'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="relative overflow-hidden rounded-2xl border border-pink-200/40 bg-gradient-to-br from-pink-500/95 via-rose-500/95 to-fuchsia-600/95 px-4 py-3.5 text-white shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md">
        <div className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/20 blur-2xl" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/30">
            <Gift className="h-5 w-5" strokeWidth={2.25} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-pink-100/90">
              Gift received
            </p>
            <p className="truncate text-sm font-bold">{notice.giftName}</p>
            <p className="truncate text-xs text-pink-100/85">from {notice.fromName}</p>
          </div>
          <div className="shrink-0 rounded-full bg-white/15 px-2.5 py-1 text-sm font-bold ring-1 ring-white/25">
            <span className="inline-flex items-center gap-1">
              <Coins className="h-3.5 w-3.5 text-amber-200" />+{notice.coins}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
