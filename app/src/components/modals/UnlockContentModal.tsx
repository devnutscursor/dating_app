import { X, Lock, Coins, Image, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UnlockContentModalProps {
  open: boolean;
  onClose: () => void;
  contentType: 'photo' | 'video';
  price: number;
  userName: string;
}

export default function UnlockContentModal({ open, onClose, contentType, price, userName }: UnlockContentModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Unlock Content</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="text-center py-4">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {contentType === 'photo' ? (
              <Image className="w-10 h-10 text-yellow-600" />
            ) : (
              <Video className="w-10 h-10 text-yellow-600" />
            )}
          </div>
          
          <p className="text-gray-900 font-medium mb-2">
            Unlock {contentType === 'photo' ? 'Photo' : 'Video'} from {userName}
          </p>
          
          <div className="flex items-center justify-center gap-2 text-yellow-600 mb-4">
            <Lock className="w-4 h-4" />
            <span className="text-sm text-gray-500">Private content</span>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 inline-flex items-center gap-2">
            <Coins className="w-5 h-5 text-yellow-500" />
            <span className="text-2xl font-bold text-gray-900">{price}</span>
            <span className="text-gray-500">coins</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            className="flex-1 bg-green-500 hover:bg-green-600" 
            onClick={onClose}
          >
            Unlock Now
          </Button>
        </div>
      </div>
    </div>
  );
}
