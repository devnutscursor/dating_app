import { useEffect, useMemo, useState } from 'react';
import { X, Coins } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { GiftOptionIcon } from '@/components/gifts/GiftOptionIcon';
import {
  CUSTOM_GIFT_ID,
  GIFT_OPTIONS,
  MAX_GIFT_COMMENT_LENGTH,
  MAX_CUSTOM_GIFT_COINS,
  MIN_CUSTOM_GIFT_COINS,
  type GiftSendPayload,
} from '@/lib/gifts';
import { useAuth } from '@/contexts/AuthContext';
import { useBuyCoins } from '@/contexts/BuyCoinsContext';

interface SendGiftModalProps {
  open: boolean;
  onClose: () => void;
  userName: string;
  onSendGift: (gift: GiftSendPayload) => Promise<void>;
}

const CARD_STYLES: Record<string, { bg: string; selected: string }> = {
  compliment: { bg: 'bg-emerald-50', selected: 'border-emerald-500 ring-emerald-200' },
  small_gift: { bg: 'bg-sky-50', selected: 'border-sky-500 ring-sky-200' },
  full_access: { bg: 'bg-gradient-to-br from-violet-50 to-pink-50', selected: 'border-violet-500 ring-violet-200' },
  custom: { bg: 'bg-amber-50', selected: 'border-amber-500 ring-amber-200' },
};

export default function SendGiftModal({ open, onClose, userName, onSendGift }: SendGiftModalProps) {
  const { user } = useAuth();
  const { openBuyCoins, promptBuyCoinsIfNeeded } = useBuyCoins();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [customCoins, setCustomCoins] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) {
      setSelectedId(null);
      setComment('');
      setCustomCoins('');
      setSending(false);
    }
  }, [open]);

  const balance = user?.coins ?? 0;
  const isCustom = selectedId === CUSTOM_GIFT_ID;

  const resolvedCoins = useMemo(() => {
    if (!selectedId) return null;
    if (isCustom) {
      const n = Number(customCoins);
      return Number.isFinite(n) ? Math.floor(n) : null;
    }
    return GIFT_OPTIONS.find((g) => g.id === selectedId)?.coins ?? null;
  }, [selectedId, isCustom, customCoins]);

  const resolvedName = useMemo(() => {
    if (!selectedId) return '';
    if (isCustom) return 'Custom gift';
    return GIFT_OPTIONS.find((g) => g.id === selectedId)?.name ?? 'Gift';
  }, [selectedId, isCustom]);

  const canSend = useMemo(() => {
    if (!selectedId || sending || resolvedCoins == null) return false;
    if (resolvedCoins < MIN_CUSTOM_GIFT_COINS || resolvedCoins > MAX_CUSTOM_GIFT_COINS) return false;
    if (resolvedCoins > balance) return false;
    return true;
  }, [selectedId, sending, resolvedCoins, balance]);

  if (!open) return null;

  const handleSend = async () => {
    if (!canSend || resolvedCoins == null) return;
    const note = comment.trim();
    setSending(true);
    try {
      await onSendGift({
        name: resolvedName,
        coins: resolvedCoins,
        ...(note ? { comment: note.slice(0, MAX_GIFT_COMMENT_LENGTH) } : {}),
      });
      onClose();
    } catch (e) {
      if (!promptBuyCoinsIfNeeded(e)) {
        toast.error(e instanceof Error ? e.message : 'Could not send gift');
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative flex max-h-[min(100dvh-2rem,640px)] w-full max-w-md flex-col rounded-2xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900">Send Gift</h2>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={sending}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4">
          <div>
            <p className="text-sm text-gray-500">Sending gift to</p>
            <p className="font-medium text-gray-900">{userName}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
              <Coins className="h-3.5 w-3.5 text-amber-500" />
              Your balance: <span className="font-semibold text-gray-700">{balance}</span> coins
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Select a gift</label>
            <div className="grid grid-cols-3 gap-2">
              {GIFT_OPTIONS.map((gift) => {
                const styles = CARD_STYLES[gift.icon] ?? CARD_STYLES.custom;
                const selected = selectedId === gift.id;
                return (
                  <button
                    key={gift.id}
                    type="button"
                    disabled={sending}
                    onClick={() => setSelectedId(gift.id)}
                    className={`relative flex flex-col items-center rounded-xl border-2 p-3 transition-all ${styles.bg} ${
                      selected ? styles.selected : 'border-transparent hover:border-gray-200'
                    }`}
                  >
                    {gift.isSpecial && (
                      <span className="absolute -right-1 -top-1 rounded bg-red-500 px-1 py-0.5 text-[8px] font-bold uppercase text-white">
                        Special
                      </span>
                    )}
                    <div
                      className={`mb-2 flex h-12 w-12 items-center justify-center rounded-xl ${
                        gift.isSpecial
                          ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
                          : 'bg-white shadow-sm'
                      }`}
                    >
                      <GiftOptionIcon
                        kind={gift.icon}
                        className={`h-7 w-7 ${gift.isSpecial ? 'text-white' : 'text-gray-700'}`}
                      />
                    </div>
                    <p className="text-sm font-bold text-gray-900">{gift.coins}</p>
                    <p className="text-[10px] text-gray-600">coins</p>
                    <p className="mt-1 text-center text-xs text-gray-700">{gift.name}</p>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={sending}
              onClick={() => setSelectedId(CUSTOM_GIFT_ID)}
              className={`mt-2 flex w-full items-center gap-3 rounded-xl border-2 p-3 transition-all ${CARD_STYLES.custom.bg} ${
                isCustom ? CARD_STYLES.custom.selected : 'border-transparent hover:border-gray-200'
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                <GiftOptionIcon kind="custom" className="h-6 w-6 text-amber-700" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">Custom amount</p>
                <p className="text-xs text-gray-500">Choose your own coin value</p>
              </div>
            </button>

            {isCustom && (
              <div className="mt-3">
                <label htmlFor="custom-gift-coins" className="mb-1 block text-xs font-medium text-gray-600">
                  Coins to send ({MIN_CUSTOM_GIFT_COINS}–{MAX_CUSTOM_GIFT_COINS.toLocaleString()})
                </label>
                <input
                  id="custom-gift-coins"
                  type="number"
                  min={MIN_CUSTOM_GIFT_COINS}
                  max={MAX_CUSTOM_GIFT_COINS}
                  value={customCoins}
                  onChange={(e) => setCustomCoins(e.target.value)}
                  placeholder="e.g. 150"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                  disabled={sending}
                />
              </div>
            )}
          </div>

          <div>
            <label htmlFor="gift-comment" className="mb-1 block text-sm font-medium text-gray-700">
              Add a comment <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              id="gift-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, MAX_GIFT_COMMENT_LENGTH))}
              placeholder="Say something nice…"
              rows={2}
              disabled={sending}
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="mt-0.5 text-right text-xs text-gray-400">
              {comment.length}/{MAX_GIFT_COMMENT_LENGTH}
            </p>
          </div>

          {resolvedCoins != null && resolvedCoins > balance && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm text-amber-900">Not enough coins for this gift.</p>
              <Button
                type="button"
                size="sm"
                className="mt-2 bg-green-500 hover:bg-green-600"
                onClick={() =>
                  openBuyCoins({
                    reason: `You need ${resolvedCoins} coins for this gift but only have ${balance}.`,
                  })
                }
              >
                Buy coins
              </Button>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-gray-200 p-4">
          <Button
            className="w-full bg-green-500 hover:bg-green-600"
            onClick={() => void handleSend()}
            disabled={!canSend}
          >
            {sending
              ? 'Sending…'
              : resolvedCoins != null
                ? `Send ${resolvedCoins} coins`
                : 'Send Gift'}
          </Button>
        </div>
      </div>
    </div>
  );
}
