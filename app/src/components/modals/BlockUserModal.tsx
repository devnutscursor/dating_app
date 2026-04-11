import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BlockUserModalProps {
  open: boolean;
  onClose: () => void;
  userName: string;
  profilePicture?: string;
}

export default function BlockUserModal({ open, onClose, userName, profilePicture }: BlockUserModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Block User</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="text-center py-4">
          {profilePicture && (
            <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-4 border-2 border-gray-100">
              <img src={profilePicture} alt={userName} className="w-full h-full object-cover" />
            </div>
          )}
          <p className="text-gray-600 mb-2">
            Are you sure you want to block <span className="font-semibold text-gray-900">{userName}</span>?
          </p>
          <p className="text-sm text-gray-500">
            They will no longer be able to contact you or see your profile.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            className="flex-1 bg-red-500 hover:bg-red-600" 
            onClick={onClose}
          >
            Block User
          </Button>
        </div>
      </div>
    </div>
  );
}
