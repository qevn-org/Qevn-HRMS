'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { leaveService } from '@/lib/services/leaveService';
import { peopleService } from '@/lib/services/peopleService';
import { settingsService } from '@/lib/services/settingsService';
import { exportService } from '@/lib/services/exportService';
import { hrmsStore } from '@/lib/services/store';
import {
  LeaveRequest,
  LeaveBalance,
  LeaveType,
  Holiday,
  Person,
} from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Tabs } from '@/components/ui/Tabs';
import { Input, Select, Textarea } from '@/components/ui/FormControls';
import { getLeaveStatusStyle, formatDate } from '@/lib/utils';
import { useAuth } from '@/lib/context/AuthContext';
import { toast } from 'sonner';
import {
  CalendarDays,
  Plus,
  CheckCircle,
  XCircle,
  HelpCircle,
  Sparkles,
  Download,
  Calendar as CalendarIcon,
} from 'lucide-react';

function LeaveContent() {
  const searchParams = useSearchParams();
  const { canApproveLeave, user, isEmployeeViewOnly } = useAuth();

  const [activeTab, setActiveTab] = useState('requests');
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>('all');

  // Modals
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [isAddHolidayModalOpen, setIsAddHolidayModalOpen] = useState(false);

  // Decision Target
  const [decisionTarget, setDecisionTarget] = useState<{
    request: LeaveRequest;
    decision: 'approved' | 'rejected' | 'clarification_required';
  } | null>(null);
  const [decisionComment, setDecisionComment] = useState('');

  // Submit Leave Request Form
  const [requestFormData, setRequestFormData] = useState({
    person_id: '',
    leave_type_id: '',
    start_date: '2026-09-18',
    end_date: '2026-09-18',
    is_half_day: false,
    reason: '',
  });

  // Add Holiday Form
  const [holidayFormData, setHolidayFormData] = useState({
    name: '',
    holiday_date: '2026-10-02',
    is_optional: false,
  });

  useEffect(() => {
    loadLeaveData();
    const unsubscribe = hrmsStore.subscribe(() => {
      loadLeaveData();
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'new') {
      setIsRequestModalOpen(true);
    }
    const statusParam = searchParams.get('status');
    if (statusParam) {
      setStatusFilter(statusParam);
    }
  }, [searchParams]);

  const loadLeaveData = () => {
    hrmsStore.init();
    const requests = leaveService.getAllLeaveRequests();
    const types = leaveService.getLeaveTypes();
    const balances = hrmsStore.getLeaveBalances();
    const hols = leaveService.getHolidayCalendar(2026);
    const allPersons = peopleService.getAllPersons().filter((p) => p.is_active);

    setLeaveRequests(requests);
    setLeaveTypes(types);
    setLeaveBalances(balances);
    setHolidays(hols);
    setPersons(allPersons);

    if (allPersons.length > 0 && !requestFormData.person_id) {
      setRequestFormData((prev) => ({
        ...prev,
        person_id: user.person_id || allPersons[0].id,
        leave_type_id: types[0]?.id || '',
      }));
    }
  };

  // Calculate live working days duration
  const calculatedDuration = useMemo(() => {
    return leaveService.calculateWorkingDays(
      requestFormData.start_date,
      requestFormData.end_date,
      requestFormData.is_half_day
    );
  }, [requestFormData.start_date, requestFormData.end_date, requestFormData.is_half_day]);

  // Filtered requests list
  const filteredRequests = useMemo(() => {
    return leaveRequests.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (leaveTypeFilter !== 'all' && r.leave_type_id !== leaveTypeFilter) return false;
      return true;
    });
  }, [leaveRequests, statusFilter, leaveTypeFilter]);

  // Submit Leave Request
  const handleSubmitLeaveRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestFormData.reason.trim()) {
      toast.error('Please enter a reason for your leave request');
      return;
    }

    try {
      leaveService.submitRequest(
        {
          person_id: requestFormData.person_id,
          leave_type_id: requestFormData.leave_type_id,
          start_date: requestFormData.start_date,
          end_date: requestFormData.end_date,
          duration_days: calculatedDuration,
          is_half_day: requestFormData.is_half_day,
          reason: requestFormData.reason,
        },
        user.display_name
      );

      toast.success(`Submitted leave request for ${calculatedDuration} day(s)`);
      setIsRequestModalOpen(false);
      setRequestFormData((prev) => ({ ...prev, reason: '' }));
    } catch {
      toast.error('Failed to submit leave request');
    }
  };

  // Open Decision Modal
  const openDecisionModal = (request: LeaveRequest, decision: 'approved' | 'rejected' | 'clarification_required') => {
    setDecisionTarget({ request, decision });
    setDecisionComment('');
    setIsDecisionModalOpen(true);
  };

  // Commit Decision with Attendance Synchronization
  const handleDecisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!decisionTarget) return;

    if (decisionTarget.decision === 'approved') {
      leaveService.approveRequest(decisionTarget.request.id, decisionComment, user.display_name);
      toast.success(`Leave approved! Attendance automatically synchronized.`);
    } else if (decisionTarget.decision === 'rejected') {
      leaveService.rejectRequest(decisionTarget.request.id, decisionComment, user.display_name);
      toast.error(`Leave request rejected.`);
    } else {
      leaveService.requestClarification(decisionTarget.request.id, decisionComment, user.display_name);
      toast.info(`Clarification requested from employee.`);
    }

    setIsDecisionModalOpen(false);
    setDecisionTarget(null);
  };

  // Add Holiday Submit
  const handleAddHolidaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!holidayFormData.name || !holidayFormData.holiday_date) return;

    leaveService.addHoliday(holidayFormData, user.display_name);
    toast.success(`Added holiday: ${holidayFormData.name}`);
    setIsAddHolidayModalOpen(false);
    setHolidayFormData({ name: '', holiday_date: '2026-10-02', is_optional: false });
  };

  // Export
  const handleExportLeave = (format: 'csv' | 'xlsx' | 'pdf') => {
    const payload = {
      title: 'Leave Requests & Approvals Log',
      filename: 'QEVN_Leave_Log',
      reportCategory: 'leave',
      headers: ['Employee ID', 'Full Name', 'Leave Type', 'Start Date', 'End Date', 'Days', 'Status', 'Reason', 'Manager Notes'],
      rows: filteredRequests.map((r) => [
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

    if (format === 'csv') exportService.exportToCSV(payload, user.display_name);
    else if (format === 'xlsx') exportService.exportToExcel(payload, user.display_name);
    else exportService.exportToPDF(payload, user.display_name);

    toast.success(`Exported leave report as ${format.toUpperCase()}`);
  };

  const tabs = [
    { id: 'requests', label: 'Leave Requests & Approvals', icon: <CalendarDays className="w-3.5 h-3.5" />, count: leaveRequests.length },
    { id: 'balances', label: 'Annual Leave Balances', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'holidays', label: 'Holiday Calendar (2026)', icon: <CalendarIcon className="w-3.5 h-3.5" />, count: holidays.length },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white border-3 border-black p-5 sm:p-6 shadow-neo flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="sticker-tag bg-[#FF6B9D] text-black">
              TIME-OFF & RADAR
            </span>
            <span className="sticker-tag bg-[#00D06C] text-black">
              SYNCED WITH ATTENDANCE
            </span>
          </div>
          <h1 className="font-mono text-2xl sm:text-3xl font-black text-black tracking-tight mt-1 uppercase">
            LEAVE MANAGEMENT & HOLIDAYS
          </h1>
          <p className="text-xs sm:text-sm text-zinc-700 font-sans font-medium">
            Balance deductions, multi-state manager approvals, and automatic attendance synchronization.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="green" size="sm" onClick={() => setIsRequestModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> Request Leave / WFH
          </Button>
          <Button variant="white" size="sm" onClick={() => handleExportLeave('xlsx')}>
            <Download className="w-4 h-4 mr-1" /> Export XLSX
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* TAB 1: REQUESTS & APPROVALS */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white border-3 border-black p-4 shadow-neo flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border-2 border-black text-black px-2.5 py-1.5 font-mono text-xs font-bold cursor-pointer focus:outline-hidden shadow-[2px_2px_0px_#000]"
              >
                <option value="all">ALL APPROVAL STATUSES</option>
                <option value="pending">PENDING APPROVAL</option>
                <option value="approved">APPROVED</option>
                <option value="rejected">REJECTED</option>
                <option value="clarification_required">CLARIFICATION NEEDED</option>
              </select>

              <select
                value={leaveTypeFilter}
                onChange={(e) => setLeaveTypeFilter(e.target.value)}
                className="bg-white border-2 border-black text-black px-2.5 py-1.5 font-mono text-xs font-bold cursor-pointer focus:outline-hidden shadow-[2px_2px_0px_#000]"
              >
                <option value="all">ALL LEAVE TYPES</option>
                {leaveTypes.map((lt) => (
                  <option key={lt.id} value={lt.id}>
                    {lt.name.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-xs font-mono font-bold text-zinc-700">
              Showing {filteredRequests.length} of {leaveRequests.length} requests
            </span>
          </div>

          {/* Requests Table with Retro Window Header */}
          <div className="bg-white border-3 border-black shadow-neo overflow-hidden">
            <div className="bg-[#38BDF8] border-b-3 border-black px-4 py-2 flex items-center justify-between font-mono text-xs font-black uppercase text-black">
              <span>SUBMITTED LEAVE REQUESTS & DECISIONS</span>
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
                    <th className="py-3 px-4">LEAVE TYPE</th>
                    <th className="py-3 px-4">DATES / DURATION</th>
                    <th className="py-3 px-4">REASON & SUBMITTED</th>
                    <th className="py-3 px-4">STATUS</th>
                    <th className="py-3 px-4 text-right">MANAGER ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black/10">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-zinc-600 font-bold">
                        No leave requests matching filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((req) => {
                      const statusStyle = getLeaveStatusStyle(req.status);
                      return (
                        <tr key={req.id} className="hover:bg-[#FFFDF5] transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-black text-black">{req.person?.full_name}</div>
                            <div className="text-[10px] text-zinc-600 font-bold">
                              {req.person?.person_code} • {req.person?.department?.name}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-black text-black">
                            {req.leave_type?.name}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="text-black font-bold">
                              {formatDate(req.start_date)} {req.start_date !== req.end_date && `to ${formatDate(req.end_date)}`}
                            </div>
                            <div className="text-[10px] text-black font-black bg-[#FFDE59] px-1.5 py-0.2 border border-black inline-block mt-0.5">
                              {req.duration_days} WORKING DAY(S)
                            </div>
                          </td>
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="text-black font-medium truncate">{req.reason}</div>
                            <div className="text-[10px] text-zinc-600 font-bold">
                              Requested {formatDate(req.requested_at)}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`text-[10px] px-2 py-0.5 border-2 border-black font-black uppercase ${statusStyle.color}`}>
                              {statusStyle.label}
                            </span>
                            {req.manager_comment && (
                              <div className="text-[10px] text-zinc-700 mt-1 italic font-medium">
                                Note: {req.manager_comment}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {req.status === 'pending' || req.status === 'clarification_required' ? (
                              <div className="flex items-center justify-end gap-1.5">
                                {canApproveLeave && (
                                  <>
                                    <Button
                                      variant="green"
                                      size="sm"
                                      onClick={() => openDecisionModal(req, 'approved')}
                                      className="h-7 px-2"
                                      title="Approve & Sync Attendance"
                                    >
                                      <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                                    </Button>
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      onClick={() => openDecisionModal(req, 'rejected')}
                                      className="h-7 px-2"
                                      title="Reject Request"
                                    >
                                      <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                                    </Button>
                                    <Button
                                      variant="white"
                                      size="sm"
                                      onClick={() => openDecisionModal(req, 'clarification_required')}
                                      className="h-7 px-2"
                                      title="Request Clarification"
                                    >
                                      <HelpCircle className="w-3.5 h-3.5" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            ) : (
                              <span className="text-zinc-600 text-[10px] font-bold">
                                {req.decided_at ? `Decided ${formatDate(req.decided_at)}` : 'Completed'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ANNUAL BALANCES */}
      {activeTab === 'balances' && (
        <div className="bg-white border-3 border-black shadow-neo p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black">
            <div>
              <h3 className="font-mono text-sm font-black uppercase tracking-wider text-black">
                EMPLOYEE LEAVE BALANCES (2026)
              </h3>
              <p className="text-xs text-zinc-600 font-sans font-medium">Allocated, used, and remaining annual balances</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {persons.map((p) => {
              const personBalances = leaveBalances.filter((b) => b.person_id === p.id);
              return (
                <div key={p.id} className="p-4 bg-[#FAF7EE] border-2 border-black shadow-neo-sm space-y-3">
                  <div className="flex items-center justify-between border-b-2 border-black/10 pb-2">
                    <div>
                      <div className="font-mono text-xs font-black text-black">{p.full_name}</div>
                      <div className="text-[10px] font-mono text-zinc-600 font-bold">{p.person_code} • {p.department?.name}</div>
                    </div>
                  </div>

                  <div className="space-y-2 font-mono text-xs">
                    {personBalances.length === 0 ? (
                      <div className="text-zinc-500 text-[11px] font-bold">Standard default allocation</div>
                    ) : (
                      personBalances.map((b) => (
                        <div key={b.id} className="flex items-center justify-between">
                          <span className="text-zinc-700 font-bold">{b.leave_type?.name}:</span>
                          <span className="font-black text-black bg-[#00D06C] px-1.5 py-0.2 border border-black">
                            {b.allocated - b.used} / {b.allocated} Left
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: HOLIDAYS */}
      {activeTab === 'holidays' && (
        <div className="bg-white border-3 border-black shadow-neo p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black">
            <div>
              <h3 className="font-mono text-sm font-black uppercase tracking-wider text-black">
                COMPANY HOLIDAY CALENDAR (2026)
              </h3>
              <p className="text-xs text-zinc-600 font-sans font-medium">Official recognized non-working days (excluded from absence counts)</p>
            </div>
            {!isEmployeeViewOnly && (
              <Button variant="green" size="sm" onClick={() => setIsAddHolidayModalOpen(true)}>
                <Plus className="w-3.5 h-3.5 mr-1" /> ADD HOLIDAY
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {holidays.map((h) => (
              <div key={h.id} className="p-3.5 bg-[#FAF7EE] border-2 border-black shadow-neo-sm flex items-center justify-between">
                <div>
                  <div className="font-mono text-xs font-black text-black">{h.name}</div>
                  <div className="text-[11px] font-mono text-zinc-600 font-bold mt-0.5">{formatDate(h.holiday_date)}</div>
                </div>
                {h.is_optional ? (
                  <Badge variant="amber">OPTIONAL</Badge>
                ) : (
                  <Badge variant="green">MANDATORY</Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: REQUEST LEAVE */}
      <Modal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        title="SUBMIT LEAVE / WFH REQUEST"
        subtitle="Calculates working days automatically excluding weekends and holidays"
        headerColor="green"
        maxWidth="lg"
        footer={
          <>
            <Button variant="white" size="sm" onClick={() => setIsRequestModalOpen(false)}>
              CANCEL
            </Button>
            <Button variant="green" size="sm" onClick={handleSubmitLeaveRequest}>
              SUBMIT REQUEST ({calculatedDuration} DAYS)
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmitLeaveRequest} className="space-y-4 font-mono text-xs">
          <Select
            label="Employee"
            value={requestFormData.person_id}
            onChange={(e) => setRequestFormData({ ...requestFormData, person_id: e.target.value })}
            options={persons.map((p) => ({ value: p.id, label: `${p.full_name} (${p.person_code})` }))}
          />

          <Select
            label="Leave Type"
            value={requestFormData.leave_type_id}
            onChange={(e) => setRequestFormData({ ...requestFormData, leave_type_id: e.target.value })}
            options={leaveTypes.map((lt) => ({ value: lt.id, label: lt.name }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              required
              value={requestFormData.start_date}
              onChange={(e) => setRequestFormData({ ...requestFormData, start_date: e.target.value })}
            />
            <Input
              label="End Date"
              type="date"
              required
              value={requestFormData.end_date}
              onChange={(e) => setRequestFormData({ ...requestFormData, end_date: e.target.value })}
            />
          </div>

          <div className="p-3 bg-[#FAF7EE] border-2 border-black shadow-neo-sm flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={requestFormData.is_half_day}
                onChange={(e) => setRequestFormData({ ...requestFormData, is_half_day: e.target.checked })}
                className="w-4 h-4 accent-black"
              />
              <span className="text-black font-black">Apply as Half Day (0.5 Days)</span>
            </label>
            <span className="text-black font-black bg-[#00D06C] px-2 py-0.5 border border-black text-xs">
              DURATION: {calculatedDuration} DAY(S)
            </span>
          </div>

          <Textarea
            label="Mandatory Reason for Time Off"
            required
            placeholder="Explain the reason for your leave or WFH request..."
            value={requestFormData.reason}
            onChange={(e) => setRequestFormData({ ...requestFormData, reason: e.target.value })}
          />
        </form>
      </Modal>

      {/* MODAL 2: DECISION MODAL */}
      <Modal
        isOpen={isDecisionModalOpen}
        onClose={() => setIsDecisionModalOpen(false)}
        title={`LEAVE DECISION // ${decisionTarget?.decision.toUpperCase()}`}
        subtitle={
          decisionTarget?.decision === 'approved'
            ? 'Approving automatically synchronizes attendance records and deducts leave balance.'
            : 'Record decision notes sent to employee.'
        }
        headerColor={decisionTarget?.decision === 'approved' ? 'green' : decisionTarget?.decision === 'rejected' ? 'pink' : 'purple'}
        maxWidth="md"
        footer={
          <>
            <Button variant="white" size="sm" onClick={() => setIsDecisionModalOpen(false)}>
              CANCEL
            </Button>
            <Button
              variant={decisionTarget?.decision === 'approved' ? 'green' : decisionTarget?.decision === 'rejected' ? 'danger' : 'white'}
              size="sm"
              onClick={handleDecisionSubmit}
            >
              CONFIRM {decisionTarget?.decision.toUpperCase()}
            </Button>
          </>
        }
      >
        <form onSubmit={handleDecisionSubmit} className="space-y-4 font-mono text-xs">
          <div className="p-3 bg-[#FAF7EE] border-2 border-black space-y-1">
            <div className="text-zinc-600 font-bold">
              EMPLOYEE: <span className="text-black font-black">{decisionTarget?.request.person?.full_name}</span>
            </div>
            <div className="text-zinc-600 font-bold">
              DATES: <span className="text-black font-black">{decisionTarget?.request.start_date} to {decisionTarget?.request.end_date}</span>
            </div>
            <div className="text-zinc-600 font-bold">
              DURATION: <span className="text-black font-black bg-[#FFDE59] px-1 border border-black">{decisionTarget?.request.duration_days} Day(s)</span>
            </div>
            <div className="text-zinc-600 font-bold">
              REASON: <span className="text-black font-medium">{decisionTarget?.request.reason}</span>
            </div>
          </div>

          <Textarea
            label="Manager Comments / Feedback"
            placeholder="Enter notes, handover instructions, or reason for decision..."
            value={decisionComment}
            onChange={(e) => setDecisionComment(e.target.value)}
          />
        </form>
      </Modal>

      {/* MODAL 3: ADD HOLIDAY */}
      <Modal
        isOpen={isAddHolidayModalOpen}
        onClose={() => setIsAddHolidayModalOpen(false)}
        title="ADD COMPANY HOLIDAY"
        subtitle="Registers official holiday on attendance calendars"
        headerColor="yellow"
        maxWidth="md"
        footer={
          <>
            <Button variant="white" size="sm" onClick={() => setIsAddHolidayModalOpen(false)}>
              CANCEL
            </Button>
            <Button variant="green" size="sm" onClick={handleAddHolidaySubmit}>
              SAVE HOLIDAY
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddHolidaySubmit} className="space-y-4 font-mono text-xs">
          <Input
            label="Holiday Name"
            required
            placeholder="e.g. Independence Day"
            value={holidayFormData.name}
            onChange={(e) => setHolidayFormData({ ...holidayFormData, name: e.target.value })}
          />
          <Input
            label="Holiday Date"
            type="date"
            required
            value={holidayFormData.holiday_date}
            onChange={(e) => setHolidayFormData({ ...holidayFormData, holiday_date: e.target.value })}
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={holidayFormData.is_optional}
              onChange={(e) => setHolidayFormData({ ...holidayFormData, is_optional: e.target.checked })}
              className="w-4 h-4 accent-black"
            />
            <span className="text-black font-bold">Optional / Floating Holiday</span>
          </label>
        </form>
      </Modal>
    </div>
  );
}

export default function LeavePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-black font-mono text-sm font-bold">Loading Leave Management...</div>}>
      <LeaveContent />
    </Suspense>
  );
}
