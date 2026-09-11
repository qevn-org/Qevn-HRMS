'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { attendanceService } from '@/lib/services/attendanceService';
import { settingsService } from '@/lib/services/settingsService';
import { peopleService } from '@/lib/services/peopleService';
import { exportService } from '@/lib/services/exportService';
import { hrmsStore } from '@/lib/services/store';
import { AttendanceRecord, AttendanceStatusType, Department, Person } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/FormControls';
import { getAttendanceStatusStyle, formatDate } from '@/lib/utils';
import { useAuth } from '@/lib/context/AuthContext';
import { toast } from 'sonner';
import {
  CalendarCheck,
  CalendarDays,
  Search,
  CheckCircle2,
  XCircle,
  Home,
  Clock,
  Download,
  AlertTriangle,
  Edit,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

export default function AttendancePage() {
  const { canCorrectAttendance, user } = useAuth();

  const [viewMode, setViewMode] = useState<'today' | 'matrix' | 'exceptions'>('today');
  const [selectedDate, setSelectedDate] = useState('2026-09-11');
  const [selectedMonth, setSelectedMonth] = useState(9); // September
  const [selectedYear, setSelectedYear] = useState(2026);

  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [activePersons, setActivePersons] = useState<Person[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Correction Modal
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [correctionTarget, setCorrectionTarget] = useState<{
    recordId?: string;
    personId: string;
    personName: string;
    date: string;
    currentStatus: AttendanceStatusType;
  } | null>(null);
  const [newStatus, setNewStatus] = useState<AttendanceStatusType>('present');
  const [correctionReason, setCorrectionReason] = useState('');
  const [correctionNotes, setCorrectionNotes] = useState('');

  // Bulk Mark Modal
  const [isBulkMarkModalOpen, setIsBulkMarkModalOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<AttendanceStatusType>('present');

  useEffect(() => {
    loadAttendanceData();
    const unsubscribe = hrmsStore.subscribe(() => {
      loadAttendanceData();
    });
    return unsubscribe;
  }, [selectedDate, selectedMonth, selectedYear]);

  const loadAttendanceData = () => {
    hrmsStore.init();
    const records = attendanceService.getAttendanceForDate(selectedDate);
    const depts = settingsService.getDepartments();
    const persons = peopleService.getAllPersons().filter((p) => p.is_active);

    setAttendanceList(records);
    setDepartments(depts);
    setActivePersons(persons);
  };

  // Full unified list for Today (includes marked and unmarked)
  const unifiedTodayList = useMemo(() => {
    const recordedMap = new Map<string, AttendanceRecord>();
    attendanceList.forEach((r) => recordedMap.set(r.person_id, r));

    let list = activePersons.map((p) => {
      const record = recordedMap.get(p.id);
      return {
        person: p,
        record: record || null,
        status: (record?.status || 'unmarked') as AttendanceStatusType | 'unmarked',
      };
    });

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.person.full_name.toLowerCase().includes(q) ||
          item.person.person_code.toLowerCase().includes(q) ||
          item.person.designation?.name.toLowerCase().includes(q)
      );
    }

    if (selectedDept !== 'all') {
      list = list.filter((item) => item.person.department_id === selectedDept);
    }

    if (selectedStatus !== 'all') {
      list = list.filter((item) => item.status === selectedStatus);
    }

    return list;
  }, [activePersons, attendanceList, searchQuery, selectedDept, selectedStatus]);

  // Monthly Matrix Data
  const monthlyData = useMemo(() => {
    return attendanceService.getMonthlyMatrix(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth, attendanceList]);

  // Exceptions Data
  const exceptionsData = useMemo(() => {
    return attendanceService.getAttendanceExceptions(selectedDate);
  }, [selectedDate, attendanceList, activePersons]);

  // Mark single person status
  const handleQuickMark = (personId: string, status: AttendanceStatusType) => {
    attendanceService.markAttendance(
      {
        person_id: personId,
        attendance_date: selectedDate,
        status,
        check_in_at: status === 'present' ? '09:00' : null,
        source: 'manual',
        corrected: false,
      },
      user.display_name
    );
    toast.success(`Marked as ${status.toUpperCase()}`);
  };

  // Bulk mark
  const handleBulkMarkConfirm = () => {
    const unmarked = unifiedTodayList
      .filter((item) => item.status === 'unmarked' || item.status === 'absent')
      .map((item) => ({
        person_id: item.person.id,
        status: bulkStatus,
        notes: `Bulk marked as ${bulkStatus}`,
      }));

    attendanceService.bulkMarkAttendance(selectedDate, unmarked, user.display_name);
    toast.success(`Bulk marked ${unmarked.length} people as ${bulkStatus.toUpperCase()}`);
    setIsBulkMarkModalOpen(false);
  };

  // Submit Correction with mandatory reason
  const handleCorrectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctionTarget) return;
    if (!correctionReason.trim()) {
      toast.error('Correction reason is mandatory for audit logging');
      return;
    }

    attendanceService.correctAttendance(
      correctionTarget.recordId || '',
      correctionTarget.personId,
      correctionTarget.date,
      newStatus,
      correctionReason,
      correctionNotes,
      user.display_name
    );

    toast.success(`Attendance corrected to ${newStatus.toUpperCase()} (Audit Logged)`);
    setIsCorrectionModalOpen(false);
    setCorrectionTarget(null);
    setCorrectionReason('');
    setCorrectionNotes('');
  };

  const handleExportAttendance = (format: 'csv' | 'xlsx' | 'pdf') => {
    const payload = {
      title: `Attendance Report for ${selectedDate}`,
      filename: `QEVN_Attendance_${selectedDate}`,
      reportCategory: 'attendance',
      headers: ['Person ID', 'Full Name', 'Department', 'Date', 'Status', 'Check-in', 'Source', 'Corrected', 'Notes'],
      rows: unifiedTodayList.map((item) => [
        item.person.person_code,
        item.person.full_name,
        item.person.department?.name || 'General',
        selectedDate,
        item.status.toUpperCase(),
        item.record?.check_in_at || '—',
        item.record?.source || '—',
        item.record?.corrected ? 'YES' : 'NO',
        item.record?.notes || '—',
      ]),
    };

    if (format === 'csv') exportService.exportToCSV(payload, user.display_name);
    else if (format === 'xlsx') exportService.exportToExcel(payload, user.display_name);
    else exportService.exportToPDF(payload, user.display_name);

    toast.success(`Exported attendance report as ${format.toUpperCase()}`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-[#121218] border-2 border-[#262636] p-4 sm:p-5 shadow-neo flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#CCFF00]" />
            <span className="font-mono text-xs font-bold uppercase text-[#CCFF00] tracking-wider">
              TIME & ATTENDANCE ENGINE
            </span>
          </div>
          <h1 className="font-mono text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
            ATTENDANCE MANAGEMENT
          </h1>
          <p className="text-xs text-zinc-400 font-sans">
            Real-time check-ins, monthly matrix, leave synchronization, and audited corrections.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center border-2 border-[#262636] bg-[#0A0A0E]">
            <Button
              variant={viewMode === 'today' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('today')}
              className="h-8 px-3"
            >
              TODAY ({selectedDate})
            </Button>
            <Button
              variant={viewMode === 'matrix' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('matrix')}
              className="h-8 px-3"
            >
              MONTHLY MATRIX
            </Button>
            <Button
              variant={viewMode === 'exceptions' ? 'danger' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('exceptions')}
              className="h-8 px-3"
            >
              EXCEPTIONS ({exceptionsData.missingAttendance.length + exceptionsData.absences.length})
            </Button>
          </div>

          <Button variant="outline" size="sm" onClick={() => handleExportAttendance('xlsx')}>
            <Download className="w-4 h-4 mr-1" /> Export
          </Button>
        </div>
      </div>

      {/* VIEW 1: TODAY'S ATTENDANCE */}
      {viewMode === 'today' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-[#121218] border-2 border-[#262636] p-4 shadow-neo flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-44 h-9 text-xs"
              />
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search employee..."
                  className="w-full bg-[#0A0A0E] border-2 border-[#262636] focus:border-[#CCFF00] text-white pl-9 pr-3.5 py-1.5 font-mono text-xs focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-[#0A0A0E] border-2 border-[#262636] text-white px-2.5 py-1.5 font-mono text-xs cursor-pointer focus:border-[#CCFF00] focus:outline-hidden"
              >
                <option value="all">ALL DEPARTMENTS</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name.toUpperCase()}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-[#0A0A0E] border-2 border-[#262636] text-white px-2.5 py-1.5 font-mono text-xs cursor-pointer focus:border-[#CCFF00] focus:outline-hidden"
              >
                <option value="all">ALL STATUSES</option>
                <option value="present">PRESENT</option>
                <option value="work_from_home">WFH</option>
                <option value="leave">LEAVE</option>
                <option value="half_day">HALF DAY</option>
                <option value="absent">ABSENT</option>
                <option value="unmarked">UNMARKED</option>
              </select>

              <Button variant="secondary" size="sm" onClick={() => setIsBulkMarkModalOpen(true)}>
                <Sparkles className="w-3.5 h-3.5 mr-1" /> Bulk Mark
              </Button>
            </div>
          </div>

          {/* Today Attendance Table */}
          <div className="bg-[#121218] border-2 border-[#262636] shadow-neo overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#171722] border-b-2 border-[#262636] text-zinc-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">EMPLOYEE</th>
                  <th className="py-3 px-4">DEPARTMENT</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4">CHECK-IN</th>
                  <th className="py-3 px-4">SOURCE / AUDIT</th>
                  <th className="py-3 px-4 text-right">QUICK MARK / CORRECT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#22222E]">
                {unifiedTodayList.map(({ person, record, status }) => {
                  const style = getAttendanceStatusStyle(status);
                  return (
                    <tr key={person.id} className="hover:bg-[#1A1A26] transition-colors group">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-[#CCFF00]">
                            {person.full_name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-white block">{person.full_name}</span>
                            <span className="text-[10px] text-zinc-500 font-normal">{person.person_code}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-zinc-300">
                        {person.department?.name || 'General'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] px-2 py-0.5 border ${style.bg} ${style.text} ${style.border} font-bold`}>
                          {style.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-zinc-300">
                        {record?.check_in_at ? `${record.check_in_at} - ${record.check_out_at || 'Present'}` : '—'}
                      </td>
                      <td className="py-3 px-4">
                        {record?.corrected ? (
                          <span className="text-amber-400 block text-[10px] font-bold">
                            CORRECTED: {record.correction_reason}
                          </span>
                        ) : (
                          <span className="text-zinc-500 text-[10px] uppercase">
                            {record?.source || 'NOT MARKED'}
                          </span>
                        )}
                        {record?.notes && <div className="text-zinc-400 text-[10px]">{record.notes}</div>}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuickMark(person.id, 'present')}
                            className="h-7 px-2 text-[#CCFF00] hover:bg-[#CCFF00]/10"
                            title="Mark Present"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Present
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuickMark(person.id, 'work_from_home')}
                            className="h-7 px-2 text-[#8B5CF6] hover:bg-[#8B5CF6]/10"
                            title="Mark WFH"
                          >
                            <Home className="w-3.5 h-3.5 mr-1" /> WFH
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuickMark(person.id, 'absent')}
                            className="h-7 px-2 text-[#F43F5E] hover:bg-[#F43F5E]/10"
                            title="Mark Absent"
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Absent
                          </Button>
                          {canCorrectAttendance && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setCorrectionTarget({
                                  recordId: record?.id,
                                  personId: person.id,
                                  personName: person.full_name,
                                  date: selectedDate,
                                  currentStatus: (record?.status || 'present') as AttendanceStatusType,
                                });
                                setNewStatus((record?.status || 'present') as AttendanceStatusType);
                                setIsCorrectionModalOpen(true);
                              }}
                              className="h-7 px-2"
                              title="Audit Correct"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: MONTHLY MATRIX */}
      {viewMode === 'matrix' && (
        <div className="space-y-4">
          <div className="bg-[#121218] border-2 border-[#262636] p-4 shadow-neo flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedMonth === 1) {
                    setSelectedMonth(12);
                    setSelectedYear(selectedYear - 1);
                  } else {
                    setSelectedMonth(selectedMonth - 1);
                  }
                }}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Prev
              </Button>
              <h3 className="font-mono text-base font-black text-white">
                {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' }).toUpperCase()} {selectedYear}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedMonth === 12) {
                    setSelectedMonth(1);
                    setSelectedYear(selectedYear + 1);
                  } else {
                    setSelectedMonth(selectedMonth + 1);
                  }
                }}
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 text-[10px] font-mono flex-wrap">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-[#CCFF00]" /> Present (P)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-[#8B5CF6]" /> WFH (W)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-blue-600" /> Leave (L)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-rose-600" /> Absent (A)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-teal-700" /> Holiday (H)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-zinc-800 border border-zinc-700" /> Week Off (WO)
              </span>
            </div>
          </div>

          <div className="bg-[#121218] border-2 border-[#262636] shadow-neo overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead className="bg-[#171722] border-b-2 border-[#262636] text-zinc-400">
                <tr>
                  <th className="py-2.5 px-3 sticky left-0 bg-[#171722] z-10 border-r border-[#262636] w-48">
                    EMPLOYEE
                  </th>
                  {Array.from({ length: monthlyData.daysInMonth }, (_, i) => i + 1).map((day) => (
                    <th key={day} className="py-2 px-1 text-center font-mono text-[10px] w-8 min-w-[28px]">
                      {day}
                    </th>
                  ))}
                  <th className="py-2.5 px-3 border-l border-[#262636] text-center font-bold text-white">
                    PRESENT / WORK DAYS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#22222E]">
                {monthlyData.matrix.map(({ person, dayMap, summary }) => (
                  <tr key={person.id} className="hover:bg-[#1A1A26]">
                    <td className="py-2.5 px-3 sticky left-0 bg-[#121218] group-hover:bg-[#1A1A26] z-10 border-r border-[#262636] truncate max-w-[190px]">
                      <div className="font-bold text-white truncate">{person.full_name}</div>
                      <div className="text-[10px] text-zinc-500 font-normal">{person.person_code}</div>
                    </td>
                    {Array.from({ length: monthlyData.daysInMonth }, (_, i) => i + 1).map((day) => {
                      const dayVal = dayMap[day];
                      const style = getAttendanceStatusStyle(dayVal?.status);
                      const letterMap: Record<string, string> = {
                        present: 'P',
                        work_from_home: 'W',
                        leave: 'L',
                        absent: 'A',
                        half_day: 'HD',
                        holiday: 'H',
                        week_off: 'WO',
                      };
                      return (
                        <td key={day} className="p-0.5 text-center">
                          <div
                            className={`w-6 h-6 mx-auto flex items-center justify-center font-bold text-[9px] border ${style.bg} ${style.text} ${style.border}`}
                            title={`Day ${day}: ${dayVal?.status}`}
                          >
                            {letterMap[dayVal?.status || ''] || '—'}
                          </div>
                        </td>
                      );
                    })}
                    <td className="py-2.5 px-3 border-l border-[#262636] text-center font-mono font-bold text-[#CCFF00]">
                      {summary.presentCount} / {summary.totalWorkingDays}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: EXCEPTIONS PANEL */}
      {viewMode === 'exceptions' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Unmarked Attendance Panel */}
            <div className="bg-[#121218] border-2 border-[#262636] p-5 shadow-neo space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#262636]">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
                  <h3 className="font-mono text-sm font-bold uppercase text-white">
                    UNMARKED TODAY ({exceptionsData.missingAttendance.length})
                  </h3>
                </div>
              </div>

              <div className="space-y-2">
                {exceptionsData.missingAttendance.length === 0 ? (
                  <div className="p-6 text-center text-zinc-500 font-mono text-xs">
                    All employees have been marked for today.
                  </div>
                ) : (
                  exceptionsData.missingAttendance.map((p) => (
                    <div key={p.id} className="p-3 bg-[#0D0D12] border border-[#262636] flex items-center justify-between">
                      <div>
                        <div className="font-mono text-xs font-bold text-white">{p.full_name}</div>
                        <div className="text-[10px] text-zinc-500">{p.person_code} • {p.department?.name}</div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button variant="primary" size="sm" onClick={() => handleQuickMark(p.id, 'present')}>
                          Mark Present
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => handleQuickMark(p.id, 'work_from_home')}>
                          WFH
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Unplanned Absences Panel */}
            <div className="bg-[#121218] border-2 border-[#262636] p-5 shadow-neo space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#262636]">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-[#F43F5E]" />
                  <h3 className="font-mono text-sm font-bold uppercase text-white">
                    UNPLANNED ABSENCES ({exceptionsData.absences.length})
                  </h3>
                </div>
              </div>

              <div className="space-y-2">
                {exceptionsData.absences.length === 0 ? (
                  <div className="p-6 text-center text-zinc-500 font-mono text-xs">
                    No unplanned absences recorded for today.
                  </div>
                ) : (
                  exceptionsData.absences.map((rec) => (
                    <div key={rec.id} className="p-3 bg-[#0D0D12] border border-rose-500/40 flex items-center justify-between">
                      <div>
                        <div className="font-mono text-xs font-bold text-white">{rec.person_name}</div>
                        <div className="text-[10px] text-zinc-400">Notes: {rec.notes || 'Unexcused'}</div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCorrectionTarget({
                            recordId: rec.id,
                            personId: rec.person_id,
                            personName: rec.person_name || '',
                            date: selectedDate,
                            currentStatus: 'absent',
                          });
                          setIsCorrectionModalOpen(true);
                        }}
                      >
                        CORRECT ENTRY
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ATTENDANCE CORRECTION (MANDATORY REASON + AUDIT) */}
      <Modal
        isOpen={isCorrectionModalOpen}
        onClose={() => setIsCorrectionModalOpen(false)}
        title="AUDITED ATTENDANCE CORRECTION"
        subtitle="Mandatory reason required. Generates permanent before/after audit trail."
        maxWidth="lg"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsCorrectionModalOpen(false)}>
              CANCEL
            </Button>
            <Button variant="primary" size="sm" onClick={handleCorrectionSubmit}>
              COMMIT CORRECTION
            </Button>
          </>
        }
      >
        <form onSubmit={handleCorrectionSubmit} className="space-y-4 font-mono text-xs">
          <div className="p-3 bg-[#0D0D12] border border-[#262636] space-y-1">
            <div className="text-zinc-400">
              EMPLOYEE: <span className="text-white font-bold">{correctionTarget?.personName}</span>
            </div>
            <div className="text-zinc-400">
              DATE: <span className="text-white font-bold">{correctionTarget?.date}</span>
            </div>
            <div className="text-zinc-400">
              CURRENT RECORD: <span className="text-[#CCFF00] font-bold">{correctionTarget?.currentStatus.toUpperCase()}</span>
            </div>
          </div>

          <Select
            label="Corrected Attendance Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as AttendanceStatusType)}
            options={[
              { value: 'present', label: 'PRESENT (In Office)' },
              { value: 'work_from_home', label: 'WORK FROM HOME (Approved)' },
              { value: 'half_day', label: 'HALF DAY' },
              { value: 'leave', label: 'LEAVE / TIME OFF' },
              { value: 'absent', label: 'ABSENT' },
            ]}
          />

          <Input
            label="Mandatory Reason for Correction"
            required
            placeholder="e.g. Employee forgot punch, client off-site meeting..."
            value={correctionReason}
            onChange={(e) => setCorrectionReason(e.target.value)}
          />

          <Textarea
            label="Additional Notes / Evidence"
            placeholder="Optional notes or ticket reference..."
            value={correctionNotes}
            onChange={(e) => setCorrectionNotes(e.target.value)}
          />
        </form>
      </Modal>

      {/* MODAL 2: BULK MARK */}
      <Modal
        isOpen={isBulkMarkModalOpen}
        onClose={() => setIsBulkMarkModalOpen(false)}
        title="BULK MARK TODAY'S ATTENDANCE"
        subtitle={`Applies status to all currently unmarked employees for ${selectedDate}`}
        maxWidth="md"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsBulkMarkModalOpen(false)}>
              CANCEL
            </Button>
            <Button variant="primary" size="sm" onClick={handleBulkMarkConfirm}>
              CONFIRM BULK MARK
            </Button>
          </>
        }
      >
        <div className="space-y-3 font-mono text-xs">
          <Select
            label="Target Status for Unmarked People"
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value as AttendanceStatusType)}
            options={[
              { value: 'present', label: 'PRESENT' },
              { value: 'work_from_home', label: 'WORK FROM HOME' },
            ]}
          />
          <p className="text-zinc-400 text-xs font-sans">
            This will create attendance entries for all active employees who do not yet have an attendance record for {selectedDate}.
          </p>
        </div>
      </Modal>
    </div>
  );
}
