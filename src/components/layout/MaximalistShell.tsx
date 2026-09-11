'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/lib/context/AuthContext';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { CommandBar } from './CommandBar';
import { NotificationDrawer } from './NotificationDrawer';
import { QuickActionModal } from './QuickActionModal';
import { Toaster } from 'sonner';
import { ShieldCheck, Sparkles, Loader2 } from 'lucide-react';

export function MaximalistShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7EE] bg-notebook-grid flex flex-col items-center justify-center p-6 text-black select-none">
        <div className="bg-white border-3 border-black shadow-neo-xl p-8 max-w-md w-full text-center space-y-5">
          <div className="flex justify-center">
            <Image
              src="/qevn-logo-black.png"
              alt="Qevn"
              width={160}
              height={45}
              priority
              className="h-10 w-auto object-contain"
            />
          </div>
          <div className="space-y-2">
            <div className="inline-block bg-[#FFDE59] border-2 border-black px-3 py-0.5 font-mono text-xs font-black uppercase text-black tracking-wider shadow-neo-sm">
              VERIFYING SUPABASE SESSION
            </div>
            <p className="text-xs text-neutral-600 font-mono">
              Loading enterprise permissions & access tokens...
            </p>
          </div>
          <div className="w-full bg-[#FAF7EE] border-2 border-black h-3 overflow-hidden p-0.5">
            <div className="h-full bg-[#00D06C] border-r border-black animate-pulse w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, prevent layout flash while redirecting
  if (!isAuthenticated) {
    return null;
  }

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
