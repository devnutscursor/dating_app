import { apiGet, apiPatch, apiPost } from '@/lib/api';
import type { ReportTranscript } from '@/lib/moderator';
import type { Report } from '@/types';

export async function fetchAdminReports(): Promise<Report[]> {
  const data = await apiGet<{ reports: Report[] }>('/admin/reports');
  return data.reports ?? [];
}

export async function patchAdminReport(
  reportId: string,
  body: { status: Report['status']; resolution?: string }
): Promise<Report> {
  const data = await apiPatch<{ report: Report }>(`/admin/reports/${reportId}`, body);
  return data.report;
}

export async function fetchAdminReportTranscript(
  reportId: string
): Promise<{ transcript: ReportTranscript | null; reason?: string }> {
  return apiGet(`/admin/reports/${reportId}/transcript`);
}

export async function suspendAdminMember(
  userId: string,
  body: { reason?: string; reportId?: string }
): Promise<{ ok: boolean }> {
  return apiPost(`/admin/members/${userId}/suspend`, body);
}

export async function unsuspendAdminMember(userId: string): Promise<{ ok: boolean }> {
  return apiPost(`/admin/members/${userId}/unsuspend`, {});
}
