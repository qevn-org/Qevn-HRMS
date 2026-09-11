'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  Layers,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { canViewAuditLogs, canManageSettings, isEmployeeViewOnly, user, logout } = useAuth();

  const primaryNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, color: 'hover:bg-[#00D06C]' },
    { href: '/people', label: 'People Directory', icon: <Users className="w-4 h-4" />, color: 'hover:bg-[#FF6B9D]' },
    { href: '/attendance', label: 'Attendance', icon: <CalendarCheck className="w-4 h-4" />, color: 'hover:bg-[#FFDE59]' },
    { href: '/leave', label: 'Leave & Holidays', icon: <CalendarDays className="w-4 h-4" />, color: 'hover:bg-[#38BDF8]' },
    { href: '/documents', label: 'Document Vault', icon: <FileText className="w-4 h-4" />, color: 'hover:bg-[#8B5CF6] hover:text-white' },
    { href: '/onboarding', label: 'Onboarding & Radar', icon: <UserPlus className="w-4 h-4" />, color: 'hover:bg-[#00D06C]' },
    { href: '/reports', label: 'Reports & Exports', icon: <BarChart3 className="w-4 h-4" />, color: 'hover:bg-[#FFDE59]' },
    { href: '/import', label: 'Spreadsheet Import', icon: <UploadCloud className="w-4 h-4" />, hideForEmployee: true, color: 'hover:bg-[#FF6B9D]' },
  ];

  const adminNavItems = [
    { href: '/audit', label: 'Audit Trail', icon: <History className="w-4 h-4" />, required: canViewAuditLogs, color: 'hover:bg-[#8B5CF6] hover:text-white' },
    { href: '/settings', label: 'Settings & Policies', icon: <Settings className="w-4 h-4" />, required: canManageSettings, color: 'hover:bg-[#38BDF8]' },
  ];

  const futureNavItems = [
    { href: '/future-phases', label: 'Phases 2–4 Hub', icon: <Layers className="w-4 h-4" />, badge: 'PREVIEW' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 lg:top-[57px] left-0 z-40 h-screen lg:h-[calc(100vh-57px)] w-64 bg-[#FAF7EE] border-r-3 border-black flex flex-col justify-between p-3.5 select-none transition-transform duration-200 ease-in-out overflow-y-auto shadow-[3px_0px_0px_#000]',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="space-y-5">
          {/* Mobile brand header inside sidebar */}
          <div className="lg:hidden flex items-center justify-between pb-3 border-b-2 border-black">
            <div className="flex items-center gap-2 p-1 bg-white border border-black shadow-neo-sm">
              <Image
                src="/qevn-logo-black.png"
                alt="Qevn"
                width={85}
                height={24}
                priority
                className="h-5 w-auto object-contain"
              />
            </div>
            <button onClick={onClose} className="text-black bg-white border border-black p-1 text-xs font-mono font-bold">
              [CLOSE]
            </button>
          </div>

          {/* Section: Operational Modules */}
          <div>
            <div className="px-2 pb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-mono font-black uppercase text-black tracking-wider bg-[#FFDE59] px-1.5 py-0.5 border border-black shadow-neo-sm">
                CORE OPS // PHASE 1
              </span>
            </div>
            <nav className="space-y-1.5 mt-2">
              {primaryNavItems.map((item) => {
                if (item.hideForEmployee && isEmployeeViewOnly) return null;
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 font-mono text-xs font-black uppercase tracking-wider transition-all border-2 group cursor-pointer',
                      isActive
                        ? 'bg-[#00D06C] text-black border-black shadow-neo-sm translate-x-1'
                        : `bg-white text-black border-black/30 hover:border-black ${item.color}`
                    )}
                  >
                    <span className={cn(isActive ? 'text-black' : 'text-neutral-700 group-hover:text-black')}>
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
              <div className="px-2 pb-1.5 flex items-center justify-between">
                <span className="text-[10px] font-mono font-black uppercase text-white bg-[#8B5CF6] px-1.5 py-0.5 border border-black tracking-wider shadow-neo-sm">
                  GOVERNANCE & AUDIT
                </span>
              </div>
              <nav className="space-y-1.5 mt-2">
                {adminNavItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-2 font-mono text-xs font-black uppercase tracking-wider transition-all border-2 group cursor-pointer',
                        isActive
                          ? 'bg-[#8B5CF6] text-white border-black shadow-neo-sm translate-x-1'
                          : `bg-white text-black border-black/30 hover:border-black ${item.color}`
                      )}
                    >
                      <span className={cn(isActive ? 'text-white' : 'text-neutral-700 group-hover:text-black')}>
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
            <div className="px-2 pb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-mono font-black uppercase text-black bg-[#38BDF8] px-1.5 py-0.5 border border-black tracking-wider shadow-neo-sm">
                ROADMAP BLUEPRINT
              </span>
            </div>
            <nav className="space-y-1.5 mt-2">
              {futureNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 font-mono text-xs font-black uppercase tracking-wider transition-all border-2 group cursor-pointer',
                      isActive
                        ? 'bg-[#38BDF8] text-black border-black shadow-neo-sm translate-x-1'
                        : 'bg-white text-black border-black/30 hover:border-black hover:bg-[#38BDF8]'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-neutral-700 group-hover:text-black">
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] font-mono font-black px-1.5 py-0.2 bg-black text-[#38BDF8] border border-black">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom User Session & Logout Panel */}
        <div className="mt-4 pt-3 border-t-2 border-black space-y-2">
          <div className="p-3 bg-white border-2 border-black shadow-neo-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-black text-black uppercase">LOGGED IN AS</span>
              <span className="inline-flex items-center gap-1 text-[9px] font-mono font-black text-black bg-[#00D06C] px-1.5 py-0.2 border border-black">
                <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
                ONLINE
              </span>
            </div>
            <div className="space-y-0.5">
              <div className="font-mono text-xs font-black text-black truncate">{user.display_name}</div>
              <div className="font-mono text-[10px] text-neutral-600 truncate">{user.email}</div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-[#FF6B9D] hover:bg-[#ff4d88] text-black font-mono font-black text-xs border-2 border-black transition-all shadow-neo-sm cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>LOGOUT</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
