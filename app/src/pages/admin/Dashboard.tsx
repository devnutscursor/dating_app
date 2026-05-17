import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  MessageSquare,
  Video,
  DollarSign,
  TrendingUp,
  TrendingDown,
  UserPlus,
} from 'lucide-react';
import { fetchAdminDashboardStats, type AdminDashboardStats } from '@/lib/admin';
import { formatRelativeTime } from '@/lib/formatRelativeTime';

function formatCount(n: number) {
  return n.toLocaleString('en-US');
}

function StatChange({ change }: { change: string | null }) {
  if (!change) return <span className="text-sm text-gray-400">Live count</span>;
  const isPositive = change.startsWith('+') || change === '0%';
  const isNegative = change.startsWith('-');
  return (
    <div className="mt-4 flex items-center gap-1">
      {isPositive && !isNegative ? (
        <TrendingUp className="h-4 w-4 text-green-500" />
      ) : isNegative ? (
        <TrendingDown className="h-4 w-4 text-red-500" />
      ) : null}
      <span
        className={`text-sm ${
          isNegative ? 'text-red-500' : isPositive ? 'text-green-500' : 'text-gray-500'
        }`}
      >
        {change}
      </span>
      <span className="text-sm text-gray-400">vs last week</span>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetchAdminDashboardStats()
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const s = data?.stats;
  const qa = data?.quickActions;

  const statCards = [
    {
      label: 'Total Users',
      value: loading ? '…' : formatCount(s?.totalUsers.value ?? 0),
      change: s?.totalUsers.change ?? null,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      label: 'Active Today',
      value: loading ? '…' : formatCount(s?.activeToday.value ?? 0),
      change: s?.activeToday.change ?? null,
      icon: Users,
      color: 'bg-green-500',
    },
    {
      label: 'Messages Sent',
      value: loading ? '…' : formatCount(s?.messagesSent.value ?? 0),
      change: s?.messagesSent.change ?? null,
      icon: MessageSquare,
      color: 'bg-purple-500',
    },
    {
      label: 'Video Calls',
      value: loading ? '…' : formatCount(s?.videoCalls.value ?? 0),
      change: s?.videoCalls.change ?? null,
      icon: Video,
      color: 'bg-pink-500',
    },
    {
      label: s?.revenue.label ?? 'Coins purchased',
      value: loading ? '…' : formatCount(s?.revenue.value ?? 0),
      change: s?.revenue.change ?? null,
      icon: DollarSign,
      color: 'bg-yellow-500',
    },
    {
      label: 'New signups (7d)',
      value: loading ? '…' : formatCount(s?.newSignups.value ?? 0),
      change: s?.newSignups.change ?? null,
      icon: UserPlus,
      color: 'bg-orange-500',
    },
  ];

  const recentActivity = data?.recentActivity ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Overview of platform activity</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </div>
              <StatChange change={stat.change} />
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Activity</h2>
        {loading ? (
          <p className="text-sm text-gray-500">Loading activity…</p>
        ) : recentActivity.length === 0 ? (
          <p className="text-sm text-gray-500">No recent platform activity yet.</p>
        ) : (
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={`${activity.at}-${index}`}
                className="flex items-center justify-between border-b border-gray-100 py-3 last:border-none"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                    <span className="text-sm font-medium text-gray-600">{activity.user[0] ?? '?'}</span>
                  </div>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.user}</span>{' '}
                    <span className="text-gray-500">{activity.action}</span>{' '}
                    <span className="font-medium">{activity.target}</span>
                  </p>
                </div>
                <span className="shrink-0 text-sm text-gray-400">
                  {formatRelativeTime(activity.at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          to="/admin/users"
          className="rounded-2xl bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <p className="font-medium text-gray-900">Manage Users</p>
          <p className="text-sm text-gray-500">
            {loading ? '…' : `${formatCount(s?.totalUsers.value ?? 0)} accounts`}
          </p>
        </Link>

        <Link
          to="/admin/payouts"
          className="rounded-2xl bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
            <DollarSign className="h-5 w-5 text-green-600" />
          </div>
          <p className="font-medium text-gray-900">Review Payouts</p>
          <p className="text-sm text-gray-500">
            {loading ? '…' : `${qa?.pendingPayouts ?? 0} pending requests`}
          </p>
        </Link>

        <Link
          to="/admin/reports"
          className="rounded-2xl bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
            <TrendingDown className="h-5 w-5 text-red-600" />
          </div>
          <p className="font-medium text-gray-900">Reports</p>
          <p className="text-sm text-gray-500">
            {loading ? '…' : `${qa?.pendingReports ?? 0} need attention`}
          </p>
        </Link>

        <Link
          to="/admin/content"
          className="rounded-2xl bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
            <Video className="h-5 w-5 text-purple-600" />
          </div>
          <p className="font-medium text-gray-900">Content Review</p>
          <p className="text-sm text-gray-500">
            {loading ? '…' : `${qa?.pendingContent ?? 0} items pending`}
          </p>
        </Link>
      </div>
    </div>
  );
}
