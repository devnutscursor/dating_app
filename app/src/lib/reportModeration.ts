import type { Report } from '@/types';

export const REPORT_TYPE_LABELS: Record<Report['type'], string> = {
  financial: 'Financial Dispute',
  profile: 'Profile Mismatch',
  harassment: 'Harassment/Spam',
};

export interface ReportPlaybook {
  title: string;
  steps: string[];
  reportedPresets: { label: string; reason: string }[];
  reporterPresets: { label: string; reason: string }[];
}

export function getReportPlaybook(type: Report['type']): ReportPlaybook {
  switch (type) {
    case 'financial':
      return {
        title: 'Financial dispute playbook',
        steps: [
          'Review the chat transcript for payment requests, off-platform contact details, or pressure to send gifts or money.',
          'Use “Message” to request evidence from either party only inside the app — never share personal contact.',
          'If the reported member solicited money or acted fraudulently, suspend their account and resolve the report with a short internal note.',
          'Escalate repeat offenders or high-impact cases so a senior admin can coordinate any further steps.',
        ],
        reportedPresets: [
          {
            label: 'Scam / solicitation',
            reason:
              'Account suspended: soliciting money or fraudulent payment behavior (financial dispute report).',
          },
          {
            label: 'Coercion / pressure',
            reason:
              'Account suspended: coercive or harassing behavior related to payments or gifts (financial dispute report).',
          },
        ],
        reporterPresets: [
          {
            label: 'Bad-faith reporter',
            reason: 'Account suspended: abusive or false financial reports after review.',
          },
        ],
      };
    case 'profile':
      return {
        title: 'Profile mismatch playbook',
        steps: [
          'Compare the reporter’s description with the transcript and the member’s profile (age, photos, intent).',
          'If identity is unclear, ask for clarification via the moderation chat before taking strong action.',
          'For impersonation or serious misrepresentation, suspend the reported account and require verification on reinstatement.',
          'If the report is mistaken or minor, dismiss with guidance or ask the member to update their profile.',
        ],
        reportedPresets: [
          {
            label: 'Impersonation / fake profile',
            reason: 'Account suspended: serious profile misrepresentation or impersonation (profile mismatch report).',
          },
          {
            label: 'Material false claims',
            reason:
              'Account suspended: repeated false or misleading profile claims verified against chat behavior.',
          },
        ],
        reporterPresets: [
          {
            label: 'Abusive reporting',
            reason: 'Account suspended: pattern of false or harassing profile reports.',
          },
        ],
      };
    case 'harassment':
    default:
      return {
        title: 'Harassment / spam playbook',
        steps: [
          'Read the full transcript in context; note threats, slurs, sexual harassment, stalking, or spam patterns.',
          'Message the reporter if you need more detail; offer safety-focused language in your resolution note when appropriate.',
          'For clear ToS violations, suspend the reported user; for severe cases, escalate for senior review.',
          'If behavior is borderline, issue a warning via resolution text and monitor for repeat reports.',
        ],
        reportedPresets: [
          {
            label: 'Harassment / abuse',
            reason: 'Account suspended: harassment or abusive behavior (harassment/spam report).',
          },
          {
            label: 'Spam / malicious links',
            reason: 'Account suspended: spam, scams, or malicious links in chat (harassment/spam report).',
          },
        ],
        reporterPresets: [
          {
            label: 'Reporter harassment',
            reason: 'Account suspended: harassing another member or misusing the report system.',
          },
        ],
      };
  }
}
