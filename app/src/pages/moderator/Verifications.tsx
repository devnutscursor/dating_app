import { useState } from 'react';
import { UserCheck, Check, X, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const verificationRequests = [
  { 
    id: 1, 
    user: 'Sarah M.', 
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    document: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
    submitted: '10 min ago',
    status: 'pending'
  },
  { 
    id: 2, 
    user: 'John D.', 
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    document: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
    submitted: '25 min ago',
    status: 'pending'
  },
  { 
    id: 3, 
    user: 'Emma W.', 
    photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
    document: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
    submitted: '1 hour ago',
    status: 'pending'
  },
];

export default function ModeratorVerifications() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentRequest = verificationRequests[currentIndex];

  const handleApprove = () => {
    if (currentIndex < verificationRequests.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleReject = () => {
    if (currentIndex < verificationRequests.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < verificationRequests.length - 1) {
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
          <h1 className="text-2xl font-bold text-gray-900">Verifications</h1>
          <p className="text-gray-500">Review user verification requests</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg">
          <UserCheck className="w-4 h-4" />
          <span className="font-medium">{verificationRequests.length} pending</span>
        </div>
      </div>

      {/* Guidelines */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-yellow-800">Verification Guidelines</p>
          <ul className="text-sm text-yellow-700 mt-1 space-y-1">
            <li>• Photo must clearly show the user&apos;s face</li>
            <li>• Document must be valid and not expired</li>
            <li>• Name on document should match profile name</li>
          </ul>
        </div>
      </div>

      {/* Verification Viewer */}
      {currentRequest ? (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Progress */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <span className="text-sm text-gray-500">
              Request {currentIndex + 1} of {verificationRequests.length}
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
                disabled={currentIndex === verificationRequests.length - 1}
                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* User Info */}
            <div className="flex items-center gap-4 mb-6">
              <img 
                src={currentRequest.photo} 
                alt={currentRequest.user}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h2 className="text-xl font-bold text-gray-900">{currentRequest.user}</h2>
                <p className="text-sm text-gray-500">Submitted {currentRequest.submitted}</p>
              </div>
            </div>

            {/* Photos */}
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500 mb-2">Profile Photo</p>
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                  <img 
                    src={currentRequest.photo} 
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">ID Document</p>
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                  <img 
                    src={currentRequest.document} 
                    alt="Document"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button 
                onClick={handleApprove}
                className="flex-1 bg-green-500 hover:bg-green-600 gap-2"
              >
                <Check className="w-5 h-5" />
                Verify User
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
          <p className="text-gray-500">No pending verification requests</p>
        </div>
      )}
    </div>
  );
}
