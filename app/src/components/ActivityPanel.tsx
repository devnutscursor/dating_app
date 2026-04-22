import { useCallback, useEffect, useState } from 'react';
import { layoutConversationToolbarClass } from '@/config/design';
import { Heart, Gift, Eye, MessageCircle } from 'lucide-react';
import { fetchActivities } from '@/lib/activities';
import { formatRelativeTime } from '@/lib/formatRelativeTime';
import type { ActivityFeedItem } from '@/types';

export default function ActivityPanel() {
  const [items, setItems] = useState<ActivityFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await fetchActivities();
      setItems(next);
    } catch {
      setItems([]);
      setError('Could not load activity');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onFocus = () => void load();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [load]);

  const getIcon = (type: ActivityFeedItem['type']) => {
    switch (type) {
      case 'like':
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-100">
            <Heart className="h-4 w-4 text-pink-500" />
          </div>
        );
      case 'gift':
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
            <Gift className="h-4 w-4 text-yellow-500" />
          </div>
        );
      case 'view':
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
            <Eye className="h-4 w-4 text-blue-500" />
          </div>
        );
      case 'message':
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
            <MessageCircle className="h-4 w-4 text-gray-600" />
          </div>
        );
      default:
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
            <Heart className="h-4 w-4 text-gray-500" />
          </div>
        );
    }
  };

  const getMessage = (activity: ActivityFeedItem) => {
    switch (activity.type) {
      case 'like':
        return 'liked your profile';
      case 'gift':
        return activity.details?.trim() || 'sent you a gift';
      case 'view':
        return 'viewed your profile';
      case 'message':
        return activity.details?.trim() || 'messaged you';
      default:
        return '';
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className={`${layoutConversationToolbarClass} flex-col items-stretch justify-center gap-1`}>
        <h2 className="text-lg font-semibold leading-tight tracking-tight text-gray-900">Activity</h2>
        <p className="text-sm leading-tight text-gray-500">Recent interactions</p>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-auto p-4">
        {loading && (
          <p className="text-center text-sm text-gray-500 py-6">Loading…</p>
        )}
        {!loading && error && (
          <p className="text-center text-sm text-red-600 py-6">{error}</p>
        )}
        {!loading &&
          !error &&
          items.map((activity) => (
            <div
              key={activity.id}
              className="flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50"
            >
              {getIcon(activity.type)}
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{activity.actor.name}</span>{' '}
                  <span className="text-gray-600">{getMessage(activity)}</span>
                </p>
                <p className="mt-1 text-xs text-gray-400">{formatRelativeTime(activity.createdAt)}</p>
              </div>
            </div>
          ))}

        {!loading && !error && items.length === 0 && (
          <div className="py-8 text-center">
            <Heart className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p className="text-gray-500">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
}
