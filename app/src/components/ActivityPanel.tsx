import { useEffect, useMemo } from 'react';
import { useCachedQuery } from '@/hooks/useCachedQuery';
import { CACHE } from '@/lib/cacheKeys';
import { Link, useLocation } from 'react-router-dom';
import { layoutConversationToolbarClass } from '@/config/design';
import { Heart, Gift, Eye, MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchActivities } from '@/lib/activities';
import { formatRelativeTime } from '@/lib/formatRelativeTime';
import { profileReturnState } from '@/lib/profileNavigation';
import type { ActivityFeedItem, User } from '@/types';

function actorCanOpenProfile(actor: User): boolean {
  const role = actor.role ?? actor.gender;
  return Boolean(actor.id) && (role === 'male' || role === 'female');
}

export default function ActivityPanel() {
  const location = useLocation();
  const { user: me } = useAuth();
  const area = me?.role === 'female' ? 'woman' : 'man';
  const profileNavState = useMemo(
    () => profileReturnState(location.pathname + location.search),
    [location.pathname, location.search]
  );
  const {
    data: items = [],
    showInitialLoading: loading,
    refresh,
  } = useCachedQuery<ActivityFeedItem[]>({
    cacheKey: CACHE.activities,
    fetcher: fetchActivities,
    userId: me?.id,
  });
  useEffect(() => {
    const onFocus = () => void refresh(true);
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refresh]);

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
        {!loading &&
          items.map((activity) => {
            const profilePath = `/${area}/view-profile/${activity.actor.id}`;
            const nameEl = actorCanOpenProfile(activity.actor) ? (
              <Link
                to={profilePath}
                state={profileNavState.state}
                className={`font-medium hover:underline ${area === 'woman' ? 'text-rose-600 hover:text-rose-700' : 'text-green-600 hover:text-green-700'}`}
              >
                {activity.actor.name}
              </Link>
            ) : (
              <span className="font-medium">{activity.actor.name}</span>
            );

            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50"
              >
                {getIcon(activity.type)}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-900">
                    {nameEl}{' '}
                    <span className="text-gray-600">{getMessage(activity)}</span>
                  </p>
                  <p className="mt-1 text-xs text-gray-400">{formatRelativeTime(activity.createdAt)}</p>
                </div>
              </div>
            );
          })}

        {!loading && items.length === 0 && (
          <div className="py-8 text-center">
            <Heart className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p className="text-gray-500">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
}
