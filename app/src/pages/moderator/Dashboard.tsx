import { Image, Flag, UserCheck, CheckCircle } from 'lucide-react';

const stats = [
  { label: 'Pending Content', value: '12', icon: Image, color: 'bg-yellow-500' },
  { label: 'Pending Reports', value: '5', icon: Flag, color: 'bg-red-500' },
  { label: 'Verifications', value: '8', icon: UserCheck, color: 'bg-blue-500' },
  { label: 'Resolved Today', value: '24', icon: CheckCircle, color: 'bg-green-500' },
];

const recentTasks = [
  { type: 'content', action: 'Approved photo', user: 'Sarah M.', time: '2 min ago' },
  { type: 'report', action: 'Resolved report', user: 'John D.', time: '5 min ago' },
  { type: 'verification', action: 'Verified user', user: 'Emma W.', time: '10 min ago' },
  { type: 'content', action: 'Rejected video', user: 'Mike R.', time: '15 min ago' },
];

export default function ModeratorDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Moderator Dashboard</h1>
        <p className="text-gray-500">Overview of moderation tasks</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <a href="/moderator/content" className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
            <Image className="w-6 h-6 text-yellow-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Review Content</h3>
          <p className="text-sm text-gray-500 mt-1">12 items pending review</p>
        </a>

        <a href="/moderator/reports" className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
            <Flag className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Handle Reports</h3>
          <p className="text-sm text-gray-500 mt-1">5 reports need attention</p>
        </a>

        <a href="/moderator/verifications" className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <UserCheck className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Verify Users</h3>
          <p className="text-sm text-gray-500 mt-1">8 verification requests</p>
        </a>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentTasks.map((task, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-none">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  task.type === 'content' ? 'bg-yellow-100' :
                  task.type === 'report' ? 'bg-red-100' :
                  'bg-blue-100'
                }`}>
                  {task.type === 'content' && <Image className="w-4 h-4 text-yellow-600" />}
                  {task.type === 'report' && <Flag className="w-4 h-4 text-red-600" />}
                  {task.type === 'verification' && <UserCheck className="w-4 h-4 text-blue-600" />}
                </div>
                <div>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{task.action}</span>
                  </p>
                  <p className="text-sm text-gray-500">{task.user}</p>
                </div>
              </div>
              <span className="text-sm text-gray-400">{task.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
