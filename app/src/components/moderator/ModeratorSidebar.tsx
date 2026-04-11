import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Image, Flag, UserCheck, LogOut, X 
} from 'lucide-react';

interface ModeratorSidebarProps {
  onClose?: () => void;
}

const moderatorNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/moderator/dashboard' },
  { id: 'content', label: 'Content Review', icon: Image, href: '/moderator/content' },
  { id: 'reports', label: 'Reports', icon: Flag, href: '/moderator/reports' },
  { id: 'verifications', label: 'Verifications', icon: UserCheck, href: '/moderator/verifications' },
];

export default function ModeratorSidebar({ onClose }: ModeratorSidebarProps) {
  const location = useLocation();

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <div className="w-64 h-full bg-blue-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-blue-800 flex items-center justify-between">
        <Link to="/moderator" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg">Moderator</span>
            <span className="text-xs text-blue-300 block">Panel</span>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1 hover:bg-blue-800 rounded">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-auto">
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
              {item.id === 'content' && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  5
                </span>
              )}
              {item.id === 'reports' && (
                <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                  3
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-blue-800">
        <Link 
          to="/login"
          className="flex items-center gap-3 px-3 py-2.5 text-blue-100 hover:bg-blue-800 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Log out</span>
        </Link>
      </div>
    </div>
  );
}
