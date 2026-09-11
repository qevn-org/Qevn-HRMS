'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { reportService } from '@/lib/services/reportService';
import { peopleService } from '@/lib/services/peopleService';
import { attendanceService } from '@/lib/services/attendanceService';
import { leaveService } from '@/lib/services/leaveService';
import { documentService } from '@/lib/services/documentService';
import { onboardingService } from '@/lib/services/onboardingService';
import { exportService, ExportDataPayload } from '@/lib/services/exportService';
import { settingsService } from '@/lib/services/settingsService';
import { hrmsStore } from '@/lib/services/store';
import { Department, Person, LeaveRequest } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/lib/context/AuthContext';
import { toast } from 'sonner';
import {
  BarChart3,
  FileSpreadsheet,
  Download,
  FileText,
  Users,
  CalendarCheck,
  CalendarDays,
  ShieldCheck,
  Clock,
  Sparkles,
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
      <div className="bg-[#121218] border-2 border-[#262636] p-4 sm:p-5 shadow-neo flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#CCFF00]" />
            <span className="font-mono text-xs font-bold uppercase text-[#CCFF00] tracking-wider">
              ENTERPRISE REPORTING & EXPORT ENGINE
            </span>
          </div>
          <h1 className="font-mono text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
            REPORTS & DATA EXPORTS
          </h1>
          <p className="text-xs text-zinc-400 font-sans">
            Real CSV, styled XLSX Excel spreadsheets, and high-contrast PDF audit reports.
          </p>
        </div>

        {/* Global Export Triggers */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="primary" size="sm" onClick={() => handleExport('xlsx')}>
            <FileSpreadsheet className="w-4 h-4 mr-1" /> EXCEL (.XLSX)
          </Button>
          <Button variant="secondary" size="sm" onClick={() => handleExport('csv')}>
            <Download className="w-4 h-4 mr-1" /> CSV
          </Button>
          <Button variant="cyan" size="sm" onClick={() => handleExport('pdf')}>
            <FileText className="w-4 h-4 mr-1" /> PDF REPORT
          </Button>
        </div>
      </div>

      {/* Report Selection Tabs */}
      <Tabs
        tabs={reportTabs}
        activeTab={selectedReport}
        onChange={(id) => setSelectedReport(id as any)}
      />

      {/* Preview Table Container */}
      <div className="bg-[#121218] border-2 border-[#262636] shadow-neo p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#262636]">
          <div>
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
              {currentPayload.title}
            </h3>
            <p className="text-xs text-zinc-400">Live preview of dataset ({currentPayload.rows.length} rows)</p>
          </div>
          <span className="text-[10px] font-mono text-[#CCFF00] font-bold">
            PERMISSION AUDIT VERIFIED
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#171722] border-b-2 border-[#262636] text-zinc-400 uppercase">
              <tr>
                {currentPayload.headers.map((h, i) => (
                  <th key={i} className="py-2.5 px-3 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#22222E]">
              {currentPayload.rows.length === 0 ? (
                <tr>
                  <td colSpan={currentPayload.headers.length} className="py-8 text-center text-zinc-500">
                    No data records matching criteria.
                  </td>
                </tr>
              ) : (
                currentPayload.rows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-[#1A1A26]">
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="py-2.5 px-3 text-zinc-300 whitespace-nowrap">
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
    <Suspense fallback={<div className="p-8 text-center text-zinc-500 font-mono text-sm">Loading Reports & Analytics...</div>}>
      <ReportsContent />
    </Suspense>
  );
}
