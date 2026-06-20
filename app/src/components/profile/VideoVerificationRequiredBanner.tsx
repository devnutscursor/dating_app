import { Link } from 'react-router-dom';
import { BadgeCheck } from 'lucide-react';
import { VIDEO_VERIFICATION_REQUIRED_MESSAGE } from '@/lib/memberVerification';
import { cn } from '@/lib/utils';

type VideoVerificationRequiredBannerProps = {
  compact?: boolean;
  className?: string;
};

export default function VideoVerificationRequiredBanner({
  compact = false,
  className,
}: VideoVerificationRequiredBannerProps) {
  if (compact) {
    return (
      <div
        className={cn(
          'rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950',
          className
        )}
        role="status"
      >
        <p>{VIDEO_VERIFICATION_REQUIRED_MESSAGE}</p>
        <Link
          to="/woman/profile/verify"
          className="mt-2 inline-flex items-center gap-1.5 font-semibold text-amber-900 underline-offset-2 hover:underline"
        >
          <BadgeCheck className="h-4 w-4" aria-hidden />
          Complete video verification
        </Link>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950',
        className
      )}
      role="status"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500">
          <BadgeCheck className="h-5 w-5 text-white" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-amber-950">Video verification required</p>
          <p className="mt-1 leading-relaxed text-amber-900/90">{VIDEO_VERIFICATION_REQUIRED_MESSAGE}</p>
          <Link
            to="/woman/profile/verify"
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
          >
            Get verified
          </Link>
        </div>
      </div>
    </div>
  );
}
