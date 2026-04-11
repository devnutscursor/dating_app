import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Image, Flag, CreditCard, 
  DollarSign, Settings, LogOut, X 
} from 'lucide-react';

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
  const location = useLocation();

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <div className="w-64 h-full bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <Link to="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg">Admin</span>
            <span className="text-xs text-gray-400 block">Panel</span>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1 hover:bg-gray-800 rounded">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-auto">
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

      {/* Logout */}
      <div className="p-4 border-t border-gray-800">
        <Link 
          to="/login"
          className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Log out</span>
        </Link>
      </div>
    </div>
  );
}
