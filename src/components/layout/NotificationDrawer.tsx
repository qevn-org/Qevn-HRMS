'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { X, CheckCheck, AlertCircle, Calendar, FileText, BellRing, ArrowRight } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
  const { notifications, markNotificationAsRead } = useAuth();

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'approval_needed':
        return <AlertCircle className="w-4 h-4 text-[#CCFF00]" />;
      case 'deadline':
        return <Calendar className="w-4 h-4 text-[#F43F5E]" />;
      case 'document':
        return <FileText className="w-4 h-4 text-[#06B6D4]" />;
      default:
        return <BellRing className="w-4 h-4 text-[#8B5CF6]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-xs" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-[#121218] border-l-2 border-[#3B3B4F] shadow-neo-lg z-10 flex flex-col justify-between h-full text-white">
        {/* Header */}
        <div className="bg-[#171722] border-b-2 border-[#262636] p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#CCFF00]" />
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
              ACTIVITY & RADAR NOTIFICATIONS
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 font-mono text-xs">
              All caught up! No active notifications.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3.5 border-2 transition-all ${
                  notif.read_at
                    ? 'bg-[#0D0D12] border-[#22222E] text-zinc-400'
                    : 'bg-[#171722] border-[#CCFF00] shadow-neo-sm text-white'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 bg-[#0D0D12] border border-zinc-700 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-mono text-xs font-bold uppercase tracking-wide">
                        {notif.title}
                      </h4>
                      {!notif.read_at && (
                        <button
                          onClick={() => markNotificationAsRead(notif.id)}
                          className="text-[10px] font-mono text-[#CCFF00] hover:underline"
                          title="Mark as Read"
                        >
                          [DISMISS]
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-zinc-300 font-sans mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                      <span>{formatDateTime(notif.created_at)}</span>
                      {notif.link_url && (
                        <Link
                          href={notif.link_url}
                          onClick={onClose}
                          className="text-[#CCFF00] hover:underline flex items-center gap-1 font-bold"
                        >
                          OPEN <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#262636] bg-[#0A0A0E] flex items-center justify-between">
          <span className="text-[10px] font-mono text-zinc-500">QEVN HRMS EVENT STREAM</span>
          <Button variant="outline" size="sm" onClick={onClose}>
            CLOSE
          </Button>
        </div>
      </div>
    </div>
  );
}
