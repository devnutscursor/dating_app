import { useState } from 'react';
import { X, Gift, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { giftOptions } from '@/data/mockData';

interface SendGiftModalProps {
  open: boolean;
  onClose: () => void;
  userName: string;
}

export default function SendGiftModal({ open, onClose, userName }: SendGiftModalProps) {
  const [selectedGift, setSelectedGift] = useState<string | null>(null);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Send Gift</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Recipient */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
              <Gift className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Sending gift to</p>
              <p className="font-medium text-gray-900">{userName}</p>
            </div>
          </div>

          {/* Gift Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Select a Gift</label>
            <div className="grid grid-cols-1 gap-3">
              {giftOptions.map((gift) => (
                <button
                  key={gift.id}
                  onClick={() => setSelectedGift(gift.id)}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    selectedGift === gift.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      gift.isSpecial ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gray-100'
                    }`}>
                      <Gift className={`w-6 h-6 ${gift.isSpecial ? 'text-white' : 'text-gray-600'}`} />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{gift.name}</p>
                      {gift.isSpecial && (
                        <span className="text-xs text-orange-500 font-medium">Special Gift</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-600">
                    <Coins className="w-4 h-4" />
                    <span className="font-semibold">{gift.coins}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <Button 
            className="w-full bg-green-500 hover:bg-green-600" 
            onClick={onClose}
            disabled={!selectedGift}
          >
            Send Gift
          </Button>
        </div>
      </div>
    </div>
  );
}
