import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Image, Flag, CreditCard, 
  DollarSign, Settings, LogOut, X 
} from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import { useAuth } from '@/contexts/AuthContext';

interface AdminSidebarProps {
  onClose?: () => void;
}

const adminNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
  { id: 'users', label: 'Users', icon: Users, href: '/admin/users' },
  { id: 'content', label: 'Content', icon: Image, href: '/admin/content' },
  { id: 'reports', label: 'Reports', icon: Flag, href: '/admin/reports' },
  { id: 'transactions', label: 'Transactions', icon: CreditCard, href: '/admin/transactions' },
  { id: 'payouts', label: 'Payouts', icon: DollarSign, href: '/admin/payouts' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/admin/settings' },
];

export default function AdminSidebar({ onClose }: AdminSidebarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <div className="flex h-full min-h-0 w-72 max-w-[85vw] flex-col bg-gray-900 text-white">
      {/* Logo */}
      <div className="relative shrink-0 border-b border-gray-800 p-4">
        <Link to="/admin" className="flex min-w-0 flex-col gap-3">
          <BrandLogo size="sm" tone="light" className="shrink-0" />
          <span className="min-w-0 text-lg font-semibold text-white">Admin Panel</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="absolute right-4 top-4 rounded p-1 hover:bg-gray-800 lg:hidden">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation — scrolls; logout stays pinned below */}
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-4">
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.id}
              to={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                active 
                  ? 'bg-green-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout — pinned to bottom of sidebar */}
      <div className="shrink-0 border-t border-gray-800 bg-gray-900 p-4">
        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Log out</span>
        </button>
      </div>
    </div>
  );
}
