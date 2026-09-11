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
import { getAttendanceStatusStyle } from '@/lib/utils';
import { useAuth } from '@/lib/context/AuthContext';
import { toast } from 'sonner';
import {
  CalendarCheck,
  Search,
  CheckCircle2,
  XCircle,
  Home,
  Download,
  AlertTriangle,
  Edit,
  Sparkles,
  ChevronLeft,
  ChevronRight,
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
      <div className="bg-white border-3 border-black p-5 sm:p-6 shadow-neo flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="sticker-tag bg-[#8B5CF6] text-white">
              BIOMETRIC & MANUAL
            </span>
            <span className="sticker-tag bg-[#00D06C] text-black">
              LIVE MATRIX
            </span>
          </div>
          <h1 className="font-mono text-2xl sm:text-3xl font-black text-black tracking-tight mt-1 uppercase">
            ATTENDANCE MANAGEMENT
          </h1>
          <p className="text-xs sm:text-sm text-zinc-700 font-sans font-medium">
            Daily check-ins, monthly matrix calendar, leave synchronization, and audited corrections.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center border-2 border-black bg-white shadow-neo-sm">
            <button
              onClick={() => setViewMode('today')}
              className={`h-9 px-3 font-mono font-bold text-xs cursor-pointer border-r-2 border-black ${
                viewMode === 'today' ? 'bg-[#00D06C] text-black font-black' : 'text-black hover:bg-[#FAF7EE]'
              }`}
            >
              TODAY ({selectedDate})
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`h-9 px-3 font-mono font-bold text-xs cursor-pointer border-r-2 border-black ${
                viewMode === 'matrix' ? 'bg-[#00D06C] text-black font-black' : 'text-black hover:bg-[#FAF7EE]'
              }`}
            >
              MONTHLY MATRIX
            </button>
            <button
              onClick={() => setViewMode('exceptions')}
              className={`h-9 px-3 font-mono font-bold text-xs cursor-pointer ${
                viewMode === 'exceptions' ? 'bg-[#FF4365] text-white font-black' : 'text-black hover:bg-[#FAF7EE]'
              }`}
            >
              EXCEPTIONS ({exceptionsData.missingAttendance.length + exceptionsData.absences.length})
            </button>
          </div>

          <Button variant="white" size="sm" onClick={() => handleExportAttendance('xlsx')}>
            <Download className="w-4 h-4 mr-1" /> Export
          </Button>
        </div>
      </div>

      {/* VIEW 1: TODAY'S ATTENDANCE */}
      {viewMode === 'today' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white border-3 border-black p-4 shadow-neo flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-44 h-9 text-xs"
              />
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-black absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search employee..."
                  className="w-full bg-[#FCFAF5] border-2 border-black text-black pl-9 pr-3.5 py-1.5 font-mono text-xs focus:outline-hidden shadow-[2px_2px_0px_#000]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-white border-2 border-black text-black px-2.5 py-1.5 font-mono text-xs font-bold cursor-pointer focus:outline-hidden shadow-[2px_2px_0px_#000]"
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
                className="bg-white border-2 border-black text-black px-2.5 py-1.5 font-mono text-xs font-bold cursor-pointer focus:outline-hidden shadow-[2px_2px_0px_#000]"
              >
                <option value="all">ALL STATUSES</option>
                <option value="present">PRESENT</option>
                <option value="work_from_home">WFH</option>
                <option value="leave">LEAVE</option>
                <option value="half_day">HALF DAY</option>
                <option value="absent">ABSENT</option>
                <option value="unmarked">UNMARKED</option>
              </select>

              <Button variant="purple" size="sm" onClick={() => setIsBulkMarkModalOpen(true)}>
                <Sparkles className="w-3.5 h-3.5 mr-1" /> Bulk Mark
              </Button>
            </div>
          </div>

          {/* Today Attendance Table with Retro Window Header */}
          <div className="bg-white border-3 border-black shadow-neo overflow-hidden">
            <div className="bg-[#FFDE59] border-b-3 border-black px-4 py-2 flex items-center justify-between font-mono text-xs font-black uppercase text-black">
              <span>DAILY ATTENDANCE LOG — {selectedDate}</span>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-white border border-black inline-block text-[7px] leading-none text-center font-bold">_</span>
                <span className="w-2.5 h-2.5 bg-white border border-black inline-block text-[7px] leading-none text-center font-bold">□</span>
                <span className="w-2.5 h-2.5 bg-white border border-black inline-block text-[7px] leading-none text-center font-bold">✕</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#FAF7EE] border-b-2 border-black text-black uppercase font-black">
                  <tr>
                    <th className="py-3 px-4">EMPLOYEE</th>
                    <th className="py-3 px-4">DEPARTMENT</th>
                    <th className="py-3 px-4">STATUS</th>
                    <th className="py-3 px-4">CHECK-IN</th>
                    <th className="py-3 px-4">SOURCE / AUDIT</th>
                    <th className="py-3 px-4 text-right">QUICK MARK / CORRECT</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black/10">
                  {unifiedTodayList.map(({ person, record, status }) => {
                    const style = getAttendanceStatusStyle(status);
                    return (
                      <tr key={person.id} className="hover:bg-[#FFFDF5] transition-colors group">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 bg-[#FFDE59] border-2 border-black flex items-center justify-center font-black text-xs text-black shadow-neo-sm">
                              {person.full_name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-black text-black block">{person.full_name}</span>
                              <span className="text-[10px] text-zinc-600 font-bold">{person.person_code}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-black font-bold">
                          {person.department?.name || 'General'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] px-2 py-0.5 border-2 border-black font-black uppercase ${style.bg} ${style.text}`}>
                            {style.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-black font-bold">
                          {record?.check_in_at ? `${record.check_in_at} - ${record.check_out_at || 'Present'}` : '—'}
                        </td>
                        <td className="py-3.5 px-4">
                          {record?.corrected ? (
                            <span className="text-[#FF4365] block text-[10px] font-black">
                              CORRECTED: {record.correction_reason}
                            </span>
                          ) : (
                            <span className="text-zinc-600 text-[10px] uppercase font-bold">
                              {record?.source || 'NOT MARKED'}
                            </span>
                          )}
                          {record?.notes && <div className="text-zinc-700 text-[10px]">{record.notes}</div>}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="green"
                              size="sm"
                              onClick={() => handleQuickMark(person.id, 'present')}
                              className="h-7 px-2"
                              title="Mark Present"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Present
                            </Button>
                            <Button
                              variant="purple"
                              size="sm"
                              onClick={() => handleQuickMark(person.id, 'work_from_home')}
                              className="h-7 px-2"
                              title="Mark WFH"
                            >
                              <Home className="w-3.5 h-3.5 mr-1" /> WFH
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleQuickMark(person.id, 'absent')}
                              className="h-7 px-2"
                              title="Mark Absent"
                            >
                              <XCircle className="w-3.5 h-3.5 mr-1" /> Absent
                            </Button>
                            {canCorrectAttendance && (
                              <Button
                                variant="white"
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
        </div>
      )}

      {/* VIEW 2: MONTHLY MATRIX */}
      {viewMode === 'matrix' && (
        <div className="space-y-4">
          <div className="bg-white border-3 border-black p-4 shadow-neo flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Button
                variant="white"
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
              <h3 className="font-mono text-base font-black text-black">
                {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' }).toUpperCase()} {selectedYear}
              </h3>
              <Button
                variant="white"
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
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold flex-wrap">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-[#00D06C] border border-black" /> Present (P)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-[#8B5CF6] border border-black" /> WFH (W)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-[#38BDF8] border border-black" /> Leave (L)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-[#FF4365] border border-black" /> Absent (A)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-[#FFDE59] border border-black" /> Holiday (H)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-[#F2EBDC] border border-black" /> Week Off (WO)
              </span>
            </div>
          </div>

          <div className="bg-white border-3 border-black shadow-neo overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead className="bg-[#FAF7EE] border-b-2 border-black text-black font-black">
                <tr>
                  <th className="py-2.5 px-3 sticky left-0 bg-[#FAF7EE] z-10 border-r-2 border-black w-48">
                    EMPLOYEE
                  </th>
                  {Array.from({ length: monthlyData.daysInMonth }, (_, i) => i + 1).map((day) => (
                    <th key={day} className="py-2 px-1 text-center font-mono text-[10px] w-8 min-w-[28px] border-r border-black/20">
                      {day}
                    </th>
                  ))}
                  <th className="py-2.5 px-3 border-l-2 border-black text-center font-black text-black">
                    PRESENT / WORK DAYS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black/10">
                {monthlyData.matrix.map(({ person, dayMap, summary }) => (
                  <tr key={person.id} className="hover:bg-[#FFFDF5]">
                    <td className="py-2.5 px-3 sticky left-0 bg-white group-hover:bg-[#FFFDF5] z-10 border-r-2 border-black truncate max-w-[190px]">
                      <div className="font-black text-black truncate">{person.full_name}</div>
                      <div className="text-[10px] text-zinc-600 font-bold">{person.person_code}</div>
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
                        <td key={day} className="p-0.5 text-center border-r border-black/10">
                          <div
                            className={`w-6 h-6 mx-auto flex items-center justify-center font-black text-[9px] border-2 border-black ${style.bg} ${style.text}`}
                            title={`Day ${day}: ${dayVal?.status}`}
                          >
                            {letterMap[dayVal?.status || ''] || '—'}
                          </div>
                        </td>
                      );
                    })}
                    <td className="py-2.5 px-3 border-l-2 border-black text-center font-mono font-black text-black bg-[#E8FBF0]">
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
            <div className="bg-white border-3 border-black p-5 shadow-neo space-y-4">
              <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#FFDE59]" />
                  <h3 className="font-mono text-sm font-black uppercase text-black">
                    UNMARKED TODAY ({exceptionsData.missingAttendance.length})
                  </h3>
                </div>
              </div>

              <div className="space-y-2">
                {exceptionsData.missingAttendance.length === 0 ? (
                  <div className="p-6 text-center text-zinc-600 font-mono text-xs font-bold">
                    All employees have been marked for today.
                  </div>
                ) : (
                  exceptionsData.missingAttendance.map((p) => (
                    <div key={p.id} className="p-3 bg-[#FAF7EE] border-2 border-black shadow-neo-sm flex items-center justify-between">
                      <div>
                        <div className="font-mono text-xs font-black text-black">{p.full_name}</div>
                        <div className="text-[10px] text-zinc-600 font-bold">{p.person_code} • {p.department?.name}</div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button variant="green" size="sm" onClick={() => handleQuickMark(p.id, 'present')}>
                          Mark Present
                        </Button>
                        <Button variant="purple" size="sm" onClick={() => handleQuickMark(p.id, 'work_from_home')}>
                          WFH
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Unplanned Absences Panel */}
            <div className="bg-white border-3 border-black p-5 shadow-neo space-y-4">
              <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-[#FF4365]" />
                  <h3 className="font-mono text-sm font-black uppercase text-black">
                    UNPLANNED ABSENCES ({exceptionsData.absences.length})
                  </h3>
                </div>
              </div>

              <div className="space-y-2">
                {exceptionsData.absences.length === 0 ? (
                  <div className="p-6 text-center text-zinc-600 font-mono text-xs font-bold">
                    No unplanned absences recorded for today.
                  </div>
                ) : (
                  exceptionsData.absences.map((rec) => (
                    <div key={rec.id} className="p-3 bg-[#FFF0F3] border-2 border-black shadow-neo-sm flex items-center justify-between">
                      <div>
                        <div className="font-mono text-xs font-black text-black">{rec.person_name}</div>
                        <div className="text-[10px] text-zinc-600 font-bold">Notes: {rec.notes || 'Unexcused'}</div>
                      </div>
                      <Button
                        variant="white"
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

      {/* MODAL 1: ATTENDANCE CORRECTION */}
      <Modal
        isOpen={isCorrectionModalOpen}
        onClose={() => setIsCorrectionModalOpen(false)}
        title="AUDITED ATTENDANCE CORRECTION"
        subtitle="Mandatory reason required. Generates permanent before/after audit trail."
        headerColor="purple"
        maxWidth="lg"
        footer={
          <>
            <Button variant="white" size="sm" onClick={() => setIsCorrectionModalOpen(false)}>
              CANCEL
            </Button>
            <Button variant="purple" size="sm" onClick={handleCorrectionSubmit}>
              COMMIT CORRECTION
            </Button>
          </>
        }
      >
        <form onSubmit={handleCorrectionSubmit} className="space-y-4 font-mono text-xs">
          <div className="p-3 bg-[#FAF7EE] border-2 border-black space-y-1">
            <div className="text-zinc-600 font-bold">
              EMPLOYEE: <span className="text-black font-black">{correctionTarget?.personName}</span>
            </div>
            <div className="text-zinc-600 font-bold">
              DATE: <span className="text-black font-black">{correctionTarget?.date}</span>
            </div>
            <div className="text-zinc-600 font-bold">
              CURRENT RECORD: <span className="text-[#8B5CF6] font-black">{correctionTarget?.currentStatus.toUpperCase()}</span>
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
        headerColor="green"
        maxWidth="md"
        footer={
          <>
            <Button variant="white" size="sm" onClick={() => setIsBulkMarkModalOpen(false)}>
              CANCEL
            </Button>
            <Button variant="green" size="sm" onClick={handleBulkMarkConfirm}>
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
          <p className="text-zinc-700 text-xs font-sans font-medium">
            This will create attendance entries for all active employees who do not yet have an attendance record for {selectedDate}.
          </p>
        </div>
      </Modal>
    </div>
  );
}
