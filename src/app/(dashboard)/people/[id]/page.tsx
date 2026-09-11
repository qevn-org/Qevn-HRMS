'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { peopleService } from '@/lib/services/peopleService';
import { attendanceService } from '@/lib/services/attendanceService';
import { leaveService } from '@/lib/services/leaveService';
import { documentService } from '@/lib/services/documentService';
import { onboardingService } from '@/lib/services/onboardingService';
import { settingsService } from '@/lib/services/settingsService';
import { hrmsStore } from '@/lib/services/store';
import {
  Person,
  EmploymentRecord,
  AttendanceRecord,
  LeaveRequest,
  LeaveBalance,
  DocumentRecord,
  DocumentRequirement,
  OnboardingTask,
  LifecycleEvent,
  HRAction,
  PerformanceSnapshot,
  Department,
  Designation,
} from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/FormControls';
import {
  getWorkerTypeBadge,
  getStatusBadge,
  getAttendanceStatusStyle,
  getLeaveStatusStyle,
  formatDate,
  formatDateTime,
} from '@/lib/utils';
import { useAuth } from '@/lib/context/AuthContext';
import { toast } from 'sonner';
import {
  ArrowLeft,
  User,
  Briefcase,
  CalendarCheck,
  CalendarDays,
  FileText,
  CheckSquare,
  History,
  Award,
  Mail,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  Plus,
  Edit,
  Download,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function PersonProfilePage() {
  const params = useParams();
  const router = useRouter();
  const personId = params.id as string;
  const { canManagePeople, user } = useAuth();

  const [person, setPerson] = useState<Person | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Tab Data States
  const [employmentRecords, setEmploymentRecords] = useState<EmploymentRecord[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [documentRequirements, setDocumentRequirements] = useState<DocumentRequirement[]>([]);
  const [onboardingTasks, setOnboardingTasks] = useState<OnboardingTask[]>([]);
  const [lifecycleEvents, setLifecycleEvents] = useState<LifecycleEvent[]>([]);
  const [hrActions, setHRActions] = useState<HRAction[]>([]);
  const [performanceSnapshots, setPerformanceSnapshots] = useState<PerformanceSnapshot[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploadDocModalOpen, setIsUploadDocModalOpen] = useState(false);
  const [isAddHRActionModalOpen, setIsAddHRActionModalOpen] = useState(false);
  const [isAddPerformanceModalOpen, setIsAddPerformanceModalOpen] = useState(false);

  // Edit Form State
  const [editFormData, setEditFormData] = useState<Partial<Person>>({});
  
  // Document Upload Form
  const [docFormData, setDocFormData] = useState({
    category: 'Employment' as any,
    document_type: 'Signed Offer Letter',
    original_file_name: 'document.pdf',
    issue_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    visibility_level: 'hr_only' as any,
  });

  // HR Action Form
  const [hrActionData, setHrActionData] = useState({
    action_type: 'recognition' as any,
    title: '',
    description: '',
    severity: 'info' as any,
  });

  // Performance Form
  const [perfData, setPerfData] = useState({
    review_period: 'Q3 2026',
    rating: 4,
    strengths: '',
    improvement_areas: '',
    next_period_goals: '',
  });

  useEffect(() => {
    loadPersonData();
    const unsubscribe = hrmsStore.subscribe(() => {
      loadPersonData();
    });
    return unsubscribe;
  }, [personId]);

  const loadPersonData = () => {
    hrmsStore.init();
    const p = peopleService.getPersonById(personId);
    if (!p) return;

    setPerson(p);
    setEditFormData({
      full_name: p.full_name,
      preferred_name: p.preferred_name || '',
      work_email: p.work_email,
      personal_email: p.personal_email || '',
      phone: p.phone,
      department_id: p.department_id,
      designation_id: p.designation_id,
      manager_person_id: p.manager_person_id,
      work_location: p.work_location,
      remote_status: p.remote_status,
      current_status: p.current_status,
      emergency_contact_name: p.emergency_contact_name || '',
      emergency_contact_relation: p.emergency_contact_relation || '',
      emergency_contact_phone: p.emergency_contact_phone || '',
    });

    setEmploymentRecords(hrmsStore.getEmploymentRecords(personId));
    setAttendanceRecords(hrmsStore.getAttendance(undefined, personId));
    setLeaveBalances(hrmsStore.getLeaveBalances(personId));
    setLeaveRequests(hrmsStore.getLeaveRequests(personId));
    setDocuments(hrmsStore.getDocuments(personId));
    setDocumentRequirements(hrmsStore.getDocumentRequirements(p.worker_type));
    setOnboardingTasks(hrmsStore.getOnboardingTasks(personId));
    setLifecycleEvents(hrmsStore.getLifecycleEvents(personId));
    setHRActions(hrmsStore.getHRActions(personId));
    setPerformanceSnapshots(hrmsStore.getPerformanceSnapshots(personId));
    setDepartments(settingsService.getDepartments());
    setDesignations(settingsService.getDesignations());
  };

  if (!person) {
    return (
      <div className="bg-[#121218] border-2 border-[#262636] p-12 text-center">
        <div className="font-mono text-base font-bold text-white uppercase">Person Record Not Found</div>
        <p className="text-xs text-zinc-400 mt-1">The requested profile ID does not exist or has been permanently purged.</p>
        <Link href="/people" className="inline-block mt-4">
          <Button variant="primary" size="sm">
            BACK TO DIRECTORY
          </Button>
        </Link>
      </div>
    );
  }

  const workerBadge = getWorkerTypeBadge(person.worker_type);
  const statusBadge = getStatusBadge(person.current_status);

  // Tabs list
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <User className="w-3.5 h-3.5" /> },
    { id: 'employment', label: 'Employment History', icon: <Briefcase className="w-3.5 h-3.5" />, count: employmentRecords.length },
    { id: 'attendance', label: 'Attendance', icon: <CalendarCheck className="w-3.5 h-3.5" />, count: attendanceRecords.length },
    { id: 'leave', label: 'Leave & Balances', icon: <CalendarDays className="w-3.5 h-3.5" />, count: leaveRequests.length },
    { id: 'documents', label: 'Document Vault', icon: <FileText className="w-3.5 h-3.5" />, count: documents.length },
    { id: 'onboarding', label: 'Onboarding Checklist', icon: <CheckSquare className="w-3.5 h-3.5" />, count: onboardingTasks.length },
    { id: 'timeline', label: 'HR Timeline & Actions', icon: <History className="w-3.5 h-3.5" />, count: lifecycleEvents.length + hrActions.length },
    { id: 'performance', label: 'Performance Snapshots', icon: <Award className="w-3.5 h-3.5" />, count: performanceSnapshots.length },
  ];

  // Save Edit Profile
  const handleEditProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    peopleService.updatePerson(person.id, editFormData, user.display_name);
    toast.success('Updated person master profile');
    setIsEditModalOpen(false);
  };

  // Upload Document
  const handleUploadDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    documentService.uploadDocument(
      {
        person_id: person.id,
        category: docFormData.category,
        document_type: docFormData.document_type,
        original_file_name: docFormData.original_file_name,
        storage_bucket: 'employee-documents',
        storage_path: `${person.id}/${docFormData.category}/${docFormData.original_file_name}`,
        mime_type: 'application/pdf',
        file_size: 340000,
        issue_date: docFormData.issue_date,
        expiry_date: docFormData.expiry_date || null,
        is_required: true,
        visibility_level: docFormData.visibility_level,
        uploaded_by: user.display_name,
      },
      user.display_name
    );
    toast.success(`Uploaded ${docFormData.document_type}`);
    setIsUploadDocModalOpen(false);
  };

  // Add HR Action
  const handleAddHRActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hrActionData.title) return;
    hrmsStore.addHRAction(
      {
        person_id: person.id,
        action_type: hrActionData.action_type,
        title: hrActionData.title,
        description: hrActionData.description,
        severity: hrActionData.severity,
        visibility_level: 'hr_only',
        action_date: new Date().toISOString().split('T')[0],
        created_by: user.display_name,
      },
      user.display_name
    );
    toast.success('Recorded HR timeline action');
    setIsAddHRActionModalOpen(false);
  };

  // Save Performance Snapshot
  const handleAddPerformanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    hrmsStore.savePerformanceSnapshot(
      {
        person_id: person.id,
        review_period: perfData.review_period,
        manager_person_id: person.manager_person_id,
        rating: Number(perfData.rating),
        status: 'submitted',
        strengths: perfData.strengths,
        improvement_areas: perfData.improvement_areas,
        next_period_goals: perfData.next_period_goals,
        review_date: new Date().toISOString().split('T')[0],
      },
      user.display_name
    );
    toast.success('Recorded performance review snapshot');
    setIsAddPerformanceModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Back Button & Master Header */}
      <div className="flex items-center gap-2">
        <Link href="/people">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> BACK TO DIRECTORY
          </Button>
        </Link>
      </div>

      {/* Main Profile Header Banner */}
      <div className="bg-[#121218] border-2 border-[#262636] p-5 sm:p-6 shadow-neo">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-zinc-800 border-2 border-black flex items-center justify-center font-mono font-black text-2xl text-[#CCFF00] shadow-neo-sm shrink-0">
              {person.full_name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-mono text-xl sm:text-2xl font-black text-white tracking-tight">
                  {person.full_name}
                </h1>
                <span className={`text-[10px] px-2 py-0.5 border ${workerBadge.color}`}>
                  {workerBadge.label}
                </span>
                <span className={`text-[10px] px-2 py-0.5 border ${statusBadge.color}`}>
                  {statusBadge.label}
                </span>
              </div>

              <div className="mt-1 flex items-center gap-3 text-xs font-mono text-zinc-400 flex-wrap">
                <span className="text-white font-bold">{person.person_code}</span>
                <span>•</span>
                <span>{person.designation?.name || 'Staff'}</span>
                <span>•</span>
                <span className="text-[#CCFF00]">{person.department?.name || 'General'}</span>
              </div>

              <div className="mt-2 flex items-center gap-4 text-xs text-zinc-400 font-sans flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-zinc-500" /> {person.work_email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-zinc-500" /> {person.phone}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500" /> {person.work_location} ({person.remote_status.toUpperCase()})
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {canManagePeople && (
              <Button variant="primary" size="sm" onClick={() => setIsEditModalOpen(true)}>
                <Edit className="w-3.5 h-3.5 mr-1" /> Edit Profile
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={() => setIsUploadDocModalOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Document
            </Button>
            <Button variant="cyan" size="sm" onClick={() => setIsAddHRActionModalOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" /> HR Action
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Work & Personal Details */}
          <div className="md:col-span-8 space-y-6">
            <div className="bg-[#121218] border-2 border-[#262636] p-5 shadow-neo">
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white border-b border-[#262636] pb-2.5 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#CCFF00]" />
                EMPLOYMENT & WORK ASSIGNMENT
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 font-mono text-xs">
                <div>
                  <span className="text-zinc-500 block text-[10px]">DEPARTMENT</span>
                  <span className="text-white font-bold text-sm">{person.department?.name || 'General'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">JOB TITLE / DESIGNATION</span>
                  <span className="text-white font-bold text-sm">{person.designation?.name || 'Staff'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">REPORTING MANAGER</span>
                  <span className="text-white font-bold">{person.manager?.full_name || 'Direct / Leadership'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">JOINING DATE</span>
                  <span className="text-white font-bold">{formatDate(person.joining_date)}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">EMPLOYMENT TYPE</span>
                  <span className="text-white">{person.employment_type_name}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">WORK LOCATION & REMOTE STATUS</span>
                  <span className="text-white">{person.work_location} • {person.remote_status.toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-[#121218] border-2 border-[#262636] p-5 shadow-neo">
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white border-b border-[#262636] pb-2.5 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
                EMERGENCY CONTACT INFORMATION
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 font-mono text-xs">
                <div>
                  <span className="text-zinc-500 block text-[10px]">CONTACT NAME</span>
                  <span className="text-white font-bold">{person.emergency_contact_name || '—'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">RELATIONSHIP</span>
                  <span className="text-white font-bold">{person.emergency_contact_relation || '—'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">EMERGENCY PHONE</span>
                  <span className="text-white font-bold text-[#CCFF00]">{person.emergency_contact_phone || '—'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics & Compliance Snapshot */}
          <div className="md:col-span-4 space-y-6">
            <div className="bg-[#121218] border-2 border-[#262636] p-5 shadow-neo space-y-4">
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white border-b border-[#262636] pb-2">
                OPERATIONAL SNAPSHOT
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-[#0D0D12] border border-[#262636] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block">TOTAL RECORDED ATTENDANCE</span>
                    <span className="font-mono text-lg font-black text-[#CCFF00]">{attendanceRecords.length} DAYS</span>
                  </div>
                  <CalendarCheck className="w-6 h-6 text-[#CCFF00]/40" />
                </div>

                <div className="p-3 bg-[#0D0D12] border border-[#262636] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block">DOCUMENTS STORED</span>
                    <span className="font-mono text-lg font-black text-[#8B5CF6]">{documents.length} FILES</span>
                  </div>
                  <FileText className="w-6 h-6 text-[#8B5CF6]/40" />
                </div>

                <div className="p-3 bg-[#0D0D12] border border-[#262636] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block">ACTIVE LEAVE REQUESTS</span>
                    <span className="font-mono text-lg font-black text-[#06B6D4]">{leaveRequests.length} REQUESTS</span>
                  </div>
                  <CalendarDays className="w-6 h-6 text-[#06B6D4]/40" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EMPLOYMENT HISTORY */}
      {activeTab === 'employment' && (
        <div className="bg-[#121218] border-2 border-[#262636] p-5 shadow-neo">
          <div className="flex items-center justify-between pb-3 border-b border-[#262636]">
            <div>
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                HISTORICAL EMPLOYMENT ASSIGNMENTS
              </h3>
              <p className="text-xs text-zinc-400">Append-only log of department, role, and manager changes</p>
            </div>
          </div>

          <div className="mt-4 divide-y divide-[#22222E]">
            {employmentRecords.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 font-mono text-xs">No historical changes logged.</div>
            ) : (
              employmentRecords.map((rec) => (
                <div key={rec.id} className="py-3.5 flex items-start justify-between gap-4 font-mono text-xs">
                  <div>
                    <div className="text-white font-bold text-sm">
                      {rec.designation_name || 'Designation'} • {rec.department_name || 'Department'}
                    </div>
                    <div className="text-zinc-400 mt-0.5">
                      Effective: {formatDate(rec.effective_from)} {rec.effective_to ? `to ${formatDate(rec.effective_to)}` : '(Current)'}
                    </div>
                    {rec.manager_name && <div className="text-zinc-500 text-[11px]">Manager: {rec.manager_name}</div>}
                    {rec.reason_for_change && (
                      <div className="text-[#CCFF00] text-[11px] mt-1">Reason: {rec.reason_for_change}</div>
                    )}
                  </div>
                  <Badge variant={rec.status === 'active' ? 'lime' : 'amber'}>{rec.status.toUpperCase()}</Badge>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <div className="bg-[#121218] border-2 border-[#262636] p-5 shadow-neo flex items-center justify-between">
            <div>
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                ATTENDANCE RECORD MATRIX
              </h3>
              <p className="text-xs text-zinc-400">Logged daily attendance and status entries</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => router.push('/attendance')}>
              FULL MATRIX VIEW →
            </Button>
          </div>

          <div className="bg-[#121218] border-2 border-[#262636] shadow-neo overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#171722] border-b-2 border-[#262636] text-zinc-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">DATE</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4">CHECK IN / OUT</th>
                  <th className="py-3 px-4">SOURCE</th>
                  <th className="py-3 px-4">NOTES / CORRECTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#22222E]">
                {attendanceRecords.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-zinc-500">
                      No attendance records logged yet.
                    </td>
                  </tr>
                ) : (
                  attendanceRecords.map((att) => {
                    const style = getAttendanceStatusStyle(att.status);
                    return (
                      <tr key={att.id} className="hover:bg-[#1A1A26]">
                        <td className="py-3 px-4 text-white font-bold">{formatDate(att.attendance_date)}</td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] px-2 py-0.5 border ${style.bg} ${style.text} ${style.border}`}>
                            {style.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-zinc-300">
                          {att.check_in_at ? `${att.check_in_at} - ${att.check_out_at || '—'}` : '—'}
                        </td>
                        <td className="py-3 px-4 text-zinc-400 uppercase text-[10px]">{att.source}</td>
                        <td className="py-3 px-4">
                          {att.corrected && (
                            <span className="text-amber-400 block text-[10px]">
                              CORRECTED: {att.correction_reason}
                            </span>
                          )}
                          <span className="text-zinc-400">{att.notes || '—'}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: LEAVE */}
      {activeTab === 'leave' && (
        <div className="space-y-6">
          {/* Leave Balances Grid */}
          <div className="bg-[#121218] border-2 border-[#262636] p-5 shadow-neo">
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white border-b border-[#262636] pb-3">
              ANNUAL LEAVE BALANCES (2026)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-4">
              {leaveBalances.map((bal) => (
                <div key={bal.id} className="p-3 bg-[#0D0D12] border border-[#262636] space-y-1">
                  <div className="text-[11px] font-mono font-bold text-zinc-400 truncate">
                    {bal.leave_type?.name || 'Leave Type'}
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="font-mono text-2xl font-black text-[#CCFF00]">
                      {bal.allocated - bal.used}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      USED: {bal.used} / {bal.allocated}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leave Requests Table */}
          <div className="bg-[#121218] border-2 border-[#262636] shadow-neo overflow-x-auto">
            <div className="p-4 border-b border-[#262636] flex items-center justify-between">
              <h4 className="font-mono text-xs font-bold uppercase text-white">SUBMITTED LEAVE REQUESTS</h4>
              <Button variant="primary" size="sm" onClick={() => router.push('/leave?action=new')}>
                <Plus className="w-3.5 h-3.5 mr-1" /> REQUEST LEAVE
              </Button>
            </div>

            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#171722] border-b border-[#262636] text-zinc-400 uppercase">
                <tr>
                  <th className="py-2.5 px-4">TYPE</th>
                  <th className="py-2.5 px-4">DATES</th>
                  <th className="py-2.5 px-4">DURATION</th>
                  <th className="py-2.5 px-4">REASON</th>
                  <th className="py-2.5 px-4">STATUS</th>
                  <th className="py-2.5 px-4">DECISION NOTES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#22222E]">
                {leaveRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-zinc-500">
                      No leave requests submitted.
                    </td>
                  </tr>
                ) : (
                  leaveRequests.map((lr) => {
                    const style = getLeaveStatusStyle(lr.status);
                    return (
                      <tr key={lr.id} className="hover:bg-[#1A1A26]">
                        <td className="py-3 px-4 font-bold text-white">{lr.leave_type?.name}</td>
                        <td className="py-3 px-4 text-zinc-300">
                          {formatDate(lr.start_date)} to {formatDate(lr.end_date)}
                        </td>
                        <td className="py-3 px-4 text-white font-bold">{lr.duration_days} Day(s)</td>
                        <td className="py-3 px-4 text-zinc-400">{lr.reason}</td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] px-2 py-0.5 border ${style.color}`}>
                            {style.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-zinc-400">{lr.manager_comment || '—'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          {/* Required Checklist Matrix */}
          <div className="bg-[#121218] border-2 border-[#262636] p-5 shadow-neo">
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white border-b border-[#262636] pb-3">
              MANDATORY ONBOARDING & COMPLIANCE CHECKLIST
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {documentRequirements.map((req) => {
                const uploaded = documents.find((d) => d.document_type === req.document_type || d.category === req.category);
                return (
                  <div
                    key={req.id}
                    className={`p-3 border flex items-center justify-between font-mono text-xs ${
                      uploaded
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {uploaded ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
                      <span className="font-bold">{req.document_type}</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold">
                      {uploaded ? 'UPLOADED & VALID' : 'MISSING'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stored Documents Vault */}
          <div className="bg-[#121218] border-2 border-[#262636] shadow-neo p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#262636]">
              <h4 className="font-mono text-xs font-bold uppercase text-white">STORED FILES & CONTRACTS</h4>
              <Button variant="primary" size="sm" onClick={() => setIsUploadDocModalOpen(true)}>
                <Plus className="w-3.5 h-3.5 mr-1" /> UPLOAD DOCUMENT
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4">
              {documents.map((doc) => (
                <div key={doc.id} className="p-3.5 bg-[#0D0D12] border border-[#262636] space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-mono text-xs font-bold text-white truncate">{doc.document_type}</div>
                    <Badge variant="cyan">{doc.category}</Badge>
                  </div>
                  <div className="text-[11px] font-mono text-zinc-400 truncate">{doc.original_file_name}</div>
                  <div className="text-[10px] font-mono text-zinc-500 flex items-center justify-between pt-2 border-t border-zinc-800">
                    <span>Uploaded: {formatDate(doc.uploaded_at)}</span>
                    <a
                      href={documentService.generateSignedDownloadUrl(doc.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#CCFF00] hover:underline flex items-center gap-1 font-bold"
                    >
                      <Download className="w-3 h-3" /> DOWNLOAD
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: ONBOARDING TASKS */}
      {activeTab === 'onboarding' && (
        <div className="bg-[#121218] border-2 border-[#262636] p-5 shadow-neo space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#262636]">
            <div>
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                ONBOARDING CHECKLIST & MILESTONES
              </h3>
              <p className="text-xs text-zinc-400">Owner-assigned tasks with due dates</p>
            </div>
          </div>

          <div className="space-y-2">
            {onboardingTasks.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 font-mono text-xs">No onboarding tasks assigned.</div>
            ) : (
              onboardingTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3.5 border flex items-center justify-between gap-4 transition-all ${
                    task.status === 'completed'
                      ? 'bg-[#0D0D12] border-emerald-500/30 text-zinc-400'
                      : 'bg-[#171722] border-[#262636] text-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => {
                        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
                        onboardingService.updateTaskStatus(task.id, newStatus, user.display_name);
                        toast.success(`Marked task as ${newStatus}`);
                      }}
                      className={`w-5 h-5 mt-0.5 border-2 flex items-center justify-center cursor-pointer ${
                        task.status === 'completed'
                          ? 'bg-[#CCFF00] border-black text-black'
                          : 'border-zinc-500 hover:border-[#CCFF00]'
                      }`}
                    >
                      {task.status === 'completed' && <CheckSquare className="w-3.5 h-3.5" />}
                    </button>
                    <div>
                      <div className={`font-mono text-xs font-bold ${task.status === 'completed' ? 'line-through text-zinc-500' : 'text-white'}`}>
                        {task.title}
                      </div>
                      <div className="text-[11px] text-zinc-400 font-sans mt-0.5">{task.description}</div>
                      <div className="text-[10px] font-mono text-zinc-500 mt-1">
                        Category: {task.category} • Due: {formatDate(task.due_date)} • Assignee: {task.owner_name}
                      </div>
                    </div>
                  </div>

                  <Badge variant={task.status === 'completed' ? 'lime' : 'neutral'}>
                    {task.status.toUpperCase()}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 7: TIMELINE & HR ACTIONS */}
      {activeTab === 'timeline' && (
        <div className="space-y-6">
          <div className="bg-[#121218] border-2 border-[#262636] p-5 shadow-neo">
            <div className="flex items-center justify-between pb-3 border-b border-[#262636]">
              <div>
                <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                  IMMUTABLE LIFECYCLE & HR ACTION STREAM
                </h3>
                <p className="text-xs text-zinc-400">Formal decisions, spot awards, transfers, and milestones</p>
              </div>
              <Button variant="cyan" size="sm" onClick={() => setIsAddHRActionModalOpen(true)}>
                <Plus className="w-3.5 h-3.5 mr-1" /> LOG HR ACTION
              </Button>
            </div>

            <div className="mt-5 space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-[#262636]">
              {/* Combine Lifecycle Events and HR Actions */}
              {[...lifecycleEvents, ...hrActions]
                .sort((a, b) => new Date(b.created_at || (b as any).action_date).getTime() - new Date(a.created_at || (a as any).action_date).getTime())
                .map((ev, idx) => (
                  <div key={idx} className="relative flex items-start gap-4 pl-8">
                    <div className="absolute left-2 w-3.5 h-3.5 bg-[#CCFF00] border-2 border-black rounded-full mt-1 -translate-x-1/2 shadow-neo-sm" />
                    <div className="p-3.5 bg-[#0D0D12] border border-[#262636] flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-white">
                          {ev.title}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          {formatDate((ev as any).event_date || (ev as any).action_date)}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 font-sans">{ev.description}</p>
                      <div className="text-[10px] font-mono text-zinc-500 pt-1 border-t border-zinc-800/60">
                        Actor: {(ev as any).actor_name || (ev as any).created_by || 'HR System'}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: PERFORMANCE SNAPSHOTS */}
      {activeTab === 'performance' && (
        <div className="bg-[#121218] border-2 border-[#262636] p-5 shadow-neo space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#262636]">
            <div>
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                PERFORMANCE REVIEWS & SNAPSHOTS
              </h3>
              <p className="text-xs text-zinc-400">Quarterly ratings, achievements, and future goals</p>
            </div>
            <Button variant="primary" size="sm" onClick={() => setIsAddPerformanceModalOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" /> NEW SNAPSHOT
            </Button>
          </div>

          <div className="space-y-4">
            {performanceSnapshots.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 font-mono text-xs">No performance snapshots logged.</div>
            ) : (
              performanceSnapshots.map((snap) => (
                <div key={snap.id} className="p-4 bg-[#0D0D12] border border-[#262636] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#CCFF00] uppercase">
                        PERIOD: {snap.review_period}
                      </span>
                      <div className="text-[11px] font-mono text-zinc-400">Reviewed on {formatDate(snap.review_date)}</div>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-sm font-bold bg-zinc-800 px-3 py-1 border border-zinc-700">
                      RATING: <span className="text-[#CCFF00] text-base font-black">{snap.rating}/5</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-zinc-800 text-xs font-sans">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-zinc-400 block">KEY STRENGTHS</span>
                      <p className="text-zinc-200 mt-0.5">{snap.strengths}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-zinc-400 block">AREAS FOR GROWTH</span>
                      <p className="text-zinc-200 mt-0.5">{snap.improvement_areas}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-zinc-400 block">NEXT PERIOD GOALS</span>
                      <p className="text-zinc-200 mt-0.5">{snap.next_period_goals}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: EDIT PROFILE */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`EDIT PROFILE // ${person.person_code}`}
        subtitle="Updating core employment records creates an immutable assignment audit"
        maxWidth="2xl"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsEditModalOpen(false)}>
              CANCEL
            </Button>
            <Button variant="primary" size="sm" onClick={handleEditProfileSubmit}>
              SAVE CHANGES
            </Button>
          </>
        }
      >
        <form onSubmit={handleEditProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Full Name"
              value={editFormData.full_name || ''}
              onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
            />
            <Input
              label="Preferred Name"
              value={editFormData.preferred_name || ''}
              onChange={(e) => setEditFormData({ ...editFormData, preferred_name: e.target.value })}
            />
            <Input
              label="Work Email"
              type="email"
              value={editFormData.work_email || ''}
              onChange={(e) => setEditFormData({ ...editFormData, work_email: e.target.value })}
            />
            <Input
              label="Phone"
              value={editFormData.phone || ''}
              onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 border-t border-zinc-800">
            <Select
              label="Department"
              value={editFormData.department_id || ''}
              onChange={(e) => setEditFormData({ ...editFormData, department_id: e.target.value })}
              options={departments.map((d) => ({ value: d.id, label: d.name }))}
            />
            <Select
              label="Designation"
              value={editFormData.designation_id || ''}
              onChange={(e) => setEditFormData({ ...editFormData, designation_id: e.target.value })}
              options={designations.map((d) => ({ value: d.id, label: d.name }))}
            />
            <Select
              label="Status"
              value={editFormData.current_status || ''}
              onChange={(e) => setEditFormData({ ...editFormData, current_status: e.target.value as any })}
              options={[
                { value: 'active', label: 'ACTIVE' },
                { value: 'probation', label: 'PROBATION' },
                { value: 'intern_active', label: 'INTERN ACTIVE' },
                { value: 'on_leave', label: 'ON LEAVE' },
              ]}
            />
          </div>
        </form>
      </Modal>

      {/* MODAL 2: UPLOAD DOCUMENT */}
      <Modal
        isOpen={isUploadDocModalOpen}
        onClose={() => setIsUploadDocModalOpen(false)}
        title="STORE DOCUMENT IN PRIVATE VAULT"
        subtitle="Role-based visibility guards confidential contracts and records"
        maxWidth="lg"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsUploadDocModalOpen(false)}>
              CANCEL
            </Button>
            <Button variant="primary" size="sm" onClick={handleUploadDocSubmit}>
              UPLOAD & COMMIT
            </Button>
          </>
        }
      >
        <form onSubmit={handleUploadDocSubmit} className="space-y-4">
          <Select
            label="Document Category"
            value={docFormData.category}
            onChange={(e) => setDocFormData({ ...docFormData, category: e.target.value as any })}
            options={[
              { value: 'Employment', label: 'Employment (Offer, NDA, Contract)' },
              { value: 'Joining', label: 'Joining (ID, Background, Resume)' },
              { value: 'Internship', label: 'Internship (NOC, Agreement, Appraisal)' },
              { value: 'Performance', label: 'Performance (Reviews, Letters)' },
              { value: 'Exit', label: 'Exit (Resignation, Relieving)' },
              { value: 'Other', label: 'Other' },
            ]}
          />
          <Input
            label="Document Type / Title"
            required
            placeholder="e.g. Signed Offer Letter"
            value={docFormData.document_type}
            onChange={(e) => setDocFormData({ ...docFormData, document_type: e.target.value })}
          />
          <Input
            label="File Name"
            required
            value={docFormData.original_file_name}
            onChange={(e) => setDocFormData({ ...docFormData, original_file_name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Issue Date"
              type="date"
              value={docFormData.issue_date}
              onChange={(e) => setDocFormData({ ...docFormData, issue_date: e.target.value })}
            />
            <Input
              label="Expiry Date (Optional)"
              type="date"
              value={docFormData.expiry_date}
              onChange={(e) => setDocFormData({ ...docFormData, expiry_date: e.target.value })}
            />
          </div>
          <Select
            label="Visibility Permission"
            value={docFormData.visibility_level}
            onChange={(e) => setDocFormData({ ...docFormData, visibility_level: e.target.value as any })}
            options={[
              { value: 'hr_only', label: 'HR Only (Confidential)' },
              { value: 'hr_manager', label: 'HR & Manager' },
              { value: 'person', label: 'Visible to Employee' },
            ]}
          />
        </form>
      </Modal>

      {/* MODAL 3: LOG HR ACTION */}
      <Modal
        isOpen={isAddHRActionModalOpen}
        onClose={() => setIsAddHRActionModalOpen(false)}
        title="RECORD FORMAL HR ACTION"
        subtitle="Appends official recognition, advisory notes, or lifecycle decisions"
        maxWidth="lg"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsAddHRActionModalOpen(false)}>
              CANCEL
            </Button>
            <Button variant="cyan" size="sm" onClick={handleAddHRActionSubmit}>
              LOG ACTION
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddHRActionSubmit} className="space-y-4">
          <Select
            label="Action Type"
            value={hrActionData.action_type}
            onChange={(e) => setHrActionData({ ...hrActionData, action_type: e.target.value as any })}
            options={[
              { value: 'recognition', label: 'Spot Recognition / Award' },
              { value: 'note', label: 'Advisory Note' },
              { value: 'promotion', label: 'Promotion / Role Upgrade' },
              { value: 'disciplinary', label: 'Disciplinary Action' },
              { value: 'salary_review', label: 'Compensation Adjustment' },
            ]}
          />
          <Input
            label="Title"
            required
            placeholder="e.g. High Reliability Award"
            value={hrActionData.title}
            onChange={(e) => setHrActionData({ ...hrActionData, title: e.target.value })}
          />
          <Textarea
            label="Description & Context"
            required
            placeholder="Details of the formal HR action..."
            value={hrActionData.description}
            onChange={(e) => setHrActionData({ ...hrActionData, description: e.target.value })}
          />
        </form>
      </Modal>

      {/* MODAL 4: PERFORMANCE SNAPSHOT */}
      <Modal
        isOpen={isAddPerformanceModalOpen}
        onClose={() => setIsAddPerformanceModalOpen(false)}
        title="RECORD PERFORMANCE REVIEW SNAPSHOT"
        subtitle="Captures quarterly rating and forward-looking goals"
        maxWidth="lg"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsAddPerformanceModalOpen(false)}>
              CANCEL
            </Button>
            <Button variant="primary" size="sm" onClick={handleAddPerformanceSubmit}>
              SAVE SNAPSHOT
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddPerformanceSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Review Period"
              required
              placeholder="e.g. Q3 2026"
              value={perfData.review_period}
              onChange={(e) => setPerfData({ ...perfData, review_period: e.target.value })}
            />
            <Select
              label="Rating (1 to 5)"
              value={String(perfData.rating)}
              onChange={(e) => setPerfData({ ...perfData, rating: Number(e.target.value) })}
              options={[
                { value: '5', label: '5 — Exceptional / Exceeds All' },
                { value: '4', label: '4 — Consistently Exceeds' },
                { value: '3', label: '3 — Meets Expectations' },
                { value: '2', label: '2 — Needs Improvement' },
                { value: '1', label: '1 — Unsatisfactory' },
              ]}
            />
          </div>
          <Textarea
            label="Key Strengths & Contributions"
            required
            value={perfData.strengths}
            onChange={(e) => setPerfData({ ...perfData, strengths: e.target.value })}
          />
          <Textarea
            label="Improvement & Focus Areas"
            required
            value={perfData.improvement_areas}
            onChange={(e) => setPerfData({ ...perfData, improvement_areas: e.target.value })}
          />
          <Textarea
            label="Next Period Deliverables / Goals"
            required
            value={perfData.next_period_goals}
            onChange={(e) => setPerfData({ ...perfData, next_period_goals: e.target.value })}
          />
        </form>
      </Modal>
    </div>
  );
}
