import { Users, MessageSquare, Video, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

const stats = [
  { label: 'Total Users', value: '12,456', change: '+12%', icon: Users, color: 'bg-blue-500' },
  { label: 'Active Today', value: '3,245', change: '+8%', icon: Users, color: 'bg-green-500' },
  { label: 'Messages Sent', value: '45,892', change: '+23%', icon: MessageSquare, color: 'bg-purple-500' },
  { label: 'Video Calls', value: '1,234', change: '+15%', icon: Video, color: 'bg-pink-500' },
  { label: 'Revenue', value: '$24,567', change: '+18%', icon: DollarSign, color: 'bg-yellow-500' },
  { label: 'New Signups', value: '456', change: '-5%', icon: Users, color: 'bg-orange-500' },
];

const recentActivity = [
  { user: 'John D.', action: 'purchased', target: 'Elite Pack (1000 coins)', time: '2 min ago' },
  { user: 'Sarah M.', action: 'uploaded', target: 'new photo', time: '5 min ago' },
  { user: 'Mike R.', action: 'started', target: 'video call with Emma', time: '10 min ago' },
  { user: 'Lisa K.', action: 'reported', target: 'user profile', time: '15 min ago' },
  { user: 'Tom H.', action: 'withdrawal', target: '$500 requested', time: '20 min ago' },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Overview of platform activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.change.startsWith('+');
          
          return (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-4">
                {isPositive ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-400">vs last week</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-none">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">{activity.user[0]}</span>
                </div>
                <div>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.user}</span>{' '}
                    <span className="text-gray-500">{activity.action}</span>{' '}
                    <span className="font-medium">{activity.target}</span>
                  </p>
                </div>
              </div>
              <span className="text-sm text-gray-400">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow text-left">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <p className="font-medium text-gray-900">Manage Users</p>
          <p className="text-sm text-gray-500">View and edit user accounts</p>
        </button>
        
        <button className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow text-left">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <p className="font-medium text-gray-900">Review Payouts</p>
          <p className="text-sm text-gray-500">5 pending requests</p>
        </button>
        
        <button className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow text-left">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mb-3">
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
          <p className="font-medium text-gray-900">Reports</p>
          <p className="text-sm text-gray-500">3 new reports</p>
        </button>
        
        <button className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow text-left">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
            <Video className="w-5 h-5 text-purple-600" />
          </div>
          <p className="font-medium text-gray-900">Content Review</p>
          <p className="text-sm text-gray-500">12 items pending</p>
        </button>
      </div>
    </div>
  );
}
