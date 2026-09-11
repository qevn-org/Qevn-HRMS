'use client';

import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { CommandBar } from './CommandBar';
import { NotificationDrawer } from './NotificationDrawer';
import { QuickActionModal } from './QuickActionModal';
import { Toaster } from 'sonner';

export function MaximalistShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF7EE] text-black flex flex-col font-sans selection:bg-[#00D06C] selection:text-black">
      {/* Global Toaster with retro editorial neo-brutalist styling */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#FFFFFF',
            border: '3px solid #000000',
            color: '#000000',
            fontFamily: 'ui-monospace, monospace',
            fontWeight: '900',
            borderRadius: '0px',
            boxShadow: '6px 6px 0px 0px #000000',
          },
        }}
      />

      {/* Top Header */}
      <Header
        onOpenCommandBar={() => setIsCommandBarOpen(true)}
        onOpenQuickAction={() => setIsQuickActionOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenNotifications={() => setIsNotificationOpen(true)}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Content Viewport on Graph Paper Notebook Grid Canvas */}
        <main className="flex-1 min-w-0 bg-notebook-grid p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Interactive Overlays */}
      <CommandBar
        isOpen={isCommandBarOpen}
        onClose={() => setIsCommandBarOpen(false)}
      />

      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />

      <QuickActionModal
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
      />
    </div>
  );
}
