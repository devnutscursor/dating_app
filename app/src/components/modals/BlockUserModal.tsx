import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { postBlockChat } from '@/lib/chats';

interface BlockUserModalProps {
  open: boolean;
  onClose: () => void;
  chatId: string;
  userName: string;
  profilePicture?: string;
  onBlocked?: () => void;
}

export default function BlockUserModal({
  open,
  onClose,
  chatId,
  userName,
  profilePicture,
  onBlocked,
}: BlockUserModalProps) {
  const [pending, setPending] = useState(false);

  if (!open) return null;

  const handleBlock = async () => {
    setPending(true);
    try {
      await postBlockChat(chatId);
      toast.success('User blocked');
      onBlocked?.();
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not block user');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Block User</h2>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={pending}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="py-4 text-center">
          {profilePicture && (
            <div className="mx-auto mb-4 h-16 w-16 overflow-hidden rounded-full border-2 border-gray-100">
              <img src={profilePicture} alt={userName} className="h-full w-full object-cover" />
            </div>
          )}
          <p className="mb-2 text-gray-600">
            Are you sure you want to block <span className="font-semibold text-gray-900">{userName}</span>?
          </p>
          <p className="text-sm text-gray-500">
            This chat will be closed for both of you and neither side can send new messages.
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button className="flex-1 bg-red-500 hover:bg-red-600" onClick={() => void handleBlock()} disabled={pending}>
            {pending ? 'Blocking…' : 'Block User'}
          </Button>
        </div>
      </div>
    </div>
  );
}
