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
    { label: 'View People Directory', href: '/people', icon: <User className="w-4 h-4 text-black" />, color: 'bg-[#FF6B9D]' },
    { label: 'Today Attendance Check-ins', href: '/attendance', icon: <CalendarDays className="w-4 h-4 text-white" />, color: 'bg-[#8B5CF6]' },
    { label: 'Leave Requests & Approvals', href: '/leave', icon: <CalendarDays className="w-4 h-4 text-black" />, color: 'bg-[#00D06C]' },
    { label: 'Document Vault & Compliance', href: '/documents', icon: <FileText className="w-4 h-4 text-black" />, color: 'bg-[#FFDE59]' },
    { label: 'Workforce Headcount Reports', href: '/reports', icon: <BarChart3 className="w-4 h-4 text-black" />, color: 'bg-[#38BDF8]' },
    { label: 'Settings & Organization Policies', href: '/settings', icon: <Settings className="w-4 h-4 text-white" />, color: 'bg-black' },
  ];

  const handleSelect = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-[#FAF7EE] border-3 border-black shadow-neo-xl z-10 overflow-hidden text-black">
        {/* Retro Window Search Header */}
        <div className="flex items-center px-4 py-3 border-b-3 border-black bg-[#00D06C] gap-3">
          <Search className="w-5 h-5 text-black" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search employee by name, ID, email, role, or module..."
            className="w-full bg-white border-2 border-black px-3 py-1.5 text-black font-mono text-sm placeholder:text-zinc-500 focus:outline-hidden shadow-neo-sm"
          />
          <button
            onClick={onClose}
            className="w-7 h-7 bg-white border-2 border-black flex items-center justify-center font-mono font-black text-xs text-black hover:bg-[#FF4365] hover:text-white transition-colors cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {/* People Section */}
          <div>
            <div className="px-1 pb-2 text-[11px] font-mono font-black uppercase text-black tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 bg-black inline-block" />
              MATCHING PEOPLE ({filteredPersons.length})
            </div>
            <div className="space-y-1.5">
              {filteredPersons.length === 0 ? (
                <div className="px-3 py-2 text-xs font-mono text-zinc-600 bg-white border border-black">No matching employees found.</div>
              ) : (
                filteredPersons.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelect(`/people/${p.id}`)}
                    className="w-full flex items-center justify-between p-3 bg-white hover:bg-[#FFFDF5] border-2 border-black shadow-neo-sm transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#FFDE59] border-2 border-black flex items-center justify-center font-mono font-black text-xs text-black">
                        {p.full_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-mono text-xs font-black text-black group-hover:text-[#00D06C] flex items-center gap-2">
                          <span>{p.full_name}</span>
                          <span className="text-[10px] text-zinc-600 font-bold">[{p.person_code}]</span>
                        </div>
                        <div className="text-[11px] text-zinc-600 font-sans font-medium">
                          {p.designation?.name || 'Staff'} • {p.department?.name || 'General'}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Quick Navigation Section */}
          <div>
            <div className="px-1 pb-2 text-[11px] font-mono font-black uppercase text-black tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 bg-black inline-block" />
              SYSTEM MODULES & SHORTCUTS
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {navigationShortcuts.map((sc) => (
                <button
                  key={sc.href}
                  onClick={() => handleSelect(sc.href)}
                  className="flex items-center gap-2.5 p-2.5 bg-white hover:bg-[#FAF7EE] border-2 border-black shadow-neo-sm text-left text-xs font-mono font-bold text-black transition-all cursor-pointer"
                >
                  <div className={`p-1.5 border border-black ${sc.color}`}>
                    {sc.icon}
                  </div>
                  <span>{sc.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-[#F2EBDC] border-t-2 border-black flex items-center justify-between text-[11px] font-mono font-bold text-zinc-700">
          <span>TIP: ESC to close • Enter to select</span>
          <span className="text-black font-black uppercase">QEVN HRMS COMMAND TERMINAL</span>
        </div>
      </div>
    </div>
  );
}
