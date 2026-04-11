import { useState } from 'react';
import { Image, Video, Check, X, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const pendingContent = [
  { id: 1, type: 'photo', user: 'Sarah M.', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', submitted: '2 min ago' },
  { id: 2, type: 'video', user: 'John D.', thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', submitted: '5 min ago' },
  { id: 3, type: 'photo', user: 'Emma W.', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400', submitted: '10 min ago' },
  { id: 4, type: 'photo', user: 'Mike R.', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', submitted: '15 min ago' },
  { id: 5, type: 'video', user: 'Lisa K.', thumbnail: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', submitted: '20 min ago' },
];

export default function ModeratorContent() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState<'all' | 'photos' | 'videos'>('all');

  const filteredContent = pendingContent.filter(item => {
    if (filter === 'all') return true;
    return item.type === filter.slice(0, -1);
  });

  const currentItem = filteredContent[currentIndex];

  const handleApprove = () => {
    if (currentIndex < filteredContent.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleReject = () => {
    if (currentIndex < filteredContent.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredContent.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Review</h1>
          <p className="text-gray-500">Review and approve user content</p>
        </div>
        <div className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg">
          <span className="font-medium">{filteredContent.length} pending</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => { setFilter('all'); setCurrentIndex(0); }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          All
        </button>
        <button
          onClick={() => { setFilter('photos'); setCurrentIndex(0); }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            filter === 'photos' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Image className="w-4 h-4" />
          Photos
        </button>
        <button
          onClick={() => { setFilter('videos'); setCurrentIndex(0); }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            filter === 'videos' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Video className="w-4 h-4" />
          Videos
        </button>
      </div>

      {/* Content Viewer */}
      {currentItem ? (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Progress */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <span className="text-sm text-gray-500">
              Item {currentIndex + 1} of {filteredContent.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex === filteredContent.length - 1}
                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="relative aspect-video bg-gray-900 flex items-center justify-center">
            {currentItem.type === 'photo' ? (
              <img src={currentItem.url} alt="" className="max-w-full max-h-full object-contain" />
            ) : (
              <>
                <img src={currentItem.thumbnail} alt="" className="max-w-full max-h-full object-contain" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                    <Video className="w-8 h-8 text-gray-700" />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Info */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-medium text-gray-900">{currentItem.user}</p>
                <p className="text-sm text-gray-500">Submitted {currentItem.submitted}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentItem.type === 'photo' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
              }`}>
                {currentItem.type}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button 
                onClick={handleApprove}
                className="flex-1 bg-green-500 hover:bg-green-600 gap-2"
              >
                <Check className="w-5 h-5" />
                Approve
              </Button>
              <Button 
                onClick={handleReject}
                variant="outline"
                className="flex-1 text-red-500 hover:bg-red-50 gap-2"
              >
                <X className="w-5 h-5" />
                Reject
              </Button>
            </div>
          </div>
        </div>
      ) : (
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
