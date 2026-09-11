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
    <div className="min-h-screen bg-[#09090D] text-white flex flex-col font-sans selection:bg-[#CCFF00] selection:text-black">
      {/* Global Toaster with maximalist neo-brutalist styling */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#121218',
            border: '2px solid #CCFF00',
            color: '#FFFFFF',
            fontFamily: 'ui-monospace, monospace',
            fontWeight: 'bold',
            borderRadius: '0px',
            boxShadow: '4px 4px 0px 0px #000000',
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

        {/* Content Viewport */}
        <main className="flex-1 min-w-0 bg-[#09090D] bg-grid-pattern p-4 sm:p-6 lg:p-8 overflow-x-hidden">
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
