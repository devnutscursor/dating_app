import { useCallback, useEffect, useState } from 'react';
import { X, Heart, Gift, Coins, Flag, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationRow,
} from '@/lib/notifications';
import { formatRelativeTime } from '@/lib/formatRelativeTime';

interface NotificationsModalProps {
  open: boolean;
  onClose: () => void;
  /** After list changes so the bell badge can refresh */
  onListChange?: () => void;
}

function rowTimestamp(iso: string) {
  try {
    const d = new Date(iso);
    if (!Number.isNaN(d.getTime())) return formatRelativeTime(d.toISOString());
    return iso;
  } catch {
    return iso;
  }
}

export default function NotificationsModal({ open, onClose, onListChange }: NotificationsModalProps) {
  const [rows, setRows] = useState<NotificationRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setBusy(true);
    setLoadErr(null);
    try {
      const list = await fetchNotifications();
      setRows(list);
      onListChange?.();
    } catch {
      setLoadErr('Could not load notifications');
      setRows([]);
    } finally {
      setBusy(false);
    }
  }, [onListChange]);

  useEffect(() => {
    if (!open) return;
    void refresh();
  }, [open, refresh]);

  const getIcon = (row: NotificationRow) => {
    if (row.kind === 'moderator_dm' || row.type === 'message') {
      return <MessageCircle className="h-5 w-5 text-amber-600" />;
    }
    if (row.kind === 'report_outcome') {
      return <Flag className="h-5 w-5 text-indigo-600" />;
    }
    switch (row.type) {
      case 'like':
        return <Heart className="h-5 w-5 text-pink-500" />;
      case 'gift':
        return <Gift className="h-5 w-5 text-yellow-500" />;
      case 'system':
        return <Coins className="h-5 w-5 text-green-500" />;
      default:
        return <Heart className="h-5 w-5 text-gray-500" />;
    }
  };

  const onRowClick = async (row: NotificationRow) => {
    if (row.isRead) return;
    try {
      await markNotificationRead(row.id);
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, isRead: true } : r)));
      onListChange?.();
    } catch {
      /* ignore */
    }
  };

  const onMarkAll = async () => {
    try {
      await markAllNotificationsRead();
      setRows((prev) => prev.map((r) => ({ ...r, isRead: true })));
      onListChange?.();
    } catch {
      /* ignore */
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-20">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative flex max-h-[80vh] w-full max-w-md flex-col rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-auto p-2">
          {loadErr && <p className="px-3 py-2 text-center text-sm text-red-600">{loadErr}</p>}
          {busy && rows.length === 0 && !loadErr && (
            <p className="py-8 text-center text-sm text-gray-500">Loading…</p>
          )}

          {rows.map((notification) => (
            <button
              key={notification.id}
              type="button"
              onClick={() => void onRowClick(notification)}
              className={`flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors ${
                notification.isRead ? 'hover:bg-gray-50' : 'bg-green-50 hover:bg-green-100'
              }`}
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
                {getIcon(notification)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                <p className="mt-0.5 text-sm text-gray-700">{notification.message}</p>
                {notification.outcomeDetail && (
                  <p className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium leading-snug text-emerald-900">
                    {notification.outcomeDetail}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-400">{rowTimestamp(notification.timestamp)}</p>
              </div>
              {!notification.isRead && (
                <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-green-500" />
              )}
            </button>
          ))}

          {!busy && rows.length === 0 && !loadErr && (
            <div className="py-8 text-center">
              <Heart className="mx-auto mb-3 h-12 w-12 text-gray-300" />
              <p className="text-gray-500">No notifications</p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-4">
          <Button variant="outline" className="w-full" onClick={() => void onMarkAll()}>
            Mark all as read
          </Button>
        </div>
      </div>
    </div>
  );
}
