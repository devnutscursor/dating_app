import { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, Video, Check, X, ArrowLeft, ArrowRight, Lock, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { fetchAdminPendingContent, reviewAdminFemaleMedia } from '@/lib/admin';
import type { PendingFemaleMediaItem } from '@/types';

export default function AdminContent() {
  const [items, setItems] = useState<PendingFemaleMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState<'all' | 'photo' | 'video'>('all');
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionBusy, setActionBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchAdminPendingContent();
      setItems(list);
      setCurrentIndex(0);
    } catch {
      setItems([]);
      toast.error('Could not load pending content');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredContent = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter((item) => item.mediaKind === filter);
  }, [items, filter]);

  const currentItem = filteredContent[currentIndex] ?? null;

  useEffect(() => {
    setCurrentIndex((i) => {
      if (filteredContent.length === 0) return 0;
      return Math.min(i, filteredContent.length - 1);
    });
  }, [filteredContent.length]);

  const submitReview = async (
    item: PendingFemaleMediaItem,
    decision: 'approved' | 'rejected',
    rejectionReason?: string
  ) => {
    setActionBusy(true);
    try {
      await reviewAdminFemaleMedia({
        userId: item.userId,
        mediaKind: item.mediaKind,
        mediaId: item.mediaId,
        decision,
        rejectionReason: rejectionReason?.trim() || undefined,
      });
      toast.success(decision === 'approved' ? 'Approved' : 'Rejected');
      setRejectOpen(false);
      setRejectReason('');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setActionBusy(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredContent.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  if (loading) {
    return <div className="py-16 text-center text-gray-500">Loading content queue…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Moderation</h1>
          <p className="text-gray-500">Review and approve women&apos;s photos & videos</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-yellow-100 px-4 py-2 text-yellow-800">
          <span className="font-medium">{filteredContent.length} pending</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setFilter('all');
            setCurrentIndex(0);
          }}
          className={`rounded-lg px-4 py-2 font-medium transition-colors ${
            filter === 'all' ? 'bg-green-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => {
            setFilter('photo');
            setCurrentIndex(0);
          }}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors ${
            filter === 'photo' ? 'bg-green-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Image className="h-4 w-4" />
          Photos
        </button>
        <button
          type="button"
          onClick={() => {
            setFilter('video');
            setCurrentIndex(0);
          }}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors ${
            filter === 'video' ? 'bg-green-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Video className="h-4 w-4" />
          Videos
        </button>
      </div>

      {currentItem ? (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 p-4">
            <span className="text-sm text-gray-500">
              Item {currentIndex + 1} of {filteredContent.length}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="rounded-lg p-2 hover:bg-gray-100 disabled:opacity-50"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={currentIndex === filteredContent.length - 1}
                className="rounded-lg p-2 hover:bg-gray-100 disabled:opacity-50"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="relative flex aspect-video items-center justify-center bg-gray-900">
            {currentItem.mediaKind === 'photo' ? (
              <img src={currentItem.url} alt="" className="max-h-full max-w-full object-contain" />
            ) : (
              <video
                controls
                className="max-h-full max-w-full"
                poster={currentItem.thumbnail}
                src={currentItem.url}
              />
            )}
          </div>

          <div className="p-6">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium text-gray-900">{currentItem.memberName}</p>
                <p className="text-xs text-gray-400">Member ID: {currentItem.userId}</p>
                <p className="mt-1 text-sm text-gray-500 capitalize">{currentItem.mediaKind}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${
                    currentItem.isPublic ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {currentItem.isPublic ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                  {currentItem.isPublic ? 'Public' : 'Private locked'}
                </span>
                {!currentItem.isPublic && currentItem.unlockPrice != null ? (
                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-900">
                    {currentItem.unlockPrice} coins unlock
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                className="flex-1 gap-2 bg-green-500 hover:bg-green-600"
                disabled={actionBusy}
                onClick={() => void submitReview(currentItem, 'approved')}
              >
                <Check className="h-5 w-5" />
                Approve
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={actionBusy}
                className="flex-1 gap-2 text-red-600 hover:bg-red-50"
                onClick={() => {
                  setRejectReason('');
                  setRejectOpen(true);
                }}
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
          <p className="text-gray-500">No pending content to review</p>
          <Button type="button" variant="outline" className="mt-4" onClick={() => void load()}>
            Refresh
          </Button>
        </div>
      )}

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject upload</DialogTitle>
            <DialogDescription>Optional note is included in the member&apos;s notification.</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Brief reason…"
            value={rejectReason}
            className="resize-none"
            rows={3}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <DialogFooter className="flex flex-row flex-wrap gap-3">
            <Button type="button" variant="outline" onClick={() => setRejectOpen(false)} disabled={actionBusy}>
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-red-600 hover:bg-red-700"
              disabled={actionBusy || !currentItem}
              onClick={() => currentItem && void submitReview(currentItem, 'rejected', rejectReason)}
            >
              Reject upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
