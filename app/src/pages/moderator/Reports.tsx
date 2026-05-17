import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flag,
  Check,
  X,
  MessageSquare,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Users,
  UserX,
} from 'lucide-react';
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
import { formatRelativeTime } from '@/lib/formatRelativeTime';
import {
  fetchModeratorReports,
  fetchReportTranscript,
  openModeratorSupportThread,
  patchModeratorReport,
  suspendModeratorMember,
  unsuspendModeratorMember,
  type ReportTranscriptMessage,
} from '@/lib/moderator';
import { getReportPlaybook, REPORT_TYPE_LABELS } from '@/lib/reportModeration';
import type { Report } from '@/types';

type SuspendParty = 'reporter' | 'reported';


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

type OutcomeKind = 'resolved' | 'dismissed' | 'reviewing';

export default function ModeratorReports() {
  const navigate = useNavigate();
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [actionBusy, setActionBusy] = useState(false);

  const [transcript, setTranscript] = useState<ReportTranscriptMessage[]>([]);
  const [transcriptLoading, setTranscriptLoading] = useState(false);

  const [outcomeOpen, setOutcomeOpen] = useState(false);
  const [outcomeKind, setOutcomeKind] = useState<OutcomeKind>('resolved');
  const [outcomeNote, setOutcomeNote] = useState('');

  const [messageOpen, setMessageOpen] = useState(false);
  const [messageBusy, setMessageBusy] = useState(false);

  const [suspendOpen, setSuspendOpen] = useState(false);
  const [suspendParty, setSuspendParty] = useState<SuspendParty>('reported');
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendBusy, setSuspendBusy] = useState(false);

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

  useEffect(() => {
    if (!currentReport) {
      setTranscript([]);
      return;
    }
    let cancelled = false;
    void (async () => {
      setTranscriptLoading(true);
      try {
        const data = await fetchReportTranscript(currentReport.id);
        if (cancelled) return;
        setTranscript(data.transcript?.messages ?? []);
      } catch {
        if (!cancelled) setTranscript([]);
      } finally {
        if (!cancelled) setTranscriptLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentReport?.id]);

  const goNext = () => {
    if (currentIndex < pendingList.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const openOutcome = (kind: OutcomeKind) => {
    setOutcomeKind(kind);
    setOutcomeNote('');
    setOutcomeOpen(true);
  };

  const submitOutcome = async () => {
    if (!currentReport) return;
    const status = outcomeKind === 'reviewing' ? 'reviewing' : outcomeKind;
    const resolution = outcomeNote.trim() || undefined;
    setActionBusy(true);
    try {
      await patchModeratorReport(currentReport.id, { status, resolution });
      const label =
        outcomeKind === 'resolved'
          ? 'Report resolved'
          : outcomeKind === 'dismissed'
            ? 'Report dismissed'
            : 'Report escalated';
      toast.success(label);
      setOutcomeOpen(false);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setActionBusy(false);
    }
  };

  const openThreadWith = async (targetUserId: string | undefined) => {
    if (!currentReport || !targetUserId) return;
    setMessageBusy(true);
    try {
      const chat = await openModeratorSupportThread(currentReport.id, targetUserId);
      setMessageOpen(false);
      toast.success('Opening moderation chat');
      navigate(`/moderator/support/${chat.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not open chat');
    } finally {
      setMessageBusy(false);
    }
  };

  const playbook = useMemo(
    () => (currentReport ? getReportPlaybook(currentReport.type) : null),
    [currentReport]
  );

  const openSuspendDialog = (party: SuspendParty, presetReason?: string) => {
    setSuspendParty(party);
    setSuspendReason(presetReason?.trim() || '');
    setSuspendOpen(true);
  };

  const submitSuspend = async () => {
    if (!currentReport) return;
    const userId =
      suspendParty === 'reported' ? currentReport.reportedId : currentReport.reporterId;
    if (!userId) {
      toast.error('Missing user id');
      return;
    }
    const reason = suspendReason.trim() || 'Terms of Service violation';
    setSuspendBusy(true);
    try {
      await suspendModeratorMember(userId, { reason, reportId: currentReport.id });
      toast.success(`${suspendParty === 'reported' ? 'Reported member' : 'Reporter'} suspended`);
      setSuspendOpen(false);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Suspend failed');
    } finally {
      setSuspendBusy(false);
    }
  };

  const reinstateParty = async (party: SuspendParty) => {
    if (!currentReport) return;
    const userId =
      party === 'reported' ? currentReport.reportedId : currentReport.reporterId;
    if (!userId) return;
    try {
      await unsuspendModeratorMember(userId);
      toast.success('Account reinstated');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Reinstate failed');
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
          <p className="text-gray-500">Review evidence, message members, and close the loop with notifications</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-red-100 px-4 py-2 text-red-700">
          <Flag className="h-4 w-4" />
          <span className="font-medium">{pendingList.length} active</span>
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
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${getTypeColor(currentReport.type)}`}>
                {REPORT_TYPE_LABELS[currentReport.type]}
              </span>
              <span className="text-sm text-gray-400">{reportDateLabel(currentReport.createdAt)}</span>
              {currentReport.status === 'reviewing' && (
                <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800">
                  Escalated
                </span>
              )}
            </div>

            <h2 className="mb-4 text-xl font-bold text-gray-900">{currentReport.topic}</h2>

            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-gray-50 p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <p className="text-sm text-gray-500">Reported by (reporter)</p>
                  {currentReport.reporterIsSuspended ? (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                      Suspended
                    </span>
                  ) : null}
                </div>
                <p className="font-medium text-gray-900">{currentReport.reporterName ?? 'Unknown user'}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {currentReport.reporterIsSuspended ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="text-green-700"
                      onClick={() => void reinstateParty('reporter')}
                    >
                      Reinstate reporter
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="gap-1 text-red-600"
                      onClick={() => openSuspendDialog('reporter')}
                    >
                      <UserX className="h-3.5 w-3.5" />
                      Suspend reporter
                    </Button>
                  )}
                </div>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <p className="text-sm text-gray-500">User reported</p>
                  {currentReport.reportedIsSuspended ? (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                      Suspended
                    </span>
                  ) : null}
                </div>
                <p className="font-medium text-gray-900">{currentReport.reportedName ?? 'Unknown user'}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {currentReport.reportedIsSuspended ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="text-green-700"
                      onClick={() => void reinstateParty('reported')}
                    >
                      Reinstate reported
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="gap-1 text-red-600"
                      onClick={() => openSuspendDialog('reported')}
                    >
                      <UserX className="h-3.5 w-3.5" />
                      Suspend reported
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-6 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
              <div className="mb-2 flex items-center gap-2 text-indigo-900">
                <Users className="h-4 w-4" />
                <p className="text-sm font-semibold">Conversation between the parties (read-only)</p>
              </div>
              {transcriptLoading ? (
                <p className="text-sm text-indigo-800/80">Loading messages…</p>
              ) : transcript.length === 0 ? (
                <p className="text-sm text-indigo-800/80">
                  No dating chat transcript on file for this report.
                  {currentReport.relatedChatId
                    ? ' The linked thread may have been removed.'
                    : ' Older reports may not have a linked chat; new reports from “Report user” in chat include one.'}
                </p>
              ) : (
                <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg bg-white/80 p-3 text-sm">
                  {transcript.map((m) => {
                    const isReporter = m.senderId === currentReport.reporterId;
                    return (
                      <div
                        key={m.id}
                        className={`rounded-lg border px-3 py-2 ${
                          isReporter
                            ? 'border-l-4 border-l-blue-500 bg-blue-50/80'
                            : 'border-l-4 border-l-pink-500 bg-pink-50/80'
                        }`}
                      >
                        <p className="text-xs font-medium text-gray-600">
                          {m.senderName}
                          {isReporter ? ' (reporter)' : ' (reported)'}
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-gray-900">{m.content || `(${m.type})`}</p>
                        <p className="mt-1 text-xs text-gray-400">{m.timestamp}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mb-6 rounded-xl bg-gray-50 p-4">
              <p className="mb-2 text-sm text-gray-500">Reporter description</p>
              <p className="text-gray-700">{currentReport.comment}</p>
            </div>

            {playbook ? (
              <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                <p className="text-sm font-semibold text-amber-950">{playbook.title}</p>
                <p className="mt-1 text-xs text-amber-900/80">
                  Recommended workflow for this report category. Suspensions notify the member in-app with your reason.
                </p>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-amber-950/95">
                  {playbook.steps.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
                <div className="mt-4 border-t border-amber-200/80 pt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-900">
                    Quick suspension reasons (reported user)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {playbook.reportedPresets.map((p) => (
                      <Button
                        key={p.label}
                        type="button"
                        size="sm"
                        variant="outline"
                        className="border-red-200 bg-white text-red-800 hover:bg-red-50"
                        disabled={suspendBusy || Boolean(currentReport.reportedIsSuspended)}
                        onClick={() => openSuspendDialog('reported', p.reason)}
                      >
                        {p.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="mt-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-900">
                    Quick suspension reasons (reporter — rare)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {playbook.reporterPresets.map((p) => (
                      <Button
                        key={p.label}
                        type="button"
                        size="sm"
                        variant="outline"
                        className="border-amber-300 bg-white text-amber-950 hover:bg-amber-100"
                        disabled={suspendBusy || Boolean(currentReport.reporterIsSuspended)}
                        onClick={() => openSuspendDialog('reporter', p.reason)}
                      >
                        {p.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            <p className="mb-3 text-xs text-gray-500">
              Resolve, dismiss, or escalate notifies both the reporter and the reported member in-app.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={() => openOutcome('resolved')}
                disabled={actionBusy}
                className="min-w-[8rem] flex-1 gap-2 bg-green-500 hover:bg-green-600"
              >
                <Check className="h-5 w-5" />
                Resolve
              </Button>
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                disabled={actionBusy}
                onClick={() => setMessageOpen(true)}
              >
                <MessageSquare className="h-5 w-5" />
                Message
              </Button>
              <Button
                type="button"
                variant="outline"
                className="gap-2 text-orange-600 hover:bg-orange-50"
                disabled={actionBusy}
                onClick={() => openOutcome('reviewing')}
              >
                <AlertTriangle className="h-5 w-5" />
                Escalate
              </Button>
              <Button
                type="button"
                onClick={() => openOutcome('dismissed')}
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
          <p className="text-gray-500">No pending or escalated reports in the queue</p>
        </div>
      )}

      <Dialog open={outcomeOpen} onOpenChange={setOutcomeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {outcomeKind === 'resolved' && 'Resolve report'}
              {outcomeKind === 'dismissed' && 'Dismiss report'}
              {outcomeKind === 'reviewing' && 'Escalate report'}
            </DialogTitle>
            <DialogDescription>
              {outcomeKind === 'reviewing'
                ? 'Both parties are notified that the case is under senior review. Optional note is included in their notifications.'
                : 'Optional message to both parties (shown in their notifications).'}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={outcomeNote}
            onChange={(e) => setOutcomeNote(e.target.value)}
            placeholder={
              outcomeKind === 'reviewing'
                ? 'Internal context for the parties (optional)…'
                : 'Brief outcome summary for reporter and reported user (optional)…'
            }
            rows={4}
            className="resize-none"
          />
          <DialogFooter className="flex flex-row flex-wrap justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOutcomeOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={actionBusy}
              className={
                outcomeKind === 'dismissed'
                  ? 'bg-red-600 hover:bg-red-700'
                  : outcomeKind === 'reviewing'
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : 'bg-green-600 hover:bg-green-700'
              }
              onClick={() => void submitOutcome()}
            >
              {actionBusy ? 'Saving…' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Message a party</DialogTitle>
            <DialogDescription>
              Opens a dedicated amber “moderation staff” chat (text-only). Choose who you need more detail from.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              className="justify-start gap-3 border-blue-200 bg-blue-50/80 text-left hover:bg-blue-100"
              disabled={messageBusy}
              onClick={() => void openThreadWith(currentReport?.reporterId)}
            >
              <MessageSquare className="h-4 w-4 shrink-0" />
              <span>
                Message reporter: <strong>{currentReport?.reporterName ?? 'Reporter'}</strong>
              </span>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="justify-start gap-3 border-pink-200 bg-pink-50/80 text-left hover:bg-pink-100"
              disabled={messageBusy}
              onClick={() => void openThreadWith(currentReport?.reportedId)}
            >
              <MessageSquare className="h-4 w-4 shrink-0" />
              <span>
                Message reported user: <strong>{currentReport?.reportedName ?? 'Member'}</strong>
              </span>
            </Button>
          </div>
          <DialogFooter className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setMessageOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Suspend {suspendParty === 'reported' ? 'reported member' : 'reporter'}
            </DialogTitle>
            <DialogDescription>
              They will be blocked from dating features and receive an in-app notification. You can reinstate them later
              from this report view.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
            placeholder="Reason shown to the member (required for your records)…"
            rows={4}
            className="resize-none"
          />
          <DialogFooter className="flex flex-row flex-wrap justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setSuspendOpen(false)} disabled={suspendBusy}>
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-red-600 hover:bg-red-700"
              disabled={suspendBusy}
              onClick={() => void submitSuspend()}
            >
              {suspendBusy ? 'Suspending…' : 'Confirm suspension'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
