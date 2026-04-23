import { useCallback, useEffect, useMemo, useState } from 'react';
import { Flag, Check, X, MessageSquare, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/lib/formatRelativeTime';
import { fetchModeratorReports, patchModeratorReport } from '@/lib/moderator';
import type { Report } from '@/types';

const getTypeColor = (type: string) => {
  switch (type) {
    case 'financial':
      return 'bg-red-100 text-red-700';
    case 'profile':
      return 'bg-blue-100 text-blue-700';
    case 'harassment':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

function reportDateLabel(createdAt: string) {
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(createdAt) ? `${createdAt}T12:00:00Z` : createdAt;
  return formatRelativeTime(iso);
}

export default function ModeratorReports() {
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [actionBusy, setActionBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await fetchModeratorReports();
      setAllReports(rows);
    } catch {
      setAllReports([]);
      toast.error('Could not load reports');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const pendingList = useMemo(
    () => allReports.filter((r) => r.status === 'pending' || r.status === 'reviewing'),
    [allReports]
  );

  useEffect(() => {
    setCurrentIndex((i) => {
      if (pendingList.length === 0) return 0;
      return Math.min(i, pendingList.length - 1);
    });
  }, [pendingList.length]);

  const currentReport = pendingList[currentIndex] ?? null;

  const goNext = () => {
    if (currentIndex < pendingList.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const applyStatus = async (status: 'resolved' | 'dismissed') => {
    if (!currentReport) return;
    setActionBusy(true);
    try {
      await patchModeratorReport(currentReport.id, { status });
      toast.success(status === 'resolved' ? 'Report resolved' : 'Report dismissed');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setActionBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-gray-500">Loading reports…</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500">Review and resolve user reports</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-red-100 px-4 py-2 text-red-700">
          <Flag className="h-4 w-4" />
          <span className="font-medium">{pendingList.length} pending</span>
        </div>
      </div>

      {currentReport ? (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 p-4">
            <span className="text-sm text-gray-500">
              Report {currentIndex + 1} of {pendingList.length}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={goPrev}
                disabled={currentIndex === 0}
                className="rounded-lg p-2 hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={currentIndex === pendingList.length - 1}
                className="rounded-lg p-2 hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-6 flex items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${getTypeColor(currentReport.type)}`}>
                {currentReport.type}
              </span>
              <span className="text-sm text-gray-400">{reportDateLabel(currentReport.createdAt)}</span>
            </div>

            <h2 className="mb-4 text-xl font-bold text-gray-900">{currentReport.topic}</h2>

            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="mb-1 text-sm text-gray-500">Reported by</p>
                <p className="font-medium text-gray-900">{currentReport.reporterName ?? 'Unknown user'}</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="mb-1 text-sm text-gray-500">User reported</p>
                <p className="font-medium text-gray-900">{currentReport.reportedName ?? 'Unknown user'}</p>
              </div>
            </div>

            <div className="mb-6 rounded-xl bg-gray-50 p-4">
              <p className="mb-2 text-sm text-gray-500">Description</p>
              <p className="text-gray-700">{currentReport.comment}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={() => void applyStatus('resolved')}
                disabled={actionBusy}
                className="min-w-[8rem] flex-1 gap-2 bg-green-500 hover:bg-green-600"
              >
                <Check className="h-5 w-5" />
                {actionBusy ? 'Saving…' : 'Resolve'}
              </Button>
              <Button type="button" variant="outline" className="gap-2" disabled>
                <MessageSquare className="h-5 w-5" />
                Message
              </Button>
              <Button type="button" variant="outline" className="gap-2 text-orange-500 hover:bg-orange-50" disabled>
                <AlertTriangle className="h-5 w-5" />
                Escalate
              </Button>
              <Button
                type="button"
                onClick={() => void applyStatus('dismissed')}
                disabled={actionBusy}
                variant="outline"
                className="gap-2 text-red-500 hover:bg-red-50"
              >
                <X className="h-5 w-5" />
                Dismiss
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
          <p className="text-gray-500">No pending reports to review</p>
        </div>
      )}
    </div>
  );
}
