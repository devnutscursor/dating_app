import { useCallback, useEffect, useState } from 'react';
import { UserCheck, Check, X, ChevronLeft, ChevronRight, AlertCircle, Video, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  fetchModeratorVerifications,
  reviewModeratorVerification,
  type VerificationRequestItem,
} from '@/lib/verification';

function formatSubmitted(iso?: string) {
  if (!iso) return '';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return iso;
  const mins = Math.floor((Date.now() - t) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} d ago`;
}

export default function ModeratorVerifications() {
  const [requests, setRequests] = useState<VerificationRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchModeratorVerifications();
      setRequests(list);
      setCurrentIndex(0);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not load verifications');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const currentRequest = requests[currentIndex];

  const removeCurrent = () => {
    setRequests((prev) => prev.filter((_, i) => i !== currentIndex));
    setCurrentIndex((i) => Math.max(0, Math.min(i, requests.length - 2)));
  };

  const handleDecision = async (decision: 'approved' | 'rejected') => {
    if (!currentRequest) return;
    setBusy(true);
    try {
      await reviewModeratorVerification(currentRequest.id, decision);
      toast.success(decision === 'approved' ? 'User verified' : 'Verification rejected');
      removeCurrent();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-gray-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading verifications…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Verifications</h1>
          <p className="text-gray-500">Review user verification requests</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-blue-100 px-4 py-2 text-blue-700">
          <UserCheck className="h-4 w-4" />
          <span className="font-medium">{requests.length} pending</span>
        </div>
      </div>

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

      {currentRequest ? (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 p-4">
            <span className="text-sm text-gray-500">
              Request {currentIndex + 1} of {requests.length}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
                className="rounded-lg p-2 hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentIndex((i) => Math.min(requests.length - 1, i + 1))}
                disabled={currentIndex === requests.length - 1}
                className="rounded-lg p-2 hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-6 flex items-center gap-4">
              <img
                src={currentRequest.profilePhotoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'}
                alt={currentRequest.userDisplayName || 'Member'}
                className="h-16 w-16 rounded-full object-cover"
              />
              <div>
                <h2 className="text-xl font-bold text-gray-900">{currentRequest.userDisplayName || 'Member'}</h2>
                <p className="text-sm text-gray-500">Submitted {formatSubmitted(currentRequest.submittedAt)}</p>
              </div>
            </div>

            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-sm text-gray-500">Profile photo</p>
                <div className="aspect-square overflow-hidden rounded-xl bg-gray-100">
                  <img
                    src={currentRequest.profilePhotoUrl || ''}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
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
                    poster={currentRequest.profilePhotoUrl}
                    preload="metadata"
                  >
                    <source src={currentRequest.videoUrl} />
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
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                disabled={busy}
                onClick={() => void handleDecision('approved')}
                className="flex-1 gap-2 bg-green-500 hover:bg-green-600"
              >
                <Check className="h-5 w-5" />
                Verify user
              </Button>
              <Button
                disabled={busy}
                onClick={() => void handleDecision('rejected')}
                variant="outline"
                className="flex-1 gap-2 text-red-500 hover:bg-red-50"
              >
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
