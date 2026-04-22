import { apiGet } from '@/lib/api';
import type { ActivityFeedItem } from '@/types';

export async function fetchActivities(): Promise<ActivityFeedItem[]> {
  const data = await apiGet<{ activities: ActivityFeedItem[] }>('/activities');
  return data.activities ?? [];
}
