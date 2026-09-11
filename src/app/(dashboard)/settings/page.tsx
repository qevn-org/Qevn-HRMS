'use client';

import React, { useState, useEffect } from 'react';
import { settingsService } from '@/lib/services/settingsService';
import { hrmsStore } from '@/lib/services/store';
import { Department, Designation, LeaveType, Holiday, DocumentRequirement, OnboardingTemplate } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Tabs } from '@/components/ui/Tabs';
import { Input, Select, Textarea } from '@/components/ui/FormControls';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/lib/context/AuthContext';
import { toast } from 'sonner';
import {
  Settings,
  Building,
  Briefcase,
  CalendarDays,
  FileCheck,
  RotateCcw,
  Plus,
  ShieldAlert,
  Sparkles,
  Calendar,
} from 'lucide-react';

export default function SettingsPage() {
  const { canManageSettings, user } = useAuth();

  const [activeTab, setActiveTab] = useState('departments');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [docReqs, setDocReqs] = useState<DocumentRequirement[]>([]);
  const [templates, setTemplates] = useState<OnboardingTemplate[]>([]);

  // Modals
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [deptForm, setDeptForm] = useState({ name: '', code: '' });

  const [isDesigModalOpen, setIsDesigModalOpen] = useState(false);
  const [desigForm, setDesigForm] = useState({ name: '', department_id: '' });

  const [isLeaveTypeModalOpen, setIsLeaveTypeModalOpen] = useState(false);
  const [leaveTypeForm, setLeaveTypeForm] = useState({
    name: '',
    code: '',
    description: '',
    default_days_per_year: 12,
    is_paid: true,
    allow_half_day: true,
    requires_approval: true,
  });

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  useEffect(() => {
    loadSettingsData();
    const unsubscribe = hrmsStore.subscribe(() => {
      loadSettingsData();
    });
    return unsubscribe;
  }, []);

  const loadSettingsData = () => {
    hrmsStore.init();
    const depts = settingsService.getDepartments();
    const desigs = settingsService.getDesignations();
    const lts = settingsService.getLeaveTypes();
    const hols = settingsService.getHolidays(2026);
    const reqs = settingsService.getDocumentRequirements();
    const tmpls = settingsService.getOnboardingTemplates();

    setDepartments(depts);
    setDesignations(desigs);
    setLeaveTypes(lts);
    setHolidays(hols);
    setDocReqs(reqs);
    setTemplates(tmpls);

    if (depts.length > 0 && !desigForm.department_id) {
      setDesigForm((prev) => ({ ...prev, department_id: depts[0].id }));
    }
  };

  const handleAddDepartmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.name || !deptForm.code) return;
    settingsService.addDepartment(
      {
        name: deptForm.name,
        code: deptForm.code.toUpperCase(),
        is_active: true,
        sort_order: departments.length + 1,
      },
      user.display_name
    );
    toast.success(`Created department: ${deptForm.name}`);
    setIsDeptModalOpen(false);
    setDeptForm({ name: '', code: '' });
  };

  const handleAddDesignationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desigForm.name) return;
    settingsService.addDesignation(
      {
        name: desigForm.name,
        department_id: desigForm.department_id || null,
        is_active: true,
      },
      user.display_name
    );
    toast.success(`Created designation: ${desigForm.name}`);
    setIsDesigModalOpen(false);
    setDesigForm({ name: '', department_id: departments[0]?.id || '' });
  };

  const handleAddLeaveTypeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveTypeForm.name || !leaveTypeForm.code) return;
    settingsService.addLeaveType(
      {
        ...leaveTypeForm,
        default_days_per_year: Number(leaveTypeForm.default_days_per_year),
        balance_tracking_enabled: true,
        is_active: true,
      },
      user.display_name
    );
    toast.success(`Created leave policy: ${leaveTypeForm.name}`);
    setIsLeaveTypeModalOpen(false);
    setLeaveTypeForm({
      name: '',
      code: '',
      description: '',
      default_days_per_year: 12,
      is_paid: true,
      allow_half_day: true,
      requires_approval: true,
    });
  };

  const handleResetDataConfirm = () => {
    settingsService.resetAllData();
    toast.success('Reset system to default seed dataset');
    setIsResetConfirmOpen(false);
  };

  const tabs = [
    { id: 'departments', label: 'Departments', icon: <Building className="w-3.5 h-3.5" />, count: departments.length },
    { id: 'designations', label: 'Designations', icon: <Briefcase className="w-3.5 h-3.5" />, count: designations.length },
    { id: 'leave_policies', label: 'Leave Types & Policies', icon: <CalendarDays className="w-3.5 h-3.5" />, count: leaveTypes.length },
    { id: 'document_rules', label: 'Document Requirements', icon: <FileCheck className="w-3.5 h-3.5" />, count: docReqs.length },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-[#121218] border-2 border-[#262636] p-4 sm:p-5 shadow-neo flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#CCFF00]" />
            <span className="font-mono text-xs font-bold uppercase text-[#CCFF00] tracking-wider">
              ORGANIZATION POLICIES & CONFIGURATION
            </span>
          </div>
          <h1 className="font-mono text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
            SETTINGS & BUSINESS POLICIES
          </h1>
          <p className="text-xs text-zinc-400 font-sans">
            Configurable departments, designations, leave types, and required document policies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canManageSettings && (
            <Button variant="danger" size="sm" onClick={() => setIsResetConfirmOpen(true)}>
              <RotateCcw className="w-4 h-4 mr-1" /> RESET SEED DATA
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* TAB 1: DEPARTMENTS */}
      {activeTab === 'departments' && (
        <div className="bg-[#121218] border-2 border-[#262636] shadow-neo p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#262636]">
            <div>
              <h3 className="font-mono text-sm font-bold uppercase text-white">DEPARTMENTS ({departments.length})</h3>
              <p className="text-xs text-zinc-400">Organizational units across QEVN</p>
            </div>
            {canManageSettings && (
              <Button variant="primary" size="sm" onClick={() => setIsDeptModalOpen(true)}>
                <Plus className="w-3.5 h-3.5 mr-1" /> ADD DEPARTMENT
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {departments.map((d) => (
              <div key={d.id} className="p-4 bg-[#0D0D12] border border-[#262636] flex items-center justify-between">
                <div>
                  <div className="font-mono text-xs font-bold text-white">{d.name}</div>
                  <div className="text-[10px] font-mono text-[#CCFF00] mt-0.5">CODE: {d.code}</div>
                </div>
                <Badge variant={d.is_active ? 'lime' : 'neutral'}>ACTIVE</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: DESIGNATIONS */}
      {activeTab === 'designations' && (
        <div className="bg-[#121218] border-2 border-[#262636] shadow-neo p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#262636]">
            <div>
              <h3 className="font-mono text-sm font-bold uppercase text-white">JOB DESIGNATIONS ({designations.length})</h3>
              <p className="text-xs text-zinc-400">Standardized role titles mapped to departments</p>
            </div>
            {canManageSettings && (
              <Button variant="primary" size="sm" onClick={() => setIsDesigModalOpen(true)}>
                <Plus className="w-3.5 h-3.5 mr-1" /> ADD DESIGNATION
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {designations.map((desig) => {
              const dept = departments.find((d) => d.id === desig.department_id);
              return (
                <div key={desig.id} className="p-4 bg-[#0D0D12] border border-[#262636] flex items-center justify-between">
                  <div>
                    <div className="font-mono text-xs font-bold text-white">{desig.name}</div>
                    <div className="text-[10px] font-mono text-zinc-400 mt-0.5">{dept?.name || 'General Team'}</div>
                  </div>
                  <Badge variant="cyan">ROLE</Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: LEAVE POLICIES */}
      {activeTab === 'leave_policies' && (
        <div className="bg-[#121218] border-2 border-[#262636] shadow-neo p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#262636]">
            <div>
              <h3 className="font-mono text-sm font-bold uppercase text-white">LEAVE POLICIES & TYPES ({leaveTypes.length})</h3>
              <p className="text-xs text-zinc-400">Configurable annual quota and approval rules</p>
            </div>
            {canManageSettings && (
              <Button variant="primary" size="sm" onClick={() => setIsLeaveTypeModalOpen(true)}>
                <Plus className="w-3.5 h-3.5 mr-1" /> ADD LEAVE TYPE
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leaveTypes.map((lt) => (
              <div key={lt.id} className="p-4 bg-[#0D0D12] border border-[#262636] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-xs font-bold text-white flex items-center gap-2">
                    <span>{lt.name}</span>
                    <span className="text-[10px] text-zinc-500">[{lt.code}]</span>
                  </div>
                  <Badge variant={lt.is_paid ? 'lime' : 'neutral'}>
                    {lt.is_paid ? 'PAID' : 'UNPAID'}
                  </Badge>
                </div>
                <p className="text-xs text-zinc-400 font-sans">{lt.description}</p>
                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                  <span>ANNUAL QUOTA: {lt.default_days_per_year} DAYS</span>
                  <span>APPROVAL: {lt.requires_approval ? 'MANDATORY' : 'AUTO'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DOCUMENT REQUIREMENTS */}
      {activeTab === 'document_rules' && (
        <div className="bg-[#121218] border-2 border-[#262636] shadow-neo p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#262636]">
            <div>
              <h3 className="font-mono text-sm font-bold uppercase text-white">DOCUMENT COMPLIANCE POLICIES ({docReqs.length})</h3>
              <p className="text-xs text-zinc-400">Mandatory document checklist rules per worker type</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {docReqs.map((req) => (
              <div key={req.id} className="p-3.5 bg-[#0D0D12] border border-[#262636] flex items-center justify-between">
                <div>
                  <div className="font-mono text-xs font-bold text-white">{req.document_type}</div>
                  <div className="text-[10px] font-mono text-zinc-400">Category: {req.category}</div>
                </div>
                <Badge variant={req.worker_type === 'employee' ? 'lime' : req.worker_type === 'intern' ? 'violet' : 'amber'}>
                  {req.worker_type.toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: ADD DEPARTMENT */}
      <Modal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        title="ADD DEPARTMENT"
        subtitle="Registers new organizational department"
        maxWidth="md"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsDeptModalOpen(false)}>
              CANCEL
            </Button>
            <Button variant="primary" size="sm" onClick={handleAddDepartmentSubmit}>
              CREATE DEPARTMENT
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddDepartmentSubmit} className="space-y-4 font-mono text-xs">
          <Input
            label="Department Name"
            required
            placeholder="e.g. Artificial Intelligence Labs"
            value={deptForm.name}
            onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
          />
          <Input
            label="Department Code (2-4 Letters)"
            required
            placeholder="e.g. AIL"
            value={deptForm.code}
            onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
          />
        </form>
      </Modal>

      {/* MODAL 2: ADD DESIGNATION */}
      <Modal
        isOpen={isDesigModalOpen}
        onClose={() => setIsDesigModalOpen(false)}
        title="ADD DESIGNATION / JOB TITLE"
        subtitle="Defines job title role mapped to department"
        maxWidth="md"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsDesigModalOpen(false)}>
              CANCEL
            </Button>
            <Button variant="primary" size="sm" onClick={handleAddDesignationSubmit}>
              CREATE DESIGNATION
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddDesignationSubmit} className="space-y-4 font-mono text-xs">
          <Input
            label="Designation Title"
            required
            placeholder="e.g. Solutions Architect"
            value={desigForm.name}
            onChange={(e) => setDesigForm({ ...desigForm, name: e.target.value })}
          />
          <Select
            label="Department"
            value={desigForm.department_id}
            onChange={(e) => setDesigForm({ ...desigForm, department_id: e.target.value })}
            options={departments.map((d) => ({ value: d.id, label: d.name }))}
          />
        </form>
      </Modal>

      {/* MODAL 3: ADD LEAVE TYPE */}
      <Modal
        isOpen={isLeaveTypeModalOpen}
        onClose={() => setIsLeaveTypeModalOpen(false)}
        title="CREATE LEAVE POLICY TYPE"
        subtitle="Configures balance tracking and approval requirements"
        maxWidth="md"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsLeaveTypeModalOpen(false)}>
              CANCEL
            </Button>
            <Button variant="primary" size="sm" onClick={handleAddLeaveTypeSubmit}>
              CREATE POLICY
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddLeaveTypeSubmit} className="space-y-4 font-mono text-xs">
          <Input
            label="Leave Type Name"
            required
            placeholder="e.g. Sabbatical / Study Leave"
            value={leaveTypeForm.name}
            onChange={(e) => setLeaveTypeForm({ ...leaveTypeForm, name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Code"
              required
              placeholder="e.g. SAB"
              value={leaveTypeForm.code}
              onChange={(e) => setLeaveTypeForm({ ...leaveTypeForm, code: e.target.value })}
            />
            <Input
              label="Annual Default Days"
              type="number"
              required
              value={String(leaveTypeForm.default_days_per_year)}
              onChange={(e) => setLeaveTypeForm({ ...leaveTypeForm, default_days_per_year: Number(e.target.value) })}
            />
          </div>
          <Textarea
            label="Policy Description"
            placeholder="Rules and requirements for this leave type..."
            value={leaveTypeForm.description}
            onChange={(e) => setLeaveTypeForm({ ...leaveTypeForm, description: e.target.value })}
          />
        </form>
      </Modal>

      {/* MODAL 4: RESET CONFIRM */}
      <Modal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        title="CONFIRM SYSTEM SEED RESET"
        subtitle="Restores complete demo personas, historical attendance, and documents"
        maxWidth="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsResetConfirmOpen(false)}>
              CANCEL
            </Button>
            <Button variant="danger" size="sm" onClick={handleResetDataConfirm}>
              CONFIRM RESET
            </Button>
          </>
        }
      >
        <div className="p-3 bg-rose-500/10 border border-rose-500/40 text-rose-300 font-mono text-xs">
          This will reset local database storage to the authentic 20+ QEVN demo dataset.
        </div>
      </Modal>
    </div>
  );
}
