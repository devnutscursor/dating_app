import { X, Lock, Coins, Image, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UnlockContentModalProps {
  open: boolean;
  onClose: () => void;
  contentType: 'photo' | 'video';
  price: number;
  userName: string;
  onUnlock: () => void | Promise<void>;
  unlocking?: boolean;
}

export default function UnlockContentModal({
  open,
  onClose,
  contentType,
  price,
  userName,
  onUnlock,
  unlocking = false,
}: UnlockContentModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={unlocking ? undefined : onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Unlock Content</h2>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={unlocking}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="py-4 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
            {contentType === 'photo' ? (
              <Image className="h-10 w-10 text-yellow-600" />
            ) : (
              <Video className="h-10 w-10 text-yellow-600" />
            )}
          </div>

          <p className="mb-2 font-medium text-gray-900">
            Unlock {contentType === 'photo' ? 'Photo' : 'Video'} from {userName}
          </p>

          <div className="mb-4 flex items-center justify-center gap-2 text-yellow-600">
            <Lock className="h-4 w-4" />
            <span className="text-sm text-gray-500">Private content</span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-xl bg-gray-50 p-4">
            <Coins className="h-5 w-5 text-yellow-500" />
            <span className="text-2xl font-bold text-gray-900">{price}</span>
            <span className="text-gray-500">coins</span>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={unlocking}>
            Cancel
          </Button>
          <Button
            className="flex-1 bg-green-500 hover:bg-green-600"
            disabled={unlocking}
            onClick={() => void onUnlock()}
          >
            {unlocking ? 'Unlocking…' : 'Unlock Now'}
          </Button>
        </div>
      </div>
    </div>
  );
}
