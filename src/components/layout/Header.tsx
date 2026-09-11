'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { RoleName } from '@/types/database';
import {
  Search,
  Bell,
  Plus,
  ShieldCheck,
  UserCheck,
  Briefcase,
  User,
  Eye,
  Menu,
  Sparkles,
  Command,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface HeaderProps {
  onOpenCommandBar: () => void;
  onOpenQuickAction: () => void;
  onToggleSidebar: () => void;
  onOpenNotifications: () => void;
}

export function Header({
  onOpenCommandBar,
  onOpenQuickAction,
  onToggleSidebar,
  onOpenNotifications,
}: HeaderProps) {
  const { user, activeRole, setActiveRole, unreadNotificationCount } = useAuth();
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  const roleOptions: { role: RoleName; label: string; icon: React.ReactNode; color: string }[] = [
    { role: 'super_admin', label: 'Super Admin', icon: <ShieldCheck className="w-3.5 h-3.5" />, color: 'bg-[#CCFF00] text-black' },
    { role: 'hr_admin', label: 'HR Admin', icon: <UserCheck className="w-3.5 h-3.5" />, color: 'bg-[#8B5CF6] text-white' },
    { role: 'manager', label: 'Manager', icon: <Briefcase className="w-3.5 h-3.5" />, color: 'bg-[#06B6D4] text-black' },
    { role: 'employee', label: 'Employee', icon: <User className="w-3.5 h-3.5" />, color: 'bg-zinc-700 text-white' },
    { role: 'management_readonly', label: 'Board / Readonly', icon: <Eye className="w-3.5 h-3.5" />, color: 'bg-amber-500 text-black' },
  ];

  const currentRoleConfig = roleOptions.find((r) => r.role === activeRole) || roleOptions[0];

  return (
    <header className="sticky top-0 z-30 bg-[#0A0A0E] border-b-2 border-[#262636] px-4 py-2.5 flex items-center justify-between gap-4 select-none">
      {/* Left: Mobile Menu Toggle & Brand Mobile */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-700"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-[#CCFF00] border-2 border-black flex items-center justify-center font-mono font-black text-black text-base shadow-neo-sm group-hover:scale-105 transition-transform">
            Q
          </div>
          <div className="hidden sm:block leading-tight">
            <span className="font-mono font-black text-white tracking-wider text-sm flex items-center gap-1.5">
              QEVN <span className="text-[#CCFF00]">//</span> HRMS
            </span>
            <span className="text-[10px] font-mono text-zinc-500 tracking-widest block uppercase">
              PEOPLE OPERATIONS OS
            </span>
          </div>
        </Link>
      </div>

      {/* Middle: Global Search / Command Bar Trigger */}
      <div className="flex-1 max-w-xl hidden md:block">
        <button
          onClick={onOpenCommandBar}
          className="w-full bg-[#121218] border-2 border-[#262636] hover:border-[#CCFF00] px-3.5 py-1.5 flex items-center justify-between text-zinc-400 text-xs font-mono transition-all group shadow-neo-sm"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-zinc-500 group-hover:text-[#CCFF00] transition-colors" />
            <span>Search people, leave, documents, reports...</span>
          </div>
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 text-zinc-400 text-[10px] rounded-none">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Right: Quick Action, Notifications, Role Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Action Button */}
        <Button
          variant="primary"
          size="sm"
          onClick={onOpenQuickAction}
          className="hidden sm:inline-flex"
        >
          <Plus className="w-4 h-4 mr-1" /> Action
        </Button>

        {/* Notifications Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 bg-[#121218] border-2 border-[#262636] hover:border-[#CCFF00] text-zinc-400 hover:text-white transition-all shadow-neo-sm cursor-pointer"
          title="Notifications & Alerts"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#F43F5E] text-white font-mono text-[9px] font-black border border-black flex items-center justify-center animate-pulse">
              {unreadNotificationCount}
            </span>
          )}
        </button>

        {/* Live Role Switcher (Simulate Roles easily) */}
        <div className="relative">
          <button
            onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
            className="flex items-center gap-2 bg-[#121218] border-2 border-[#262636] hover:border-[#CCFF00] p-1.5 pr-2.5 transition-all shadow-neo-sm cursor-pointer"
            title="Switch Simulated Role"
          >
            <div className={`p-1 font-mono text-[10px] font-bold border border-black ${currentRoleConfig.color}`}>
              {currentRoleConfig.icon}
            </div>
            <div className="text-left hidden xl:block">
              <span className="text-[10px] text-zinc-500 font-mono block leading-none">ACTIVE ROLE</span>
              <span className="text-xs font-mono font-bold text-white tracking-wide leading-tight">
                {currentRoleConfig.label}
              </span>
            </div>
          </button>

          {/* Role Dropdown */}
          {isRoleMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[#121218] border-2 border-[#3B3B4F] shadow-neo-lg z-50 p-1.5 text-white">
              <div className="px-2.5 py-1.5 border-b border-zinc-800 text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                <span>SIMULATE ROLE</span>
                <Sparkles className="w-3 h-3 text-[#CCFF00]" />
              </div>
              <div className="py-1 space-y-0.5">
                {roleOptions.map((opt) => (
                  <button
                    key={opt.role}
                    onClick={() => {
                      setActiveRole(opt.role);
                      setIsRoleMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 font-mono text-xs font-bold text-left transition-colors cursor-pointer ${
                      activeRole === opt.role
                        ? 'bg-[#CCFF00]/15 text-[#CCFF00] border-l-2 border-[#CCFF00]'
                        : 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white'
                    }`}
                  >
                    <span className={`p-1 border border-black ${opt.color}`}>{opt.icon}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
