'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, User, CalendarDays, FileText, BarChart3, Settings, ArrowRight, X } from 'lucide-react';
import { hrmsStore } from '@/lib/services/store';
import { Person } from '@/types/database';

interface CommandBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandBar({ isOpen, onClose }: CommandBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [persons, setPersons] = useState<Person[]>([]);

  useEffect(() => {
    if (isOpen) {
      setPersons(hrmsStore.getPersons());
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open
        }
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredPersons = query.trim()
    ? persons.filter(
        (p) =>
          p.full_name.toLowerCase().includes(query.toLowerCase()) ||
          p.person_code.toLowerCase().includes(query.toLowerCase()) ||
          p.work_email.toLowerCase().includes(query.toLowerCase()) ||
          p.designation?.name.toLowerCase().includes(query.toLowerCase()) ||
          p.department?.name.toLowerCase().includes(query.toLowerCase())
      )
    : persons.slice(0, 5);

  const navigationShortcuts = [
    { label: 'View People Directory', href: '/people', icon: <User className="w-4 h-4 text-[#CCFF00]" /> },
    { label: 'Today Attendance Check-ins', href: '/attendance', icon: <CalendarDays className="w-4 h-4 text-[#8B5CF6]" /> },
    { label: 'Leave Requests & Approvals', href: '/leave', icon: <CalendarDays className="w-4 h-4 text-[#06B6D4]" /> },
    { label: 'Document Vault & Compliance', href: '/documents', icon: <FileText className="w-4 h-4 text-emerald-400" /> },
    { label: 'Workforce Headcount Reports', href: '/reports', icon: <BarChart3 className="w-4 h-4 text-amber-400" /> },
    { label: 'Settings & Organization Policies', href: '/settings', icon: <Settings className="w-4 h-4 text-zinc-400" /> },
  ];

  const handleSelect = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-[#121218] border-2 border-[#CCFF00] shadow-neo-lime z-10 overflow-hidden text-white">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b-2 border-[#262636] bg-[#171722] gap-3">
          <Search className="w-5 h-5 text-[#CCFF00]" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search employee by name, ID, email, role, or module..."
            className="w-full bg-transparent border-none text-white font-mono text-sm placeholder:text-zinc-500 focus:outline-hidden"
          />
          <button onClick={onClose} className="text-zinc-500 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {/* People Section */}
          <div>
            <div className="px-2 pb-1.5 text-[10px] font-mono font-black uppercase text-zinc-500 tracking-wider">
              MATCHING PEOPLE ({filteredPersons.length})
            </div>
            <div className="space-y-1">
              {filteredPersons.length === 0 ? (
                <div className="px-3 py-2 text-xs font-mono text-zinc-500">No matching employees found.</div>
              ) : (
                filteredPersons.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelect(`/people/${p.id}`)}
                    className="w-full flex items-center justify-between p-2.5 bg-[#0D0D12] hover:bg-zinc-800/80 border border-[#262636] hover:border-[#CCFF00] transition-colors text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-zinc-800 border border-zinc-700 flex items-center justify-center font-mono font-bold text-xs text-[#CCFF00]">
                        {p.full_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-mono text-xs font-bold text-white group-hover:text-[#CCFF00] flex items-center gap-2">
                          <span>{p.full_name}</span>
                          <span className="text-[10px] text-zinc-400 font-normal">[{p.person_code}]</span>
                        </div>
                        <div className="text-[11px] text-zinc-400 font-sans">
                          {p.designation?.name || 'Staff'} • {p.department?.name || 'General'}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-[#CCFF00] transition-colors" />
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Quick Navigation Section */}
          <div>
            <div className="px-2 pb-1.5 text-[10px] font-mono font-black uppercase text-zinc-500 tracking-wider">
              SYSTEM MODULES & SHORTCUTS
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {navigationShortcuts.map((sc) => (
                <button
                  key={sc.href}
                  onClick={() => handleSelect(sc.href)}
                  className="flex items-center gap-2.5 p-2 bg-[#0D0D12] hover:bg-zinc-800 border border-[#262636] hover:border-zinc-500 text-left text-xs font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  {sc.icon}
                  <span>{sc.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-[#0A0A0E] border-t border-[#262636] flex items-center justify-between text-[10px] font-mono text-zinc-500">
          <span>TIP: Use arrow keys to navigate or ESC to close</span>
          <span className="text-[#CCFF00]">QEVN HRMS GLOBAL INDEX</span>
        </div>
      </div>
    </div>
  );
}
