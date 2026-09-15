import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopCommandBar } from './TopCommandBar';
import { EditProfileModal } from '../ui/EditProfileModal';

interface AcademicLayoutProps {
  children: React.ReactNode;
  onOpenCreateModal?: () => void;
}

export const AcademicLayout: React.FC<AcademicLayoutProps> = ({ children, onOpenCreateModal }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenCreateModal={onOpenCreateModal}
      />

      {/* Main Content Workspace Container (Pushed right on desktop for 64w Sidebar) */}
      <div className="lg:pl-64 flex-1 flex flex-col min-h-screen">
        
        {/* Top Command Bar */}
        <TopCommandBar
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
        />

        {/* Workspace Main Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>

        {/* Workspace Footer */}
        <footer className="border-t border-slate-200/80 bg-white py-4 px-6 text-center text-xs text-slate-500 font-medium">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>© 2026 NTTU EduHub — Hệ thống Quản lý Học liệu số Trường Đại học</span>
            <span className="text-[11px] text-slate-400">Thiết kế & phát triển phục vụ đồ án tốt nghiệp chính quy</span>
          </div>
        </footer>
      </div>

      {/* Profile Edit Modal */}
      <EditProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
};
