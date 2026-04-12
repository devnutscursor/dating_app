import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  House, User, Mail, Heart, ToggleLeft, Shield, Wallet, 
  LogOut, X, ChevronDown, ChevronUp 
} from 'lucide-react';
import { navigationItems } from '@/config/design';
import { currentUser } from '@/data/mockData';
import BrandLogo from '@/components/BrandLogo';

interface SidebarProps {
  userType: 'man' | 'woman';
  onClose?: () => void;
}

export default function Sidebar({ userType, onClose }: SidebarProps) {
  const location = useLocation();
  const [faqOpen, setFaqOpen] = useState(false);
  
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
        <Link to={`${basePath}/profile`} className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors">
          <div className="relative">
            <img 
              src={currentUser.profilePicture} 
              alt={currentUser.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{currentUser.name}</p>
            <p className="text-sm text-gray-500">ID: {currentUser.id}</p>
          </div>
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
              {item.id === 'chats' && (
                <span className="ml-auto bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                  2
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <Link 
          to="/login"
          className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Log out</span>
        </Link>
      </div>
    </div>
  );
}
