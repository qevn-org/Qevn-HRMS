'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/context/AuthContext';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CalendarDays,
  FileText,
  UserPlus,
  BarChart3,
  UploadCloud,
  History,
  Settings,
  Sparkles,
  ShieldAlert,
  Layers,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { canViewAuditLogs, canManageSettings, isEmployeeViewOnly } = useAuth();

  const primaryNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { href: '/people', label: 'People Directory', icon: <Users className="w-4 h-4" /> },
    { href: '/attendance', label: 'Attendance', icon: <CalendarCheck className="w-4 h-4" /> },
    { href: '/leave', label: 'Leave & Holidays', icon: <CalendarDays className="w-4 h-4" /> },
    { href: '/documents', label: 'Document Vault', icon: <FileText className="w-4 h-4" /> },
    { href: '/onboarding', label: 'Onboarding & Radar', icon: <UserPlus className="w-4 h-4" /> },
    { href: '/reports', label: 'Reports & Exports', icon: <BarChart3 className="w-4 h-4" /> },
    { href: '/import', label: 'Spreadsheet Import', icon: <UploadCloud className="w-4 h-4" />, hideForEmployee: true },
  ];

  const adminNavItems = [
    { href: '/audit', label: 'Audit Trail', icon: <History className="w-4 h-4" />, required: canViewAuditLogs },
    { href: '/settings', label: 'Settings & Policies', icon: <Settings className="w-4 h-4" />, required: canManageSettings },
  ];

  const futureNavItems = [
    { href: '/future-phases', label: 'Phases 2–4 Hub', icon: <Layers className="w-4 h-4" />, badge: 'PREVIEW' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 lg:hidden backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 lg:top-[57px] left-0 z-40 h-screen lg:h-[calc(100vh-57px)] w-64 bg-[#0D0D12] border-r-2 border-[#262636] flex flex-col justify-between p-3 select-none transition-transform duration-200 ease-in-out overflow-y-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="space-y-5">
          {/* Mobile brand header inside sidebar */}
          <div className="lg:hidden flex items-center justify-between pb-3 border-b border-[#262636]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#CCFF00] border border-black flex items-center justify-center font-mono font-black text-black text-xs">
                Q
              </div>
              <span className="font-mono font-bold text-white text-xs">QEVN // HRMS</span>
            </div>
            <button onClick={onClose} className="text-zinc-400 p-1 text-xs font-mono">
              [CLOSE]
            </button>
          </div>

          {/* Section: Operational Modules */}
          <div>
            <div className="px-3 pb-2 text-[10px] font-mono font-black uppercase text-zinc-500 tracking-wider">
              PHASE 1 // OPERATIONS
            </div>
            <nav className="space-y-1">
              {primaryNavItems.map((item) => {
                if (item.hideForEmployee && isEmployeeViewOnly) return null;
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all border group',
                      isActive
                        ? 'bg-[#CCFF00] text-black border-black shadow-neo-sm font-black'
                        : 'text-zinc-400 border-transparent hover:text-white hover:bg-zinc-800/60 hover:border-zinc-700'
                    )}
                  >
                    <span className={cn(isActive ? 'text-black' : 'text-zinc-500 group-hover:text-[#CCFF00]')}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Section: Governance & Audit */}
          {(!isEmployeeViewOnly || canViewAuditLogs) && (
            <div>
              <div className="px-3 pb-2 text-[10px] font-mono font-black uppercase text-zinc-500 tracking-wider">
                GOVERNANCE & AUDIT
              </div>
              <nav className="space-y-1">
                {adminNavItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all border group',
                        isActive
                          ? 'bg-[#8B5CF6] text-white border-black shadow-neo-sm font-black'
                          : 'text-zinc-400 border-transparent hover:text-white hover:bg-zinc-800/60 hover:border-zinc-700'
                      )}
                    >
                      <span className={cn(isActive ? 'text-white' : 'text-zinc-500 group-hover:text-[#8B5CF6]')}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}

          {/* Section: Future Roadmap */}
          <div>
            <div className="px-3 pb-2 text-[10px] font-mono font-black uppercase text-zinc-500 tracking-wider">
              ROADMAP PREVIEWS
            </div>
            <nav className="space-y-1">
              {futureNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all border group',
                      isActive
                        ? 'bg-[#06B6D4] text-black border-black shadow-neo-sm font-black'
                        : 'text-zinc-400 border-transparent hover:text-white hover:bg-zinc-800/60 hover:border-zinc-700'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn(isActive ? 'text-black' : 'text-zinc-500 group-hover:text-[#06B6D4]')}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] font-mono font-black px-1.5 py-0.2 bg-[#06B6D4]/20 text-[#06B6D4] border border-[#06B6D4]/40">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer System Health Tag */}
        <div className="mt-4 pt-3 border-t border-[#262636] space-y-2">
          <div className="p-2.5 bg-[#121218] border border-[#262636] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-zinc-400">DATA ENGINE</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                ONLINE
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span>RLS & AUDIT</span>
              <span className="text-[#CCFF00] font-bold">ACTIVE</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
