import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  House, User, Mail, Heart, ToggleLeft, Shield, Wallet, 
  LogOut, X, ChevronDown, ChevronUp 
} from 'lucide-react';
import { navigationItems } from '@/config/design';
import BrandLogo from '@/components/BrandLogo';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet } from '@/lib/api';
import { subscribeChatUpdate } from '@/lib/chatSocket';
import type { Chat } from '@/types';

interface SidebarProps {
  userType: 'man' | 'woman';
  onClose?: () => void;
}

export default function Sidebar({ userType, onClose }: SidebarProps) {
  const { user: sessionUser, logout } = useAuth();
  const location = useLocation();
  const [faqOpen, setFaqOpen] = useState(false);
  const [chatsUnreadTotal, setChatsUnreadTotal] = useState<number | null>(null);

  useEffect(() => {
    if (!sessionUser) {
      setChatsUnreadTotal(null);
      return;
    }
    let cancelled = false;
    void apiGet<{ chats: Chat[] }>('/chats')
      .then((data) => {
        if (cancelled) return;
        const total = (data.chats ?? []).reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);
        setChatsUnreadTotal(total);
      })
      .catch(() => {
        if (!cancelled) setChatsUnreadTotal(null);
      });
    return () => {
      cancelled = true;
    };
  }, [sessionUser, location.pathname]);

  useEffect(() => {
    if (!sessionUser) return;
    let debounce: ReturnType<typeof setTimeout> | undefined;
    const unsub = subscribeChatUpdate(() => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        void apiGet<{ chats: Chat[] }>('/chats')
          .then((data) => {
            const total = (data.chats ?? []).reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);
            setChatsUnreadTotal(total);
          })
          .catch(() => setChatsUnreadTotal(null));
      }, 120);
    });
    return () => {
      clearTimeout(debounce);
      unsub();
    };
  }, [sessionUser]);
  
  const navItems = navigationItems[userType];
  const basePath = `/${userType}`;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Home': return <House className="w-5 h-5" />;
      case 'User': return <User className="w-5 h-5" />;
      case 'Mail': return <Mail className="w-5 h-5" />;
      case 'Heart': return <Heart className="w-5 h-5" />;
      case 'ToggleLeft': return <ToggleLeft className="w-5 h-5" />;
      case 'Shield': return <Shield className="w-5 h-5" />;
      case 'Wallet': return <Wallet className="w-5 h-5" />;
      default: return <User className="w-5 h-5" />;
    }
  };

  const isActive = (href: string) => {
    return location.pathname.startsWith(href);
  };

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <Link to="/" className="inline-flex">
          <BrandLogo size="sm" tone="dark" />
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-gray-200">
        <Link
          to={`${basePath}/profile`}
          className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
        >
          <div className="relative shrink-0">
            <img
              src={sessionUser?.profilePicture || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200'}
              alt={sessionUser?.name || 'Profile'}
              className="h-12 w-12 rounded-full object-cover"
            />
            {sessionUser?.isOnline && (
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
            )}
          </div>
          <p className="min-w-0 truncate font-medium text-gray-900">{sessionUser?.name ?? 'Member'}</p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-auto">
        {navItems.map((item) => {
          const href = item.href;
          const active = isActive(href);
          
          if (item.id === 'faq') {
            return (
              <div key={item.id}>
                <button
                  onClick={() => setFaqOpen(!faqOpen)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    active ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getIcon(item.icon)}
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {faqOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {faqOpen && (
                  <div className="ml-8 mt-1 space-y-1">
                    <Link to={`${basePath}/faq`} className="block px-3 py-2 text-sm text-gray-600 hover:text-green-600 rounded-lg">
                      FAQ
                    </Link>
                    <Link to="/terms" className="block px-3 py-2 text-sm text-gray-600 hover:text-green-600 rounded-lg">
                      Terms
                    </Link>
                    <Link to="/privacy" className="block px-3 py-2 text-sm text-gray-600 hover:text-green-600 rounded-lg">
                      Privacy
                    </Link>
                    <Link to="/rules" className="block px-3 py-2 text-sm text-gray-600 hover:text-green-600 rounded-lg">
                      Rules
                    </Link>
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.id}
              to={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                active 
                  ? 'bg-green-50 text-green-600' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {getIcon(item.icon)}
              <span className="font-medium">{item.label}</span>
              {item.id === 'chats' && chatsUnreadTotal != null && chatsUnreadTotal > 0 && (
                <span className="ml-auto rounded-full bg-green-500 px-2 py-0.5 text-xs font-medium text-white">
                  {chatsUnreadTotal > 99 ? '99+' : chatsUnreadTotal}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => {
            logout();
            window.location.href = '/login';
          }}
          className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Log out</span>
        </button>
      </div>
    </div>
  );
}
