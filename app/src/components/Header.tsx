import { useEffect, useState, type KeyboardEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, Bell, Search, Coins, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { layoutTopBarRowClass } from '@/config/design';
import { useAuth } from '@/contexts/AuthContext';
import NotificationsModal from '@/components/modals/NotificationsModal';
import SearchFilterModal from '@/components/modals/SearchFilterModal';
import { fetchNotificationUnreadCount } from '@/lib/notifications';
import { subscribeNotificationNew } from '@/lib/chatSocket';
import { useSearchFilters } from '@/contexts/SearchFiltersContext';
import { profileReturnState } from '@/lib/profileNavigation';
import { resolveSearchQuery } from '@/lib/resolveSearchQuery';
import ProfileAvatar from '@/components/profile/ProfileAvatar';
import { needsVideoVerification } from '@/lib/memberVerification';
import { toast } from 'sonner';

interface HeaderProps {
  userType: 'man' | 'woman';
  onMenuClick: () => void;
  onActivityClick: () => void;
}

export default function Header({ userType, onMenuClick, onActivityClick }: HeaderProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { userIdSearch, applyFilters, filters, filterModalOpen, setFilterModalOpen } =
    useSearchFilters();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [idQuery, setIdQuery] = useState(userIdSearch);
  const [unreadCount, setUnreadCount] = useState(0);
  const coins = user?.coins ?? 0;
  const notificationsLocked = userType === 'woman' && needsVideoVerification(user);

  useEffect(() => {
    if (!user || user.role === 'moderator' || user.role === 'admin' || notificationsLocked) {
      setUnreadCount(0);
      return;
    }
    let cancelled = false;
    const loadCount = async () => {
      try {
        const n = await fetchNotificationUnreadCount();
        if (!cancelled) setUnreadCount(n);
      } catch {
        if (!cancelled) setUnreadCount(0);
      }
    };
    void loadCount();
    const unsub = subscribeNotificationNew(() => {
      void loadCount();
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, [user, notificationsLocked]);

  useEffect(() => {
    setIdQuery(userIdSearch);
  }, [userIdSearch]);

  const submitIdSearch = () => {
    const trimmed = idQuery.trim();
    if (!trimmed) return;

    const resolved = resolveSearchQuery(trimmed);
    if (!resolved) {
      toast.error('Enter a valid user ID or country name');
      return;
    }

    if (resolved.type === 'country') {
      applyFilters({ ...filters, country: resolved.value }, '');
      if (!location.pathname.endsWith('/home')) {
        navigate(`/${userType}/home`);
      }
      toast.success('Country filter applied');
      return;
    }

    applyFilters(filters, resolved.value);
    navigate(
      `/${userType}/view-profile/${resolved.value}`,
      profileReturnState(location.pathname + location.search)
    );
  };

  const onIdKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submitIdSearch();
  };

  return (
    <>
      <header className={layoutTopBarRowClass}>
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          {/* Search Bar - Desktop */}
          <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2 w-80">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={idQuery}
              onChange={(e) => setIdQuery(e.target.value)}
              onKeyDown={onIdKeyDown}
              placeholder="Search by ID or country"
              className="flex-1 border-none bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Activity Toggle - Desktop */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden xl:flex"
            onClick={onActivityClick}
          >
            <Activity className="w-5 h-5" />
          </Button>

          {/* Search Button - Mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setFilterModalOpen(true)}
          >
            <Search className="w-5 h-5" />
          </Button>

          {/* Search Filter Button - Desktop */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex"
            onClick={() => setFilterModalOpen(true)}
          >
            <Search className="w-5 h-5" />
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => {
              if (notificationsLocked) {
                toast.info(
                  'Only after completing video verification will you be able to receive notifications and send messages.'
                );
                navigate('/woman/profile/verify');
                return;
              }
              setNotificationsOpen(true);
            }}
          >
            <Bell className="w-5 h-5" />
            {!notificationsLocked && unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-2 min-w-2 rounded-full bg-red-500 px-0.5" />
            )}
          </Button>

          {/* Coins Balance */}
          <Link to={`/${userType}/wallet`}>
            <Button
              variant="outline"
              className="flex items-center gap-2 border-green-500 text-green-600 hover:bg-green-50"
            >
              <Coins className="w-4 h-4" />
              <span className="font-medium">{coins}</span>
            </Button>
          </Link>

          {/* Profile - Mobile */}
          <Link to={`/${userType}/profile`} className="lg:hidden">
            <ProfileAvatar
              src={user?.profilePicture}
              name={user?.name}
              gender={user?.gender}
              role={user?.role}
              className="h-8 w-8 rounded-full"
            />
          </Link>
        </div>
      </header>

      {/* Modals */}
      <NotificationsModal
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onListChange={() => {
          void (async () => {
            try {
              setUnreadCount(await fetchNotificationUnreadCount());
            } catch {
              setUnreadCount(0);
            }
          })();
        }}
      />
      <SearchFilterModal
        open={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        userType={userType}
      />
    </>
  );
}
