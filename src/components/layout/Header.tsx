'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  LogOut,
  ChevronDown,
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
  const { user, activeRole, setActiveRole, unreadNotificationCount, logout } = useAuth();
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const roleOptions: { role: RoleName; label: string; icon: React.ReactNode; color: string }[] = [
    { role: 'super_admin', label: 'Super Admin', icon: <ShieldCheck className="w-3.5 h-3.5" />, color: 'bg-[#00D06C] text-black' },
    { role: 'hr_admin', label: 'HR Admin', icon: <UserCheck className="w-3.5 h-3.5" />, color: 'bg-[#8B5CF6] text-white' },
    { role: 'manager', label: 'Manager', icon: <Briefcase className="w-3.5 h-3.5" />, color: 'bg-[#38BDF8] text-black' },
    { role: 'employee', label: 'Employee', icon: <User className="w-3.5 h-3.5" />, color: 'bg-[#FF6B9D] text-black' },
    { role: 'management_readonly', label: 'Board / Readonly', icon: <Eye className="w-3.5 h-3.5" />, color: 'bg-[#FFDE59] text-black' },
  ];

  const currentRoleConfig = roleOptions.find((r) => r.role === activeRole) || roleOptions[0];

  return (
    <header className="sticky top-0 z-30 bg-white border-b-3 border-black px-4 py-2.5 flex items-center justify-between gap-4 select-none shadow-[0px_3px_0px_#000]">
      {/* Left: Mobile Menu Toggle & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 bg-white text-black hover:bg-[#FAF7EE] border-2 border-black shadow-neo-sm cursor-pointer"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          {/* Exact QEVN black logo on clean neutral/transparent background */}
          <div className="flex items-center py-1 px-1.5 border-2 border-black bg-[#FAF7EE] shadow-neo-sm group-hover:translate-x-0.5 transition-transform">
            <Image
              src="/qevn-logo-black.png"
              alt="Qevn"
              width={95}
              height={27}
              priority
              className="h-6 w-auto object-contain"
            />
          </div>
          <div className="hidden sm:block leading-none">
            <span className="font-mono font-black text-black tracking-wider text-xs flex items-center gap-1.5">
              <span className="bg-[#FF6B9D] text-black px-1.5 py-0.5 border border-black text-[10px] uppercase font-black">
                HRMS // ENTERPRISE OS
              </span>
            </span>
          </div>
        </Link>
      </div>

      {/* Middle: Global Search / Command Bar Trigger */}
      <div className="flex-1 max-w-xl hidden md:block">
        <button
          onClick={onOpenCommandBar}
          className="w-full bg-[#FAF7EE] border-2 border-black hover:bg-white hover:border-black px-3.5 py-1.5 flex items-center justify-between text-neutral-700 text-xs font-mono transition-all group shadow-neo-sm cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-black group-hover:text-[#00D06C] transition-colors" />
            <span className="font-bold text-neutral-800">Search team, attendance, leave, documents...</span>
          </div>
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-black text-white text-[10px] font-black border border-black shadow-neo-sm">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Right: Quick Action, Notifications, Role Switcher, Account Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Action Button */}
        <Button
          variant="pink"
          size="sm"
          onClick={onOpenQuickAction}
          className="hidden sm:inline-flex text-xs"
        >
          <Plus className="w-4 h-4 mr-1" /> Action
        </Button>

        {/* Notifications Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 bg-[#FFDE59] border-2 border-black hover:bg-[#FFD026] text-black transition-all shadow-neo-sm cursor-pointer"
          title="Notifications & Alerts"
        >
          <Bell className="w-4 h-4 text-black" />
          {unreadNotificationCount > 0 && (
            <span className="absolute -top-2 -right-2 px-1.5 py-0.2 bg-[#FF6B9D] text-black font-mono text-[9px] font-black border-2 border-black animate-bounce shadow-neo-sm">
              {unreadNotificationCount}
            </span>
          )}
        </button>

        {/* Live Role Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setIsRoleMenuOpen(!isRoleMenuOpen);
              setIsUserMenuOpen(false);
            }}
            className="flex items-center gap-2 bg-white border-2 border-black hover:bg-[#FAF7EE] p-1.5 pr-2.5 transition-all shadow-neo-sm cursor-pointer"
            title="Switch Simulated Role"
          >
            <div className={`p-1 font-mono text-[10px] font-black border-2 border-black ${currentRoleConfig.color}`}>
              {currentRoleConfig.icon}
            </div>
            <div className="text-left hidden xl:block">
              <span className="text-[9px] text-neutral-500 font-mono font-bold block leading-none">ROLE</span>
              <span className="text-xs font-mono font-black text-black tracking-wide leading-tight">
                {currentRoleConfig.label}
              </span>
            </div>
          </button>

          {/* Role Dropdown */}
          {isRoleMenuOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white border-3 border-black shadow-neo-lg z-50 p-2 text-black">
              <div className="px-2.5 py-1.5 bg-[#FAF7EE] border-2 border-black text-[10px] font-mono font-black text-black uppercase tracking-wider flex items-center justify-between mb-1.5">
                <span>SWITCH ROLE VIEW</span>
                <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
              </div>
              <div className="space-y-1">
                {roleOptions.map((opt) => (
                  <button
                    key={opt.role}
                    onClick={() => {
                      setActiveRole(opt.role);
                      setIsRoleMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 font-mono text-xs font-black text-left transition-colors cursor-pointer border-2 ${
                      activeRole === opt.role
                        ? 'bg-[#00D06C] text-black border-black shadow-neo-sm'
                        : 'bg-white text-neutral-800 border-transparent hover:border-black hover:bg-[#FAF7EE]'
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

        {/* User Account Menu with Clear Logout */}
        <div className="relative">
          <button
            onClick={() => {
              setIsUserMenuOpen(!isUserMenuOpen);
              setIsRoleMenuOpen(false);
            }}
            className="flex items-center gap-2 bg-[#FAF7EE] border-2 border-black hover:bg-white p-1.5 transition-all shadow-neo-sm cursor-pointer"
            title="Account & Session"
          >
            <div className="w-6 h-6 rounded-full bg-[#38BDF8] border-2 border-black flex items-center justify-center font-mono font-black text-xs text-black">
              {user.display_name?.charAt(0) || 'U'}
            </div>
            <div className="text-left hidden lg:block">
              <span className="text-xs font-mono font-black text-black block leading-none max-w-[100px] truncate">
                {user.display_name || user.email}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-black" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border-3 border-black shadow-neo-xl z-50 p-3 text-black font-mono">
              <div className="p-2.5 bg-[#FAF7EE] border-2 border-black mb-3">
                <div className="text-xs font-black text-black truncate">{user.display_name}</div>
                <div className="text-[11px] text-neutral-600 truncate">{user.email}</div>
                <div className="mt-1 inline-block bg-[#00D06C] text-black border border-black px-1.5 py-0.2 text-[9px] font-black uppercase">
                  {user.role}
                </div>
              </div>

              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center gap-2 p-2.5 bg-[#FF6B9D] text-black font-black text-xs border-2 border-black hover:bg-[#ff4d88] transition-all shadow-neo-sm cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-black" />
                <span>LOGOUT FROM HRMS</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
