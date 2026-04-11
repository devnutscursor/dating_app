import { useState } from 'react';
import { Flag, Check, X, MessageSquare, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const reports = [
  { 
    id: 1, 
    reporter: 'John D.', 
    reported: 'Sarah M.', 
    type: 'harassment', 
    topic: 'Inappropriate messages',
    description: 'User sent multiple inappropriate messages after being asked to stop.',
    status: 'pending',
    date: '2 hours ago' 
  },
  { 
    id: 2, 
    reporter: 'Emma W.', 
    reported: 'Mike R.', 
    type: 'profile', 
    topic: 'Fake profile',
    description: 'Profile uses photos that appear to be stolen from another person.',
    status: 'pending',
    date: '5 hours ago' 
  },
  { 
    id: 3, 
    reporter: 'Tom H.', 
    reported: 'Lisa K.', 
    type: 'financial', 
    topic: 'Payment dispute',
    description: 'User claims they paid for content but never received it.',
    status: 'pending',
    date: '1 day ago' 
  },
];

const getTypeColor = (type: string) => {
  switch (type) {
    case 'financial': return 'bg-red-100 text-red-700';
    case 'profile': return 'bg-blue-100 text-blue-700';
    case 'harassment': return 'bg-green-100 text-green-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

export default function ModeratorReports() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentReport = reports[currentIndex];

  const handleResolve = () => {
    if (currentIndex < reports.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleDismiss = () => {
    if (currentIndex < reports.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < reports.length - 1) {
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
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500">Review and resolve user reports</p>
        </div>
        <div className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg">
          <Flag className="w-4 h-4" />
          <span className="font-medium">{reports.length} pending</span>
        </div>
      </div>

      {/* Report Viewer */}
      {currentReport ? (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Progress */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <span className="text-sm text-gray-500">
              Report {currentIndex + 1} of {reports.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex === reports.length - 1}
                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Type & Date */}
            <div className="flex items-center gap-3 mb-6">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(currentReport.type)}`}>
                {currentReport.type}
              </span>
              <span className="text-sm text-gray-400">{currentReport.date}</span>
            </div>

            {/* Topic */}
            <h2 className="text-xl font-bold text-gray-900 mb-4">{currentReport.topic}</h2>

            {/* Users */}
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">Reported by</p>
                <p className="font-medium text-gray-900">{currentReport.reporter}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">User reported</p>
                <p className="font-medium text-gray-900">{currentReport.reported}</p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-500 mb-2">Description</p>
              <p className="text-gray-700">{currentReport.description}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button 
                onClick={handleResolve}
                className="flex-1 bg-green-500 hover:bg-green-600 gap-2"
              >
                <Check className="w-5 h-5" />
                Resolve
              </Button>
              <Button 
                variant="outline"
                className="gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                Message
              </Button>
              <Button 
                variant="outline"
                className="gap-2 text-orange-500 hover:bg-orange-50"
              >
                <AlertTriangle className="w-5 h-5" />
                Escalate
              </Button>
              <Button 
                onClick={handleDismiss}
                variant="outline"
                className="text-red-500 hover:bg-red-50 gap-2"
              >
                <X className="w-5 h-5" />
                Dismiss
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
          <p className="text-gray-500">No pending reports to review</p>
        </div>
      )}
    </div>
  );
}
