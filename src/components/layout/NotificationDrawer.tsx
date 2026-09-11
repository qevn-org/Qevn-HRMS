'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { X, AlertCircle, Calendar, FileText, BellRing, ArrowRight } from 'lucide-react';
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
        return <AlertCircle className="w-4 h-4 text-black" />;
      case 'deadline':
        return <Calendar className="w-4 h-4 text-white" />;
      case 'document':
        return <FileText className="w-4 h-4 text-black" />;
      default:
        return <BellRing className="w-4 h-4 text-white" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'approval_needed':
        return 'bg-[#FFDE59]';
      case 'deadline':
        return 'bg-[#FF4365]';
      case 'document':
        return 'bg-[#38BDF8]';
      default:
        return 'bg-[#8B5CF6]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-[#FAF7EE] border-l-3 border-black shadow-neo-xl z-10 flex flex-col justify-between h-full text-black">
        {/* Retro Window Header */}
        <div className="bg-[#FFDE59] border-b-3 border-black p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-black" />
            <h3 className="font-mono text-sm font-black uppercase tracking-wider text-black">
              ACTIVITY & RADAR NOTIFICATIONS
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 bg-white border-2 border-black flex items-center justify-center font-mono font-black text-xs text-black hover:bg-[#FF4365] hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-zinc-600 font-mono text-xs bg-white border-2 border-black">
              All caught up! No active notifications.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3.5 border-2 border-black transition-all ${
                  notif.read_at
                    ? 'bg-white text-zinc-700'
                    : 'bg-[#FFFDF5] shadow-neo-sm text-black'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className={`p-1.5 border-2 border-black mt-0.5 ${getBadgeColor(notif.type)}`}>
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-mono text-xs font-black uppercase tracking-wide">
                        {notif.title}
                      </h4>
                      {!notif.read_at && (
                        <button
                          onClick={() => markNotificationAsRead(notif.id)}
                          className="text-[10px] font-mono font-black text-[#8B5CF6] hover:underline"
                          title="Mark as Read"
                        >
                          [DISMISS]
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-zinc-700 font-sans mt-1 leading-relaxed font-medium">
                      {notif.message}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-zinc-600 font-bold">
                      <span>{formatDateTime(notif.created_at)}</span>
                      {notif.link_url && (
                        <Link
                          href={notif.link_url}
                          onClick={onClose}
                          className="text-black bg-[#00D06C] px-2 py-0.5 border border-black hover:bg-[#05DF72] flex items-center gap-1 font-black"
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
        <div className="p-4 border-t-3 border-black bg-[#F2EBDC] flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold text-zinc-600">QEVN HRMS EVENT STREAM</span>
          <Button variant="white" size="sm" onClick={onClose}>
            CLOSE
          </Button>
        </div>
      </div>
    </div>
  );
}
