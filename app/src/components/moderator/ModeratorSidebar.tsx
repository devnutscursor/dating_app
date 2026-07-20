import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Image, Flag, UserCheck, LogOut, X, MessageCircle 
} from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet } from '@/lib/api';
import { fetchModeratorSupportChats, fetchModeratorVerifications, fetchPendingFemaleContent } from '@/lib/moderator';
import type { Report } from '@/types';

interface ModeratorSidebarProps {
  onClose?: () => void;
}

const moderatorNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/moderator/dashboard' },
  { id: 'content', label: 'Content Review', icon: Image, href: '/moderator/content' },
  { id: 'reports', label: 'Reports', icon: Flag, href: '/moderator/reports' },
  { id: 'chats', label: 'Support Chats', icon: MessageCircle, href: '/moderator/chats' },
  { id: 'verifications', label: 'Verifications', icon: UserCheck, href: '/moderator/verifications' },
];

export default function ModeratorSidebar({ onClose }: ModeratorSidebarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingReportCount, setPendingReportCount] = useState<number | null>(null);
  const [pendingContentCount, setPendingContentCount] = useState<number | null>(null);
  const [pendingVerificationCount, setPendingVerificationCount] = useState<number | null>(null);
  const [unreadSupportCount, setUnreadSupportCount] = useState<number | null>(null);

  useEffect(() => {
    if (!location.pathname.startsWith('/moderator')) return;
    void apiGet<{ reports: Report[] }>('/moderator/reports')
      .then((d) => {
        const n = (d.reports ?? []).filter((r) => r.status === 'pending' || r.status === 'reviewing').length;
        setPendingReportCount(n);
      })
      .catch(() => setPendingReportCount(null));
    void fetchPendingFemaleContent()
      .then((items) => setPendingContentCount(items.length))
      .catch(() => setPendingContentCount(null));
    void fetchModeratorVerifications()
      .then((items) => setPendingVerificationCount(items.length))
      .catch(() => setPendingVerificationCount(null));
    void fetchModeratorSupportChats()
      .then((rows) => setUnreadSupportCount(rows.filter((c) => c.unreadCount > 0).length))
      .catch(() => setUnreadSupportCount(null));
  }, [location.pathname]);

  const isActive = (href: string) => {
    if (href === '/moderator/chats') {
      return location.pathname === href || location.pathname.startsWith('/moderator/support/');
    }
    return location.pathname === href;
  };

  return (
    <div className="flex h-full min-h-0 w-72 max-w-[85vw] flex-col bg-blue-900 text-white">
      {/* Logo */}
      <div className="relative shrink-0 border-b border-blue-800 p-4">
        <Link to="/moderator" className="flex min-w-0 flex-col gap-3">
          <BrandLogo size="sm" tone="light" className="shrink-0" />
          <span className="min-w-0 text-lg font-semibold text-white">Moderator Panel</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="absolute right-4 top-4 rounded p-1 hover:bg-blue-800 lg:hidden">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation — scrolls; logout stays pinned below */}
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-4">
        {moderatorNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.id}
              to={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                active 
                  ? 'bg-blue-600 text-white' 
                  : 'text-blue-100 hover:bg-blue-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {item.id === 'content' && pendingContentCount != null && pendingContentCount > 0 && (
                <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                  {pendingContentCount > 99 ? '99+' : pendingContentCount}
                </span>
              )}
              {item.id === 'reports' && pendingReportCount != null && pendingReportCount > 0 && (
                <span className="ml-auto rounded-full bg-orange-500 px-2 py-0.5 text-xs text-white">
                  {pendingReportCount > 99 ? '99+' : pendingReportCount}
                </span>
              )}
              {item.id === 'chats' && unreadSupportCount != null && unreadSupportCount > 0 && (
                <span className="ml-auto rounded-full bg-amber-500 px-2 py-0.5 text-xs text-white">
                  {unreadSupportCount > 99 ? '99+' : unreadSupportCount}
                </span>
              )}
              {item.id === 'verifications' &&
                pendingVerificationCount != null &&
                pendingVerificationCount > 0 && (
                  <span className="ml-auto rounded-full bg-blue-500 px-2 py-0.5 text-xs text-white">
                    {pendingVerificationCount > 99 ? '99+' : pendingVerificationCount}
                  </span>
                )}
            </Link>
          );
        })}
      </nav>

      {/* Logout — pinned to bottom of sidebar */}
      <div className="shrink-0 border-t border-blue-800 bg-blue-900 p-4">
        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-blue-100 hover:bg-blue-800 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Log out</span>
        </button>
      </div>
    </div>
  );
}
