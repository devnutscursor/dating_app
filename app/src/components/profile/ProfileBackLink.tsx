import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { resolveProfileReturnTo } from '@/lib/profileNavigation';

type ProfileBackLinkProps = {
  area: 'man' | 'woman';
  className?: string;
};

export default function ProfileBackLink({ area, className }: ProfileBackLinkProps) {
  const location = useLocation();
  const to = resolveProfileReturnTo(area, location.state);

  return (
    <Link
      to={to}
      className={className ?? 'inline-flex items-center gap-2 text-gray-600 hover:text-gray-900'}
    >
      <ArrowLeft className="h-5 w-5" />
      Go back
    </Link>
  );
}
