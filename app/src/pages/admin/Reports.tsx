import { useCallback, useEffect, useMemo, useState } from 'react';
import { Flag, Check, X, AlertTriangle, MessageSquare, UserX } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  fetchAdminReports,
  patchAdminReport,
  fetchAdminReportTranscript,
  suspendAdminMember,
  unsuspendAdminMember,
} from '@/lib/adminReports';
import type { ReportTranscriptMessage } from '@/lib/moderator';
import { formatRelativeTime } from '@/lib/formatRelativeTime';
import { getReportPlaybook, REPORT_TYPE_LABELS } from '@/lib/reportModeration';
import type { Report } from '@/types';

const getTypeColor = (type: string) => {
  switch (type) {
    case 'financial':
      return 'bg-red-100 text-red-700';
    case 'profile':
      return 'bg-blue-100 text-blue-700';
    case 'harassment':
      return 'bg-amber-100 text-amber-800';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'reviewing':
      return 'bg-orange-100 text-orange-800';
    case 'resolved':
      return 'bg-green-100 text-green-800';
    case 'dismissed':
      return 'bg-gray-200 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

/** Tab key → API filter. “Escalated” uses backend status `reviewing`. */
function tabToFilter(tab: TabKey): Report['status'] | 'all' {
  switch (tab) {
    case 'all':
      return 'all';
    case 'pending':
      return 'pending';
    case 'escalated':
      return 'reviewing';
    case 'resolved':
      return 'resolved';
    case 'dismissed':
      return 'dismissed';
    default:
      return 'all';
  }
}

type TabKey = 'all' | 'pending' | 'escalated' | 'resolved' | 'dismissed';

type OutcomeIntent = 'resolved' | 'dismissed' | 'reviewing';

type SuspParty = 'reporter' | 'reported';

export default function AdminReports() {
  const [rows, setRows] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>('all');
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogReport, setDialogReport] = useState<Report | null>(null);
  const [dialogIntent, setDialogIntent] = useState<OutcomeIntent>('resolved');
  const [note, setNote] = useState('');

  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [transcriptReport, setTranscriptReport] = useState<Report | null>(null);
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [transcriptMessages, setTranscriptMessages] = useState<ReportTranscriptMessage[]>([]);

  const [suspendOpen, setSuspendOpen] = useState(false);
  const [suspendReport, setSuspendReport] = useState<Report | null>(null);
  const [suspendParty, setSuspendParty] = useState<SuspParty>('reported');
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendBusy, setSuspendBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchAdminReports();
      setRows(list);
    } catch {
      setRows([]);
      toast.error('Could not load reports');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const pendingCount = useMemo(() => rows.filter((r) => r.status === 'pending').length, [rows]);

  const filtered = useMemo(() => {
    const f = tabToFilter(tab);
    if (f === 'all') return rows;
    return rows.filter((r) => r.status === f);
  }, [rows, tab]);

  function openOutcome(r: Report, intent: OutcomeIntent) {
    setDialogReport(r);
    setDialogIntent(intent);
    setNote('');
    setDialogOpen(true);
  }

  async function submitOutcome() {
    if (!dialogReport) return;
    const statusMap: Record<OutcomeIntent, Report['status']> = {
      resolved: 'resolved',
      dismissed: 'dismissed',
      reviewing: 'reviewing',
    };
    const status = statusMap[dialogIntent];
    const resolution = note.trim() || undefined;
    setActionBusyId(dialogReport.id);
    try {
      await patchAdminReport(dialogReport.id, { status, resolution });
      toast.success(
        dialogIntent === 'resolved'
          ? 'Marked resolved'
          : dialogIntent === 'dismissed'
            ? 'Dismissed'
            : 'Escalated for senior review'
      );
      setDialogOpen(false);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setActionBusyId(null);
    }
  }

  async function openTranscript(report: Report) {
    setTranscriptReport(report);
    setTranscriptOpen(true);
    setTranscriptLoading(true);
    setTranscriptMessages([]);
    try {
      const data = await fetchAdminReportTranscript(report.id);
      setTranscriptMessages(data.transcript?.messages ?? []);
    } catch {
      toast.error('Could not load transcript');
      setTranscriptMessages([]);
    } finally {
      setTranscriptLoading(false);
    }
  }

  function promptSuspend(report: Report, party: SuspParty, preset?: string) {
    setSuspendReport(report);
    setSuspendParty(party);
    setSuspendReason(preset?.trim() || '');
    setSuspendOpen(true);
  }

  async function submitSuspend() {
    if (!suspendReport) return;
    const userId = suspendParty === 'reported' ? suspendReport.reportedId : suspendReport.reporterId;
    const reason = suspendReason.trim() || 'Terms of Service violation';
    setSuspendBusy(true);
    try {
      await suspendAdminMember(userId, { reason, reportId: suspendReport.id });
      toast.success(`${suspendParty === 'reported' ? 'Reported member' : 'Reporter'} suspended`);
      setSuspendOpen(false);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Suspend failed');
    } finally {
      setSuspendBusy(false);
    }
  }

  async function reinstateParty(report: Report, party: SuspParty) {
    const userId = party === 'reported' ? report.reportedId : report.reporterId;
    try {
      await unsuspendAdminMember(userId);
      toast.success('Account reinstated');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Reinstate failed');
    }
  }

  const tabButtons: { key: TabKey; label: string; hint?: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'escalated', label: 'Escalated', hint: 'Senior review queue' },
    { key: 'resolved', label: 'Resolved' },
    { key: 'dismissed', label: 'Dismissed' },
  ];

  if (loading) {
    return <div className="py-16 text-center text-gray-500">Loading reports…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500">Manage user reports — synced from moderation data</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-red-100 px-4 py-2 text-red-800">
          <Flag className="h-4 w-4 shrink-0" />
          <span className="font-medium">{pendingCount} pending</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabButtons.map((b) => (
          <button
            key={b.key}
            type="button"
            onClick={() => setTab(b.key)}
            title={b.hint}
            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
              tab === b.key ? 'bg-green-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {b.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="divide-y divide-gray-100">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No reports in this tab.</div>
          ) : (
            filtered.map((report) => {
              const iso = /^\d{4}-\d{2}-\d{2}$/.test(report.createdAt)
                ? `${report.createdAt}T12:00:00Z`
                : report.createdAt;
              let when = iso;
              try {
                when = formatRelativeTime(new Date(iso).toISOString());
              } catch {
                /* ignore */
              }
              const statusLabel =
                report.status === 'reviewing'
                  ? 'escalated'
                  : report.status === 'dismissed'
                    ? 'dismissed'
                    : report.status;
              const busy = actionBusyId === report.id;
              const canAct = report.status === 'pending' || report.status === 'reviewing';
              return (
                <div key={report.id} className="p-6 transition-colors hover:bg-gray-50">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getTypeColor(report.type)}`}>
                          {REPORT_TYPE_LABELS[report.type]}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(report.status)}`}
                        >
                          {statusLabel}
                        </span>
                        <span className="text-sm text-gray-400">{when}</span>
                      </div>
                      <h3 className="mb-2 font-semibold text-gray-900">{report.topic}</h3>
                      <p className="mb-3 line-clamp-3 text-sm text-gray-600">{report.comment}</p>
                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                        <div>
                          <span className="text-gray-500">Reported by: </span>
                          <span className="font-medium text-gray-900">
                            {report.reporterName ?? 'Unknown'}
                          </span>
                          {report.reporterIsSuspended ? (
                            <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-800">
                              Suspended
                            </span>
                          ) : null}
                        </div>
                        <div>
                          <span className="text-gray-500">Against: </span>
                          <span className="font-medium text-gray-900">
                            {report.reportedName ?? 'Unknown'}
                          </span>
                          {report.reportedIsSuspended ? (
                            <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-800">
                              Suspended
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <details className="mt-3 rounded-lg border border-amber-100 bg-amber-50/40 p-3 text-sm text-amber-950">
                        <summary className="cursor-pointer font-medium text-amber-900 outline-none">
                          Moderation playbook — {REPORT_TYPE_LABELS[report.type]}
                        </summary>
                        <ol className="mt-2 list-decimal space-y-1 pl-5 text-amber-950/95">
                          {getReportPlaybook(report.type).steps.map((step) => (
                            <li key={step}>{step}</li>
                          ))}
                        </ol>
                      </details>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 self-start sm:self-auto">
                      <button
                        type="button"
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                        title="View dating chat transcript"
                        onClick={() => void openTranscript(report)}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                            title="Suspend or reinstate members"
                          >
                            <UserX className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuItem
                            disabled={Boolean(report.reportedIsSuspended)}
                            onClick={() => promptSuspend(report, 'reported')}
                          >
                            Suspend reported user
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={Boolean(report.reporterIsSuspended)}
                            onClick={() => promptSuspend(report, 'reporter')}
                          >
                            Suspend reporter
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            disabled={!report.reportedIsSuspended}
                            onClick={() => void reinstateParty(report, 'reported')}
                          >
                            Reinstate reported user
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={!report.reporterIsSuspended}
                            onClick={() => void reinstateParty(report, 'reporter')}
                          >
                            Reinstate reporter
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button
                      size="sm"
                      type="button"
                      disabled={!canAct || busy}
                      className="gap-1 bg-green-500 hover:bg-green-600"
                      onClick={() => openOutcome(report, 'resolved')}
                    >
                      <Check className="h-4 w-4" />
                      Resolve
                    </Button>
                    <Button
                      size="sm"
                      type="button"
                      variant="outline"
                      className="gap-1 border-orange-300 text-orange-700 hover:bg-orange-50"
                      disabled={!canAct || busy || report.status === 'reviewing'}
                      onClick={() => openOutcome(report, 'reviewing')}
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Escalate
                    </Button>
                    <Button
                      size="sm"
                      type="button"
                      variant="outline"
                      className="gap-1 text-red-600 hover:bg-red-50"
                      disabled={!canAct || busy}
                      onClick={() => openOutcome(report, 'dismissed')}
                    >
                      <X className="h-4 w-4" />
                      Dismiss
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialogIntent === 'resolved' && 'Resolve report'}
              {dialogIntent === 'dismissed' && 'Dismiss report'}
              {dialogIntent === 'reviewing' && 'Escalate report'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialogIntent === 'reviewing'
                ? 'Both parties receive an in-app notice. Optional note appears with the escalation.'
                : 'Optional outcome detail is highlighted on a separate line in their notifications.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            rows={4}
            className="resize-none"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional note shown to parties…"
          />
          <AlertDialogFooter className="flex flex-row flex-wrap gap-3 sm:justify-end">
            <AlertDialogCancel type="button" disabled={Boolean(actionBusyId)}>
              Cancel
            </AlertDialogCancel>
            <Button
              type="button"
              disabled={Boolean(actionBusyId)}
              className={
                dialogIntent === 'dismissed'
                  ? 'bg-red-600 hover:bg-red-700'
                  : dialogIntent === 'reviewing'
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : 'bg-green-600 hover:bg-green-700'
              }
              onClick={() => void submitOutcome()}
            >
              Confirm
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={transcriptOpen} onOpenChange={setTranscriptOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Chat transcript</DialogTitle>
            <DialogDescription>
              Read-only messages between reporter and reported user for this report.
            </DialogDescription>
          </DialogHeader>
          {transcriptLoading ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : transcriptMessages.length === 0 ? (
            <p className="text-sm text-gray-600">
              No transcript available.{' '}
              {!transcriptReport?.relatedChatId
                ? 'This report may not have a linked chat.'
                : 'The thread may have been removed.'}
            </p>
          ) : (
            <div className="max-h-[50vh] space-y-2 overflow-y-auto rounded-lg border bg-gray-50 p-3 text-sm">
              {transcriptMessages.map((m) => {
                const isReporter =
                  transcriptReport != null && m.senderId === transcriptReport.reporterId;
                return (
                  <div
                    key={m.id}
                    className={`rounded-md border px-3 py-2 ${
                      isReporter ? 'border-l-4 border-l-blue-500 bg-white' : 'border-l-4 border-l-pink-500 bg-white'
                    }`}
                  >
                    <p className="text-xs text-gray-600">
                      {m.senderName}
                      {isReporter ? ' (reporter)' : ' (reported)'}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap">{m.content || `(${m.type})`}</p>
                  </div>
                );
              })}
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setTranscriptOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Suspend {suspendParty === 'reported' ? 'reported member' : 'reporter'}</DialogTitle>
            <DialogDescription>
              The member is blocked from dating features and notified in-app. You can reinstate them from the same row menu.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase text-gray-600">Suggested reasons (tap to paste)</p>
            <div className="flex flex-wrap gap-2">
              {suspendReport &&
                (
                  suspendParty === 'reported'
                    ? getReportPlaybook(suspendReport.type).reportedPresets
                    : getReportPlaybook(suspendReport.type).reporterPresets
                ).map((p) => (
                  <Button
                    key={p.label}
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => setSuspendReason(p.reason)}
                  >
                    {p.label}
                  </Button>
                ))}
            </div>
          </div>
          <Textarea
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
            rows={4}
            className="resize-none"
            placeholder="Reason shown to the member…"
          />
          <DialogFooter className="flex flex-row flex-wrap gap-3">
            <Button type="button" variant="outline" onClick={() => setSuspendOpen(false)} disabled={suspendBusy}>
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-red-600 hover:bg-red-700"
              disabled={suspendBusy}
              onClick={() => void submitSuspend()}
            >
              {suspendBusy ? 'Suspending…' : 'Suspend'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
