import { apiGet, apiPatch, apiPost } from '@/lib/api';
import type { Chat, Message, PendingFemaleMediaItem, Report } from '@/types';

export async function fetchModeratorReports(): Promise<Report[]> {
  const data = await apiGet<{ reports: Report[] }>('/moderator/reports');
  return data.reports ?? [];
}

export type ReportTranscriptMessage = Message & { senderName: string };

export type ReportTranscript = {
  chatId: string;
  messages: ReportTranscriptMessage[];
  participants: { id: string; name?: string; profilePicture?: string }[];
};

export async function fetchReportTranscript(
  reportId: string
): Promise<{ transcript: ReportTranscript | null; reason?: string }> {
  return apiGet(`/moderator/reports/${reportId}/transcript`);
}

export async function openModeratorSupportThread(
  reportId: string,
  targetUserId: string
): Promise<Chat> {
  const data = await apiPost<{ chat: Chat }>(`/moderator/reports/${reportId}/support-thread`, {
    targetUserId,
  });
  return data.chat;
}

export async function patchModeratorReport(
  reportId: string,
  body: { status: Report['status']; resolution?: string }
): Promise<Report> {
  const data = await apiPatch<{ report: Report }>(`/moderator/reports/${reportId}`, body);
  return data.report;
}

export async function suspendModeratorMember(
  userId: string,
  body: { reason?: string; reportId?: string }
): Promise<{ ok: boolean }> {
  return apiPost(`/moderator/members/${userId}/suspend`, body);
}

export async function unsuspendModeratorMember(userId: string): Promise<{ ok: boolean }> {
  return apiPost(`/moderator/members/${userId}/unsuspend`, {});
}

export async function fetchPendingFemaleContent(): Promise<PendingFemaleMediaItem[]> {
  const data = await apiGet<{ items: PendingFemaleMediaItem[] }>('/moderator/content');
  return data.items ?? [];
}

export {
  fetchModeratorStats,
  fetchModeratorVerifications,
  type ModeratorStats,
} from '@/lib/verification';

export async function reviewFemaleMedia(body: {
  userId: string;
  mediaKind: 'photo' | 'video';
  mediaId: string;
  decision: 'approved' | 'rejected';
  rejectionReason?: string;
}): Promise<{ ok: boolean }> {
  return apiPost('/moderator/content/review', body);
}
