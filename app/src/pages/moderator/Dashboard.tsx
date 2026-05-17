import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Image, Flag, UserCheck, CheckCircle } from 'lucide-react';
import { fetchModeratorStats, type ModeratorStats } from '@/lib/moderator';

function formatRelativeTime(iso: string) {
  if (!iso) return '';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return iso;
  const diff = Date.now() - t;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} d ago`;
}

export default function ModeratorDashboard() {
  const [stats, setStats] = useState<ModeratorStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetchModeratorStats()
      .then((s) => {
        if (!cancelled) setStats(s);
      })
      .catch(() => {
        if (!cancelled) setStats(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const pendingContent = stats?.pendingContent ?? 0;
  const pendingReports = stats?.pendingReports ?? 0;
  const pendingVerifications = stats?.pendingVerifications ?? 0;
  const resolvedToday = stats?.resolvedToday ?? 0;
  const recentActivity = stats?.recentActivity ?? [];

  const statCards = [
    { label: 'Pending Content', value: loading ? '…' : String(pendingContent), icon: Image, color: 'bg-yellow-500' },
    { label: 'Pending Reports', value: loading ? '…' : String(pendingReports), icon: Flag, color: 'bg-red-500' },
    { label: 'Verifications', value: loading ? '…' : String(pendingVerifications), icon: UserCheck, color: 'bg-blue-500' },
    { label: 'Resolved Today', value: loading ? '…' : String(resolvedToday), icon: CheckCircle, color: 'bg-green-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Moderator Dashboard</h1>
        <p className="text-gray-500">Overview of moderation tasks</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="mt-1 text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link to="/moderator/content" className="rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
            <Image className="h-6 w-6 text-yellow-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Review Content</h3>
          <p className="mt-1 text-sm text-gray-500">
            {pendingContent} {pendingContent === 1 ? 'item' : 'items'} pending review
          </p>
        </Link>

        <Link to="/moderator/reports" className="rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
            <Flag className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Handle Reports</h3>
          <p className="mt-1 text-sm text-gray-500">
            {pendingReports} {pendingReports === 1 ? 'report needs' : 'reports need'} attention
          </p>
        </Link>

        <Link to="/moderator/verifications" className="rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
            <UserCheck className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Verify Users</h3>
          <p className="mt-1 text-sm text-gray-500">
            {pendingVerifications} verification {pendingVerifications === 1 ? 'request' : 'requests'}
          </p>
        </Link>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Activity</h2>
        {recentActivity.length === 0 ? (
          <p className="text-sm text-gray-500">No recent moderation activity yet.</p>
        ) : (
          <div className="space-y-4">
            {recentActivity.map((task, index) => (
              <div
                key={`${task.type}-${task.at}-${index}`}
                className="flex items-center justify-between border-b border-gray-100 py-3 last:border-none"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      task.type === 'content'
                        ? 'bg-yellow-100'
                        : task.type === 'report'
                          ? 'bg-red-100'
                          : 'bg-blue-100'
                    }`}
                  >
                    {task.type === 'content' && <Image className="h-4 w-4 text-yellow-600" />}
                    {task.type === 'report' && <Flag className="h-4 w-4 text-red-600" />}
                    {task.type === 'verification' && <UserCheck className="h-4 w-4 text-blue-600" />}
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{task.action}</span>
                    </p>
                    <p className="text-sm text-gray-500">{task.user}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-400">{formatRelativeTime(task.at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
