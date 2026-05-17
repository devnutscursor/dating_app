import { Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ActivityPanel from '@/components/ActivityPanel';
import SupportChat from '@/components/SupportChat';
import { SearchFiltersProvider } from '@/contexts/SearchFiltersContext';

export default function ManLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(true);
  const location = useLocation();
  const isChatDetailRoute = /\/man\/chats\/[^/]+/.test(location.pathname);

  return (
    <SearchFiltersProvider>
    <div className="flex h-[100dvh] min-h-0 overflow-hidden bg-gray-50">
      {/* Sidebar - Desktop */}
      <div className="hidden min-h-0 shrink-0 lg:block lg:h-full">
        <Sidebar userType="man" />
      </div>

      {/* Sidebar - Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar userType="man" onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Header 
          userType="man" 
          onMenuClick={() => setSidebarOpen(true)}
          onActivityClick={() => setActivityOpen(!activityOpen)}
        />
        
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* Main Content Area — chat fills height & scrolls internally; other pages scroll here */}
          <main
            className={cn(
              'flex min-h-0 flex-1 flex-col overflow-hidden',
              isChatDetailRoute ? 'p-0' : 'p-4 lg:p-6'
            )}
          >
            <div
              className={cn(
                'flex min-h-0 flex-1 flex-col',
                isChatDetailRoute ? 'overflow-hidden' : 'overflow-y-auto'
              )}
            >
              <Outlet />
            </div>
          </main>

          {/* Activity Panel - Desktop */}
          {activityOpen && (
            <div className="hidden min-h-0 w-80 overflow-y-auto border-l border-gray-200 bg-white xl:block">
              <ActivityPanel />
            </div>
          )}
        </div>
      </div>

      {/* Support Chat */}
      <SupportChat />
    </div>
    </SearchFiltersProvider>
  );
}
