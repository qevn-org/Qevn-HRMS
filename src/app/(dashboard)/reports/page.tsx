'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { reportService } from '@/lib/services/reportService';
import { peopleService } from '@/lib/services/peopleService';
import { documentService } from '@/lib/services/documentService';
import { onboardingService } from '@/lib/services/onboardingService';
import { exportService, ExportDataPayload } from '@/lib/services/exportService';
import { settingsService } from '@/lib/services/settingsService';
import { hrmsStore } from '@/lib/services/store';
import { Department, Person } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { useAuth } from '@/lib/context/AuthContext';
import { toast } from 'sonner';
import {
  FileSpreadsheet,
  Download,
  FileText,
  Users,
  CalendarCheck,
  CalendarDays,
  ShieldCheck,
  Clock,
} from 'lucide-react';

function ReportsContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [selectedReport, setSelectedReport] = useState<
    'headcount' | 'attendance' | 'leave' | 'compliance' | 'lifecycle' | 'exits'
  >('headcount');

  const [departments, setDepartments] = useState<Department[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [deptHeadcount, setDeptHeadcount] = useState<any[]>([]);

  useEffect(() => {
    hrmsStore.init();
    setDepartments(settingsService.getDepartments());
    setPersons(peopleService.getAllPersons());
    setDeptHeadcount(reportService.getDepartmentHeadcount());
  }, []);

  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam && ['headcount', 'attendance', 'leave', 'compliance', 'lifecycle', 'exits'].includes(typeParam)) {
      setSelectedReport(typeParam as any);
    }
  }, [searchParams]);

  // Construct export payload based on active report
  const getExportPayload = (): ExportDataPayload => {
    switch (selectedReport) {
      case 'headcount': {
        const active = persons.filter((p) => p.is_active);
        return {
          title: 'Department Headcount & Worker Distribution Report',
          filename: 'QEVN_Headcount_Report',
          reportCategory: 'headcount',
          headers: ['Person ID', 'Full Name', 'Email', 'Worker Type', 'Department', 'Designation', 'Joining Date', 'Status'],
          rows: active.map((p) => [
            p.person_code,
            p.full_name,
            p.work_email,
            p.worker_type.toUpperCase(),
            p.department?.name || 'General',
            p.designation?.name || 'Staff',
            p.joining_date,
            p.current_status.toUpperCase(),
          ]),
        };
      }
      case 'attendance': {
        const records = hrmsStore.getAttendance();
        return {
          title: 'Attendance History & Exceptions Log',
          filename: 'QEVN_Attendance_Report',
          reportCategory: 'attendance',
          headers: ['Person ID', 'Full Name', 'Department', 'Date', 'Status', 'Check-In', 'Source', 'Corrected', 'Notes'],
          rows: records.map((r) => [
            r.person_code || '—',
            r.person_name || '—',
            r.department_name || '—',
            r.attendance_date,
            r.status.toUpperCase(),
            r.check_in_at || '—',
            r.source,
            r.corrected ? 'YES' : 'NO',
            r.notes || '—',
          ]),
        };
      }
      case 'leave': {
        const requests = hrmsStore.getLeaveRequests();
        return {
          title: 'Leave & Time-Off Approvals Report',
          filename: 'QEVN_Leave_Report',
          reportCategory: 'leave',
          headers: ['Person ID', 'Full Name', 'Leave Type', 'Start Date', 'End Date', 'Days', 'Status', 'Reason', 'Manager Note'],
          rows: requests.map((r) => [
            r.person?.person_code || '—',
            r.person?.full_name || '—',
            r.leave_type?.name || '—',
            r.start_date,
            r.end_date,
            r.duration_days,
            r.status.toUpperCase(),
            r.reason,
            r.manager_comment || '—',
          ]),
        };
      }
      case 'compliance': {
        const compliance = documentService.getComplianceMatrix();
        return {
          title: 'Required Document Compliance Audit Report',
          filename: 'QEVN_Compliance_Report',
          reportCategory: 'compliance',
          headers: ['Person ID', 'Full Name', 'Department', 'Worker Type', 'Completion %', 'Uploaded Files', 'Required Files', 'Status'],
          rows: compliance.map((c) => [
            c.person.person_code,
            c.person.full_name,
            c.person.department?.name || 'General',
            c.person.worker_type.toUpperCase(),
            `${c.completionPercentage}%`,
            c.uploadedCount,
            c.requiredCount,
            c.isComplete ? 'COMPLIANT' : 'MISSING DOCUMENTS',
          ]),
        };
      }
      case 'lifecycle': {
        const probation = onboardingService.getProbationRadar(90);
        const interns = onboardingService.getInternshipRadar(90);
        return {
          title: 'Workforce Lifecycle & Deadlines Radar Report',
          filename: 'QEVN_Lifecycle_Report',
          reportCategory: 'lifecycle',
          headers: ['Person ID', 'Full Name', 'Department', 'Milestone Type', 'Target Date', 'Days Remaining', 'Status', 'Manager'],
          rows: [
            ...probation.map((p) => [
              p.person.person_code,
              p.person.full_name,
              p.person.department?.name || 'General',
              'PROBATION',
              p.probationEndDate,
              p.daysRemaining,
              p.isOverdue ? 'OVERDUE' : 'ON TRACK',
              p.managerName,
            ]),
            ...interns.map((i) => [
              i.person.person_code,
              i.person.full_name,
              i.person.department?.name || 'General',
              'INTERNSHIP TERM',
              i.internshipEndDate,
              i.daysRemaining,
              i.isOverdue ? 'OVERDUE' : 'ACTIVE',
              i.managerName,
            ]),
          ],
        };
      }
      case 'exits': {
        const exits = persons.filter((p) => !p.is_active || p.current_status === 'resigned' || p.current_status === 'exited');
        return {
          title: 'Historical Joiners & Exits Report',
          filename: 'QEVN_Exits_Report',
          reportCategory: 'exits',
          headers: ['Person ID', 'Full Name', 'Department', 'Joining Date', 'Last Working Date', 'Status', 'Archived By', 'Reason'],
          rows: exits.map((p) => [
            p.person_code,
            p.full_name,
            p.department?.name || 'General',
            p.joining_date,
            p.last_working_date || '—',
            p.current_status.toUpperCase(),
            p.archived_by || '—',
            p.archive_reason || '—',
          ]),
        };
      }
    }
  };

  const handleExport = (format: 'csv' | 'xlsx' | 'pdf') => {
    const payload = getExportPayload();
    if (format === 'csv') exportService.exportToCSV(payload, user.display_name);
    else if (format === 'xlsx') exportService.exportToExcel(payload, user.display_name);
    else exportService.exportToPDF(payload, user.display_name);

    toast.success(`Generated and downloaded ${payload.title} as ${format.toUpperCase()}`);
  };

  const reportTabs = [
    { id: 'headcount', label: '1. Headcount by Department', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'attendance', label: '2. Attendance Summary', icon: <CalendarCheck className="w-3.5 h-3.5" /> },
    { id: 'leave', label: '3. Leave Utilization', icon: <CalendarDays className="w-3.5 h-3.5" /> },
    { id: 'compliance', label: '4. Document Compliance', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: 'lifecycle', label: '5. Lifecycle Radar', icon: <Clock className="w-3.5 h-3.5" /> },
    { id: 'exits', label: '6. Joiners & Exits', icon: <FileText className="w-3.5 h-3.5" /> },
  ];

  const currentPayload = getExportPayload();

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white border-3 border-black p-5 sm:p-6 shadow-neo flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="sticker-tag bg-[#FFDE59] text-black">
              REAL DATA EXPORTS
            </span>
            <span className="sticker-tag bg-[#00D06C] text-black">
              AUDIT COMPLIANT
            </span>
          </div>
          <h1 className="font-mono text-2xl sm:text-3xl font-black text-black tracking-tight mt-1 uppercase">
            REPORTS & DATA EXPORTS
          </h1>
          <p className="text-xs sm:text-sm text-zinc-700 font-sans font-medium">
            Real CSV files, styled XLSX Excel spreadsheets, and high-contrast PDF audit reports.
          </p>
        </div>

        {/* Global Export Triggers */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="green" size="sm" onClick={() => handleExport('xlsx')}>
            <FileSpreadsheet className="w-4 h-4 mr-1" /> EXCEL (.XLSX)
          </Button>
          <Button variant="purple" size="sm" onClick={() => handleExport('csv')}>
            <Download className="w-4 h-4 mr-1" /> CSV
          </Button>
          <Button variant="pink" size="sm" onClick={() => handleExport('pdf')}>
            <FileText className="w-4 h-4 mr-1" /> PDF REPORT
          </Button>
        </div>
      </div>

      {/* Report Selection Folder Tabs */}
      <Tabs
        tabs={reportTabs}
        activeTab={selectedReport}
        onChange={(id) => setSelectedReport(id as any)}
      />

      {/* Preview Table Container with Retro Window Chrome */}
      <div className="bg-white border-3 border-black shadow-neo overflow-hidden">
        <div className="bg-[#00D06C] border-b-3 border-black px-4 py-2.5 flex items-center justify-between font-mono text-xs font-black uppercase text-black">
          <div>
            <span>{currentPayload.title}</span>
            <span className="text-[10px] text-zinc-800 ml-2 font-bold">({currentPayload.rows.length} rows)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-white border border-black inline-block text-[7px] leading-none text-center font-bold">_</span>
            <span className="w-2.5 h-2.5 bg-white border border-black inline-block text-[7px] leading-none text-center font-bold">□</span>
            <span className="w-2.5 h-2.5 bg-white border border-black inline-block text-[7px] leading-none text-center font-bold">✕</span>
          </div>
        </div>

        <div className="overflow-x-auto p-4 bg-[#FCFAF5]">
          <table className="w-full text-left text-xs font-mono border-2 border-black bg-white shadow-neo-sm">
            <thead className="bg-[#FAF7EE] border-b-2 border-black text-black uppercase font-black">
              <tr>
                {currentPayload.headers.map((h, i) => (
                  <th key={i} className="py-2.5 px-3 whitespace-nowrap border-r border-black/20">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black/10">
              {currentPayload.rows.length === 0 ? (
                <tr>
                  <td colSpan={currentPayload.headers.length} className="py-8 text-center text-zinc-600 font-bold">
                    No data records matching criteria.
                  </td>
                </tr>
              ) : (
                currentPayload.rows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-[#FFFDF5]">
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="py-2.5 px-3 text-black font-bold whitespace-nowrap border-r border-black/10">
                        {String(cell)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-black font-mono text-sm font-bold">Loading Reports & Analytics...</div>}>
      <ReportsContent />
    </Suspense>
  );
}
