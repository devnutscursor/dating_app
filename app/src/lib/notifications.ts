import { apiGet, apiPatch, apiPost } from '@/lib/api';

export type NotificationRow = {
  id: string;
  kind?: string;
  type: string;
  title: string;
  message: string;
  /** Outcome / moderator note line (separate visual block in the UI) */
  outcomeDetail?: string;
  timestamp: string;
  isRead: boolean;
  reportId?: string;
  relatedUserId?: string;
};

export async function fetchNotifications(): Promise<NotificationRow[]> {
  const data = await apiGet<{ notifications: NotificationRow[] }>('/users/me/notifications');
  return data.notifications ?? [];
}

export async function fetchNotificationUnreadCount(): Promise<number> {
  const data = await apiGet<{ unreadCount: number }>('/users/me/notifications/unread-count');
  return typeof data?.unreadCount === 'number' ? data.unreadCount : 0;
}

export function markNotificationRead(notificationId: string) {
  return apiPatch(`/users/me/notifications/${notificationId}/read`, {});
}

export function markAllNotificationsRead() {
  return apiPost('/users/me/notifications/read-all', {});
}
