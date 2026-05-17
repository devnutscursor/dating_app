import { apiGet, apiPost } from '@/lib/api';
import type { PendingFemaleMediaItem } from '@/types';

export type AdminDashboardStat = {
  value: number;
  change: string | null;
  label?: string;
};

export type AdminDashboardStats = {
  stats: {
    totalUsers: AdminDashboardStat;
    activeToday: AdminDashboardStat;
    messagesSent: AdminDashboardStat;
    videoCalls: AdminDashboardStat;
    revenue: AdminDashboardStat;
    newSignups: AdminDashboardStat;
  };
  quickActions: {
    pendingPayouts: number;
    pendingReports: number;
    pendingContent: number;
  };
  recentActivity: {
    user: string;
    action: string;
    target: string;
    at: string;
  }[];
};

export async function fetchAdminDashboardStats(): Promise<AdminDashboardStats> {
  return apiGet<AdminDashboardStats>('/admin/dashboard-stats');
}

export async function fetchAdminPendingContent(): Promise<PendingFemaleMediaItem[]> {
  const data = await apiGet<{ items: PendingFemaleMediaItem[] }>('/admin/content');
  return data.items ?? [];
}

export async function reviewAdminFemaleMedia(body: {
  userId: string;
  mediaKind: 'photo' | 'video';
  mediaId: string;
  decision: 'approved' | 'rejected';
  rejectionReason?: string;
}): Promise<{ ok: boolean }> {
  return apiPost('/admin/content/review', body);
}
