import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Bell, Search, Coins, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { layoutTopBarRowClass } from '@/config/design';
import { useAuth } from '@/contexts/AuthContext';
import NotificationsModal from '@/components/modals/NotificationsModal';
import SearchFilterModal from '@/components/modals/SearchFilterModal';

interface HeaderProps {
  userType: 'man' | 'woman';
  onMenuClick: () => void;
  onActivityClick: () => void;
}

export default function Header({ userType, onMenuClick, onActivityClick }: HeaderProps) {
  const { user } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const coins = user?.coins ?? 0;
  const avatar = user?.profilePicture || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200';
  const name = user?.name ?? 'Member';

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
              placeholder="Search by ID"
              className="bg-transparent border-none outline-none text-sm flex-1"
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
            onClick={() => setSearchOpen(true)}
          >
            <Search className="w-5 h-5" />
          </Button>

          {/* Search Filter Button - Desktop */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="w-5 h-5" />
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setNotificationsOpen(true)}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
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
            <img src={avatar} alt={name} className="w-8 h-8 rounded-full object-cover" />
          </Link>
        </div>
      </header>

      {/* Modals */}
      <NotificationsModal 
        open={notificationsOpen} 
        onClose={() => setNotificationsOpen(false)} 
      />
      <SearchFilterModal 
        open={searchOpen} 
        onClose={() => setSearchOpen(false)} 
      />
    </>
  );
}
