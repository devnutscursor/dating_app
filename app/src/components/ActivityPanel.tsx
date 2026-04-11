import { Heart, Gift, Eye } from 'lucide-react';
import { mockActivity } from '@/data/mockData';

export default function ActivityPanel() {
  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center"><Heart className="w-4 h-4 text-pink-500" /></div>;
      case 'gift':
        return <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center"><Gift className="w-4 h-4 text-yellow-500" /></div>;
      case 'view':
        return <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"><Eye className="w-4 h-4 text-blue-500" /></div>;
      default:
        return <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"><Heart className="w-4 h-4 text-gray-500" /></div>;
    }
  };

  const getMessage = (activity: typeof mockActivity[0]) => {
    switch (activity.type) {
      case 'like':
        return 'liked your profile';
      case 'gift':
        return activity.details || 'sent you a gift';
      case 'view':
        return 'viewed your profile';
      default:
        return '';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-lg text-gray-900">Activity</h2>
        <p className="text-sm text-gray-500">Recent interactions</p>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {mockActivity.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
            {getIcon(activity.type)}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">
                <span className="font-medium">{activity.user.name}</span>{' '}
                <span className="text-gray-600">{getMessage(activity)}</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">{activity.timestamp}</p>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {mockActivity.length === 0 && (
          <div className="text-center py-8">
            <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
}
