import { useEffect, useState } from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NotificationsModal from '@/components/modals/NotificationsModal';
import { fetchNotificationUnreadCount } from '@/lib/notifications';
import { subscribeNotificationNew } from '@/lib/chatSocket';
import { useAuth } from '@/contexts/AuthContext';

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { user } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnread = async () => {
    try {
      const n = await fetchNotificationUnreadCount();
      setUnreadCount(n);
    } catch {
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    let cancelled = false;
    const load = async () => {
      try {
        const n = await fetchNotificationUnreadCount();
        if (!cancelled) setUnreadCount(n);
      } catch {
        if (!cancelled) setUnreadCount(0);
      }
    };
    void load();
    const unsub = subscribeNotificationNew(() => {
      void load();
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, [user]);

  const displayName = user?.name?.trim() || 'Admin';
  const displayEmail = user?.email || 'admin@memberdate.com';

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
          </Button>

          <div className="hidden w-80 items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 md:flex">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="flex-1 border-none bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setNotificationsOpen(true)}
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-gray-900">{displayName}</p>
              <p className="text-xs text-gray-500">{displayEmail}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
              <span className="font-medium text-gray-600">{displayName.charAt(0).toUpperCase()}</span>
            </div>
          </div>
        </div>
      </header>

      <NotificationsModal
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onListChange={() => void refreshUnread()}
        variant="admin"
      />
    </>
  );
}
