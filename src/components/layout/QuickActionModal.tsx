'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { UserPlus, CalendarCheck, CalendarDays, FileUp, UploadCloud, BarChart3 } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickActionModal({ isOpen, onClose }: QuickActionModalProps) {
  const router = useRouter();
  const { canManagePeople, isEmployeeViewOnly } = useAuth();

  const handleAction = (href: string) => {
    onClose();
    router.push(href);
  };

  const actions = [
    {
      title: 'Add New Person',
      subtitle: 'Create employee, intern, or contractor master record',
      icon: <UserPlus className="w-5 h-5 text-black" />,
      color: 'bg-[#00D06C]',
      href: '/people?action=new',
      disabled: isEmployeeViewOnly,
    },
    {
      title: 'Mark Today Attendance',
      subtitle: 'Record check-in, WFH status, or bulk mark department',
      icon: <CalendarCheck className="w-5 h-5 text-white" />,
      color: 'bg-[#8B5CF6]',
      href: '/attendance?action=mark',
    },
    {
      title: 'Request Leave / WFH',
      subtitle: 'Submit paid, casual, sick, or remote work request',
      icon: <CalendarDays className="w-5 h-5 text-black" />,
      color: 'bg-[#FF6B9D]',
      href: '/leave?action=new',
    },
    {
      title: 'Upload HR Document',
      subtitle: 'Store contracts, agreements, IDs, or certificates',
      icon: <FileUp className="w-5 h-5 text-black" />,
      color: 'bg-[#38BDF8]',
      href: '/documents?action=upload',
    },
    {
      title: 'Batch Import Spreadsheet',
      subtitle: 'Migrate CSV/XLSX sheet of team records into HRMS',
      icon: <UploadCloud className="w-5 h-5 text-black" />,
      color: 'bg-[#FFDE59]',
      href: '/import',
      disabled: isEmployeeViewOnly,
    },
    {
      title: 'Generate Headcount Report',
      subtitle: 'Download real CSV, formatted Excel, or PDF audit report',
      icon: <BarChart3 className="w-5 h-5 text-white" />,
      color: 'bg-black',
      href: '/reports',
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="OPERATIONAL QUICK ACTIONS"
      subtitle="Trigger high-frequency HR workflows across modules"
      headerColor="pink"
      maxWidth="2xl"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {actions.map((act) => (
          <button
            key={act.title}
            disabled={act.disabled}
            onClick={() => handleAction(act.href)}
            className={`flex items-start gap-3 p-3.5 bg-white border-2 border-black hover:bg-[#FFFDF5] hover:shadow-neo hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all text-left group cursor-pointer ${
              act.disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''
            }`}
          >
            <div className={`p-2.5 border-2 border-black shadow-neo-sm ${act.color} shrink-0`}>
              {act.icon}
            </div>
            <div>
              <h4 className="font-mono text-xs font-black uppercase tracking-wider text-black group-hover:text-[#00D06C]">
                {act.title}
              </h4>
              <p className="text-[11px] text-zinc-600 font-sans font-medium mt-0.5 leading-snug">
                {act.subtitle}
              </p>
            </div>
          </button>
        ))}
      </div>
    </Modal>
  );
}
