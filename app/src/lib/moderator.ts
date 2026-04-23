import { apiGet, apiPatch } from '@/lib/api';
import type { Report } from '@/types';

export async function fetchModeratorReports(): Promise<Report[]> {
  const data = await apiGet<{ reports: Report[] }>('/moderator/reports');
  return data.reports ?? [];
}

export async function patchModeratorReport(
  reportId: string,
  body: { status: Report['status']; resolution?: string }
): Promise<Report> {
  const data = await apiPatch<{ report: Report }>(`/moderator/reports/${reportId}`, body);
  return data.report;
}
