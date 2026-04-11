import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ActivityPanel from '@/components/ActivityPanel';
import SupportChat from '@/components/SupportChat';

export default function WomanLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <Sidebar userType="woman" />
      </div>

      {/* Sidebar - Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar userType="woman" onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          userType="woman" 
          onMenuClick={() => setSidebarOpen(true)}
          onActivityClick={() => setActivityOpen(!activityOpen)}
        />
        
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content Area */}
          <main className="flex-1 overflow-auto p-4 lg:p-6">
            <Outlet />
          </main>

          {/* Activity Panel - Desktop */}
          {activityOpen && (
            <div className="hidden xl:block w-80 border-l border-gray-200 bg-white overflow-auto">
              <ActivityPanel />
            </div>
          )}
        </div>
      </div>

      {/* Support Chat */}
      <SupportChat />
    </div>
  );
}
