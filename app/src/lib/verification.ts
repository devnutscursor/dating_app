import { apiGet, apiPatch, apiPost } from '@/lib/api';

export type VerificationRequestItem = {
  id: string;
  userId?: string;
  userDisplayName?: string;
  profilePhotoUrl?: string;
  videoUrl?: string;
  challengeNumbers?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt?: string;
};

export type MyVerificationState = {
  isVerified?: boolean;
  status: 'none' | 'pending' | 'approved' | 'rejected';
  request?: VerificationRequestItem;
  lastRequest?: VerificationRequestItem | null;
};

export async function fetchMyVerification(): Promise<MyVerificationState> {
  return apiGet<MyVerificationState>('/users/me/verification');
}

export async function createVerificationChallenge(): Promise<{
  challengeNumbers: string;
  requestId: string;
}> {
  return apiPost('/users/me/verification/challenge', {});
}

export async function submitVerificationVideo(body: {
  videoUrl: string;
  requestId?: string;
}): Promise<{ ok: boolean }> {
  return apiPost('/users/me/verification', body);
}

export async function fetchModeratorVerifications(): Promise<VerificationRequestItem[]> {
  const data = await apiGet<{ verifications: VerificationRequestItem[] }>('/moderator/verifications');
  return data.verifications ?? [];
}

export async function reviewModeratorVerification(
  id: string,
  decision: 'approved' | 'rejected'
): Promise<void> {
  await apiPatch(`/moderator/verifications/${id}`, { decision });
}

export type ModeratorStats = {
  pendingContent: number;
  pendingReports: number;
  pendingVerifications: number;
  resolvedToday: number;
  recentActivity: {
    type: 'content' | 'report' | 'verification';
    action: string;
    user: string;
    at: string;
  }[];
};

export async function fetchModeratorStats(): Promise<ModeratorStats> {
  return apiGet<ModeratorStats>('/moderator/stats');
}
