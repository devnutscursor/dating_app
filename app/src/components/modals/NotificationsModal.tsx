import { X, Heart, Gift, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockNotifications } from '@/data/mockData';

interface NotificationsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function NotificationsModal({ open, onClose }: NotificationsModalProps) {
  if (!open) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-pink-500" />;
      case 'gift':
        return <Gift className="w-5 h-5 text-yellow-500" />;
      case 'system':
        return <Coins className="w-5 h-5 text-green-500" />;
      default:
        return <Heart className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-auto p-2">
          {mockNotifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`flex items-start gap-3 p-3 rounded-xl transition-colors cursor-pointer ${
                notification.isRead ? 'hover:bg-gray-50' : 'bg-green-50 hover:bg-green-100'
              }`}
            >
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  {notification.sender && (
                    <span className="font-medium">{notification.sender.name} </span>
                  )}
                  {notification.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">{notification.timestamp}</p>
              </div>
              {!notification.isRead && (
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-2" />
              )}
            </div>
          ))}

          {mockNotifications.length === 0 && (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No notifications</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <Button variant="outline" className="w-full" onClick={onClose}>
            Mark all as read
          </Button>
        </div>
      </div>
    </div>
  );
}
