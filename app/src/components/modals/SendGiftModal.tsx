import { useEffect, useState } from 'react';
import { X, Gift, Coins } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { giftOptions } from '@/data/mockData';
import type { GiftOption } from '@/types';

interface SendGiftModalProps {
  open: boolean;
  onClose: () => void;
  userName: string;
  onSendGift: (gift: GiftOption) => Promise<void>;
}

export default function SendGiftModal({ open, onClose, userName, onSendGift }: SendGiftModalProps) {
  const [selectedGift, setSelectedGift] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) {
      setSelectedGift(null);
      setSending(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSend = async () => {
    if (!selectedGift || sending) return;
    const gift = giftOptions.find((g) => g.id === selectedGift);
    if (!gift) return;
    setSending(true);
    try {
      await onSendGift(gift);
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not send gift');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900">Send Gift</h2>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={sending}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4 p-4">
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100">
              <Gift className="h-5 w-5 text-pink-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Sending gift to</p>
              <p className="font-medium text-gray-900">{userName}</p>
            </div>
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-gray-700">Select a Gift</label>
            <div className="grid grid-cols-1 gap-3">
              {giftOptions.map((gift) => (
                <button
                  key={gift.id}
                  type="button"
                  disabled={sending}
                  onClick={() => setSelectedGift(gift.id)}
                  className={`flex items-center justify-between rounded-xl border-2 p-4 transition-all ${
                    selectedGift === gift.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                        gift.isSpecial ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gray-100'
                      }`}
                    >
                      <Gift className={`h-6 w-6 ${gift.isSpecial ? 'text-white' : 'text-gray-600'}`} />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{gift.name}</p>
                      {gift.isSpecial && (
                        <span className="text-xs font-medium text-orange-500">Special Gift</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-600">
                    <Coins className="h-4 w-4" />
                    <span className="font-semibold">{gift.coins}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 p-4">
          <Button
            className="w-full bg-green-500 hover:bg-green-600"
            onClick={() => void handleSend()}
            disabled={!selectedGift || sending}
          >
            {sending ? 'Sending…' : 'Send Gift'}
          </Button>
        </div>
      </div>
    </div>
  );
}
