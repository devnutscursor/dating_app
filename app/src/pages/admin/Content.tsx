import { useState } from 'react';
import { Image, Video, Check, X, Eye, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

const pendingContent = [
  { id: 1, type: 'photo', user: 'Sarah M.', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', submitted: '2 min ago' },
  { id: 2, type: 'video', user: 'John D.', thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', submitted: '5 min ago' },
  { id: 3, type: 'photo', user: 'Emma W.', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400', submitted: '10 min ago' },
  { id: 4, type: 'photo', user: 'Mike R.', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', submitted: '15 min ago' },
];

export default function AdminContent() {
  const [filter, setFilter] = useState<'all' | 'photos' | 'videos'>('all');

  const filteredContent = pendingContent.filter(item => {
    if (filter === 'all') return true;
    return item.type === filter.slice(0, -1);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Moderation</h1>
          <p className="text-gray-500">Review and approve user content</p>
        </div>
        <div className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg">
          <Filter className="w-4 h-4" />
          <span className="font-medium">{pendingContent.length} pending</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all' ? 'bg-green-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('photos')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            filter === 'photos' ? 'bg-green-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Image className="w-4 h-4" />
          Photos
        </button>
        <button
          onClick={() => setFilter('videos')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            filter === 'videos' ? 'bg-green-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Video className="w-4 h-4" />
          Videos
        </button>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredContent.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <div className="relative aspect-square">
              {item.type === 'photo' ? (
                <img src={item.url} alt="" className="w-full h-full object-cover" />
              ) : (
                <>
                  <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                      <Video className="w-6 h-6 text-gray-700" />
                    </div>
                  </div>
                </>
              )}
              
              {/* Type Badge */}
              <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
                <span className="text-xs text-white capitalize">{item.type}</span>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium text-gray-900">{item.user}</p>
                  <p className="text-sm text-gray-500">{item.submitted}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 gap-1"
                >
                  <Eye className="w-4 h-4" />
                  View
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1 bg-green-500 hover:bg-green-600 gap-1"
                >
                  <Check className="w-4 h-4" />
                  Approve
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="text-red-500 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredContent.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">All caught up!</h3>
          <p className="text-gray-500">No pending content to review</p>
        </div>
      )}
    </div>
  );
}
