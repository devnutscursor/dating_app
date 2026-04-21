import { useState } from 'react';
import { UserCheck, Check, X, ChevronLeft, ChevronRight, AlertCircle, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';

const verificationRequests = [
  {
    id: 1,
    user: 'Sarah M.',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
    challengeNumbers: '7 4 2 9 1',
    submitted: '10 min ago',
    status: 'pending' as const,
  },
  {
    id: 2,
    user: 'John D.',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
    challengeNumbers: '3 8 0 6 2',
    submitted: '25 min ago',
    status: 'pending' as const,
  },
  {
    id: 3,
    user: 'Emma W.',
    photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
    challengeNumbers: '1 5 5 0 4',
    submitted: '1 hour ago',
    status: 'pending' as const,
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
        <div className="flex items-center gap-2 rounded-lg bg-blue-100 px-4 py-2 text-blue-700">
          <UserCheck className="h-4 w-4" />
          <span className="font-medium">{verificationRequests.length} pending</span>
        </div>
      </div>

      {/* Guidelines */}
      <div className="flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
        <div>
          <p className="font-medium text-yellow-800">Video verification guidelines</p>
          <ul className="mt-1 space-y-1 text-sm text-yellow-700">
            <li>• The member must speak the on-screen numbers clearly, in order, in their own voice.</li>
            <li>• Their face should stay visible and match the profile photo.</li>
            <li>• Reject if the phrase is missing, wrong, or the video looks pre-recorded or edited.</li>
          </ul>
        </div>
      </div>

      {/* Verification Viewer */}
      {currentRequest ? (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          {/* Progress */}
          <div className="flex items-center justify-between border-b border-gray-100 p-4">
            <span className="text-sm text-gray-500">
              Request {currentIndex + 1} of {verificationRequests.length}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="rounded-lg p-2 hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={currentIndex === verificationRequests.length - 1}
                className="rounded-lg p-2 hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* User Info */}
            <div className="mb-6 flex items-center gap-4">
              <img
                src={currentRequest.photo}
                alt={currentRequest.user}
                className="h-16 w-16 rounded-full object-cover"
              />
              <div>
                <h2 className="text-xl font-bold text-gray-900">{currentRequest.user}</h2>
                <p className="text-sm text-gray-500">Submitted {currentRequest.submitted}</p>
              </div>
            </div>

            {/* Profile + video verification */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-sm text-gray-500">Profile photo</p>
                <div className="aspect-square overflow-hidden rounded-xl bg-gray-100">
                  <img src={currentRequest.photo} alt="Profile" className="h-full w-full object-cover" />
                </div>
              </div>
              <div>
                <p className="mb-2 flex items-center gap-2 text-sm text-gray-500">
                  <Video className="h-4 w-4" />
                  Video verification
                </p>
                <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-900">
                  <video
                    key={currentRequest.id}
                    className="h-full w-full object-cover"
                    controls
                    playsInline
                    poster={currentRequest.photo}
                    preload="metadata"
                  >
                    <source src={currentRequest.videoUrl} type="video/webm" />
                    Your browser does not support embedded verification videos.
                  </video>
                </div>
                <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/80 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-900/80">
                    Numbers they were asked to say
                  </p>
                  <p className="mt-1 font-mono text-2xl font-bold tracking-[0.2em] text-blue-950">
                    {currentRequest.challengeNumbers}
                  </p>
                  <p className="mt-2 text-xs text-blue-900/75">
                    Confirm you hear these digits in order in the recording. No passport or ID upload is required.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button onClick={handleApprove} className="flex-1 gap-2 bg-green-500 hover:bg-green-600">
                <Check className="h-5 w-5" />
                Verify user
              </Button>
              <Button onClick={handleReject} variant="outline" className="flex-1 gap-2 text-red-500 hover:bg-red-50">
                <X className="h-5 w-5" />
                Reject
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <Check className="h-10 w-10 text-green-500" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">All caught up!</h3>
          <p className="text-gray-500">No pending verification requests</p>
        </div>
      )}
    </div>
  );
}
