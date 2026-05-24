import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { resolveProfileReturnTo } from '@/lib/profileNavigation';

type ProfileBackLinkProps = {
  area: 'man' | 'woman';
  className?: string;
};

export default function ProfileBackLink({ area, className }: ProfileBackLinkProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const fallback = resolveProfileReturnTo(area, location.state);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(fallback, { replace: true });
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={
        className ??
        'inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors'
      }
    >
      <ArrowLeft className="h-5 w-5" />
      Go back
    </button>
  );
}
