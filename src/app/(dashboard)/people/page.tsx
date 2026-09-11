'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { peopleService } from '@/lib/services/peopleService';
import { settingsService } from '@/lib/services/settingsService';
import { hrmsStore } from '@/lib/services/store';
import { exportService } from '@/lib/services/exportService';
import { Person, Department, Designation, WorkerType, EmploymentStatusType } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/FormControls';
import { getWorkerTypeBadge, getStatusBadge, formatDate } from '@/lib/utils';
import { useAuth } from '@/lib/context/AuthContext';
import { toast } from 'sonner';
import {
  Search,
  Plus,
  Download,
  LayoutGrid,
  List,
  Eye,
  Archive,
  User,
} from 'lucide-react';

function PeopleDirectoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { canManagePeople, user } = useAuth();

  const [persons, setPersons] = useState<Person[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkerType, setSelectedWorkerType] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [selectedPersonForArchive, setSelectedPersonForArchive] = useState<Person | null>(null);
  const [archiveReason, setArchiveReason] = useState('');
  const [archiveLastWorkingDate, setArchiveLastWorkingDate] = useState(new Date().toISOString().split('T')[0]);

  // Add Person Form State
  const [formData, setFormData] = useState({
    full_name: '',
    preferred_name: '',
    work_email: '',
    personal_email: '',
    phone: '',
    date_of_birth: '1995-01-01',
    worker_type: 'employee' as WorkerType,
    department_id: '',
    designation_id: '',
    manager_person_id: '',
    work_location: 'San Francisco HQ',
    remote_status: 'office' as 'office' | 'hybrid' | 'remote',
    joining_date: new Date().toISOString().split('T')[0],
    emergency_contact_name: '',
    emergency_contact_relation: 'Spouse',
    emergency_contact_phone: '',
  });

  useEffect(() => {
    loadData();
    const unsubscribe = hrmsStore.subscribe(() => {
      loadData();
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'new' && canManagePeople) {
      setIsAddModalOpen(true);
    }
    const statusFilter = searchParams.get('status');
    if (statusFilter) {
      setSelectedStatus(statusFilter);
    }
  }, [searchParams, canManagePeople]);

  const loadData = () => {
    hrmsStore.init();
    const allPersons = peopleService.getAllPersons();
    const allDepts = settingsService.getDepartments();
    const allDesigs = settingsService.getDesignations();
    setPersons(allPersons);
    setDepartments(allDepts);
    setDesignations(allDesigs);

    if (allDepts.length > 0 && !formData.department_id) {
      setFormData((prev) => ({
        ...prev,
        department_id: allDepts[0].id,
        designation_id: allDesigs[0]?.id || '',
      }));
    }
  };

  const filteredPersons = useMemo(() => {
    return peopleService.getFilteredPersons({
      searchQuery,
      workerType: selectedWorkerType as any,
      departmentId: selectedDepartment,
      employmentStatus: selectedStatus as any,
    });
  }, [persons, searchQuery, selectedWorkerType, selectedDepartment, selectedStatus]);

  const handleAddPersonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.work_email || !formData.phone) {
      toast.error('Please fill all mandatory fields (Name, Email, Phone)');
      return;
    }

    try {
      const created = peopleService.createPerson(
        {
          ...formData,
          current_status: (formData.worker_type === 'intern' ? 'intern_active' : 'active') as EmploymentStatusType,
          is_active: true,
          person_code: '', // auto-generated in store
        },
        user.display_name
      );

      toast.success(`Created master record for ${created.full_name} (${created.person_code})`);
      setIsAddModalOpen(false);
      router.push(`/people/${created.id}`);
    } catch {
      toast.error('Failed to create person record');
    }
  };

  const handleArchiveConfirm = () => {
    if (!selectedPersonForArchive) return;
    if (!archiveReason.trim()) {
      toast.error('Archive reason is mandatory for compliance');
      return;
    }

    peopleService.archivePerson(
      selectedPersonForArchive.id,
      archiveReason,
      archiveLastWorkingDate,
      user.display_name
    );

    toast.success(`Archived ${selectedPersonForArchive.full_name}. History preserved.`);
    setIsArchiveModalOpen(false);
    setSelectedPersonForArchive(null);
    setArchiveReason('');
  };

  const handleExportPeople = (format: 'csv' | 'xlsx' | 'pdf') => {
    const payload = {
      title: 'Active People Directory',
      filename: 'QEVN_People_Directory',
      reportCategory: 'people',
      headers: ['Person ID', 'Full Name', 'Email', 'Phone', 'Worker Type', 'Department', 'Designation', 'Joining Date', 'Status'],
      rows: filteredPersons.map((p) => [
        p.person_code,
        p.full_name,
        p.work_email,
        p.phone,
        p.worker_type.toUpperCase(),
        p.department?.name || 'General',
        p.designation?.name || 'Staff',
        p.joining_date,
        p.current_status.toUpperCase(),
      ]),
    };

    if (format === 'csv') exportService.exportToCSV(payload, user.display_name);
    else if (format === 'xlsx') exportService.exportToExcel(payload, user.display_name);
    else exportService.exportToPDF(payload, user.display_name);

    toast.success(`Exported ${filteredPersons.length} records as ${format.toUpperCase()}`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Window Banner */}
      <div className="bg-white border-3 border-black p-5 sm:p-6 shadow-neo flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="sticker-tag bg-[#FF6B9D] text-black">
              CORE TALENT INDEX
            </span>
            <span className="sticker-tag bg-[#00D06C] text-black">
              {filteredPersons.length} PEOPLE
            </span>
          </div>
          <h1 className="font-mono text-2xl sm:text-3xl font-black text-black tracking-tight mt-1 uppercase">
            PEOPLE DIRECTORY
          </h1>
          <p className="text-xs sm:text-sm text-zinc-700 font-sans font-medium">
            Employees, interns, contractors, and leadership master records.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {canManagePeople && (
            <Button variant="green" size="sm" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1" /> Add Person
            </Button>
          )}

          <div className="flex items-center border-2 border-black bg-white shadow-neo-sm">
            <button
              onClick={() => setViewMode('table')}
              className={`h-8 px-2.5 flex items-center justify-center font-mono font-bold text-xs cursor-pointer ${
                viewMode === 'table' ? 'bg-[#FFDE59] text-black border-r-2 border-black' : 'text-black hover:bg-[#FAF7EE] border-r-2 border-black'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`h-8 px-2.5 flex items-center justify-center font-mono font-bold text-xs cursor-pointer ${
                viewMode === 'grid' ? 'bg-[#FFDE59] text-black' : 'text-black hover:bg-[#FAF7EE]'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <Button variant="white" size="sm" onClick={() => handleExportPeople('xlsx')}>
            <Download className="w-4 h-4 mr-1" /> Export XLSX
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border-3 border-black p-4 shadow-neo flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-black absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, ID, email, role, or team..."
            className="w-full bg-[#FCFAF5] border-2 border-black text-black pl-9 pr-3.5 py-1.5 font-mono text-xs focus:outline-hidden focus:bg-white shadow-[2px_2px_0px_#000]"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <select
            value={selectedWorkerType}
            onChange={(e) => setSelectedWorkerType(e.target.value)}
            className="bg-white border-2 border-black text-black px-2.5 py-1.5 font-mono text-xs font-bold cursor-pointer focus:outline-hidden shadow-[2px_2px_0px_#000]"
          >
            <option value="all">ALL WORKER TYPES</option>
            <option value="employee">EMPLOYEES (FT)</option>
            <option value="intern">INTERNS</option>
            <option value="consultant">CONSULTANTS</option>
            <option value="contractor">CONTRACTORS</option>
          </select>

          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
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
            <option value="active">ACTIVE</option>
            <option value="probation">PROBATION</option>
            <option value="intern_active">INTERN ACTIVE</option>
            <option value="on_leave">ON LEAVE</option>
            <option value="archived">ARCHIVED</option>
          </select>
        </div>
      </div>

      {/* Main List: Data Table or Cards View */}
      {filteredPersons.length === 0 ? (
        <div className="bg-white border-3 border-dashed border-black p-12 text-center shadow-neo">
          <div className="font-mono text-base font-black text-black uppercase">No records match your criteria</div>
          <p className="text-xs text-zinc-600 mt-1 font-sans font-medium">Try clearing filters or search queries.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setSelectedWorkerType('all');
              setSelectedDepartment('all');
              setSelectedStatus('all');
            }}
            className="mt-4"
          >
            RESET FILTERS
          </Button>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white border-3 border-black shadow-neo overflow-hidden">
          {/* Table Window Header */}
          <div className="bg-[#00D06C] border-b-3 border-black px-4 py-2 flex items-center justify-between font-mono text-xs font-black uppercase text-black">
            <span>EMPLOYEE RECORDS DATABASE</span>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-white border border-black inline-block text-[7px] leading-none text-center font-bold">_</span>
              <span className="w-2.5 h-2.5 bg-white border border-black inline-block text-[7px] leading-none text-center font-bold">□</span>
              <span className="w-2.5 h-2.5 bg-white border border-black inline-block text-[7px] leading-none text-center font-bold">✕</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#FAF7EE] border-b-2 border-black text-black uppercase tracking-wider font-black">
                <tr>
                  <th className="py-3 px-4">PERSON / CODE</th>
                  <th className="py-3 px-4">ROLE & DEPARTMENT</th>
                  <th className="py-3 px-4">WORKER TYPE</th>
                  <th className="py-3 px-4">MANAGER</th>
                  <th className="py-3 px-4">LOCATION</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black/10">
                {filteredPersons.map((p) => {
                  const workerBadge = getWorkerTypeBadge(p.worker_type);
                  const statusBadge = getStatusBadge(p.current_status);
                  return (
                    <tr key={p.id} className="hover:bg-[#FFFDF5] transition-colors group">
                      <td className="py-3.5 px-4">
                        <Link href={`/people/${p.id}`} className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#FFDE59] border-2 border-black flex items-center justify-center font-black text-xs text-black shadow-neo-sm">
                            {p.full_name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-black text-black group-hover:text-[#00D06C] transition-colors block">
                              {p.full_name}
                            </span>
                            <span className="text-[10px] text-zinc-600 font-bold">
                              {p.person_code} • {p.work_email}
                            </span>
                          </div>
                        </Link>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-black font-black">{p.designation?.name || 'Staff'}</div>
                        <div className="text-zinc-600 text-[11px] font-sans font-medium">{p.department?.name || 'General'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] px-1.5 py-0.5 border-2 border-black font-black uppercase ${workerBadge.color}`}>
                          {workerBadge.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-black font-bold">
                        {p.manager ? (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-zinc-600" />
                            {p.manager.full_name}
                          </span>
                        ) : (
                          <span className="text-zinc-500">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-black font-bold">{p.work_location}</div>
                        <div className="text-[10px] text-zinc-600 uppercase font-black">{p.remote_status}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] px-2 py-0.5 border-2 border-black font-black uppercase ${statusBadge.color}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/people/${p.id}`}>
                            <Button variant="white" size="sm" className="h-7 px-2">
                              <Eye className="w-3.5 h-3.5 mr-1" /> Profile
                            </Button>
                          </Link>
                          {canManagePeople && p.is_active && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedPersonForArchive(p);
                                setIsArchiveModalOpen(true);
                              }}
                              className="h-7 px-2 text-zinc-600 hover:text-[#FF4365]"
                              title="Deactivate / Soft Archive"
                            >
                              <Archive className="w-3.5 h-3.5" />
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
      ) : (
        /* Grid Card View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPersons.map((p) => {
            const workerBadge = getWorkerTypeBadge(p.worker_type);
            const statusBadge = getStatusBadge(p.current_status);
            return (
              <div
                key={p.id}
                className="bg-white border-3 border-black hover:shadow-neo-lg p-4 shadow-neo flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 bg-[#FFDE59] border-2 border-black flex items-center justify-center font-mono font-black text-sm text-black shadow-neo-sm">
                        {p.full_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-mono text-sm font-black text-black group-hover:text-[#00D06C] transition-colors">
                          {p.full_name}
                        </h3>
                        <span className="text-[11px] font-mono font-bold text-zinc-600">{p.person_code}</span>
                      </div>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 border-2 border-black font-black uppercase ${workerBadge.color}`}>
                      {workerBadge.label}
                    </span>
                  </div>

                  <div className="mt-3.5 space-y-1.5 text-xs font-mono text-zinc-700 border-t-2 border-black/10 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500 font-bold">ROLE:</span>
                      <span className="text-black font-black">{p.designation?.name || 'Staff'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500 font-bold">DEPT:</span>
                      <span className="font-bold">{p.department?.name || 'General'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500 font-bold">MANAGER:</span>
                      <span className="font-bold">{p.manager?.full_name || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500 font-bold">JOINED:</span>
                      <span className="font-bold">{formatDate(p.joining_date)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t-2 border-black/10 flex items-center justify-between">
                  <span className={`text-[10px] px-2 py-0.5 border-2 border-black font-black uppercase ${statusBadge.color}`}>
                    {statusBadge.label}
                  </span>
                  <Link href={`/people/${p.id}`}>
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      OPEN PROFILE →
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: ADD PERSON */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="CREATE PERSON MASTER RECORD"
        subtitle="Registers full profile, assigns ID, provisions leave balances & onboarding checklist"
        headerColor="green"
        maxWidth="3xl"
        footer={
          <>
            <Button variant="white" size="sm" onClick={() => setIsAddModalOpen(false)}>
              CANCEL
            </Button>
            <Button variant="green" size="sm" onClick={handleAddPersonSubmit}>
              CREATE & INITIALIZE RECORD
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddPersonSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Full Name"
              required
              placeholder="e.g. Maya Lin"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
            <Input
              label="Work Email"
              type="email"
              required
              placeholder="name@qevn.io"
              value={formData.work_email}
              onChange={(e) => setFormData({ ...formData, work_email: e.target.value })}
            />
            <Input
              label="Phone Number"
              required
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="Personal Email"
              type="email"
              placeholder="personal@gmail.com"
              value={formData.personal_email}
              onChange={(e) => setFormData({ ...formData, personal_email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 border-t-2 border-black/10">
            <Select
              label="Worker Type"
              value={formData.worker_type}
              onChange={(e) => setFormData({ ...formData, worker_type: e.target.value as WorkerType })}
              options={[
                { value: 'employee', label: 'Employee (Full-Time)' },
                { value: 'intern', label: 'Intern' },
                { value: 'consultant', label: 'Consultant' },
                { value: 'contractor', label: 'Contractor' },
                { value: 'other', label: 'Other' },
              ]}
            />
            <Select
              label="Department"
              value={formData.department_id}
              onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
              options={departments.map((d) => ({ value: d.id, label: d.name }))}
            />
            <Select
              label="Designation / Role"
              value={formData.designation_id}
              onChange={(e) => setFormData({ ...formData, designation_id: e.target.value })}
              options={designations.map((d) => ({ value: d.id, label: d.name }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 border-t-2 border-black/10">
            <Select
              label="Reporting Manager"
              value={formData.manager_person_id}
              onChange={(e) => setFormData({ ...formData, manager_person_id: e.target.value })}
              options={[
                { value: '', label: 'None (Direct / VP)' },
                ...persons.map((p) => ({ value: p.id, label: `${p.full_name} (${p.person_code})` })),
              ]}
            />
            <Input
              label="Joining Date"
              type="date"
              required
              value={formData.joining_date}
              onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
            />
            <Select
              label="Remote Mode"
              value={formData.remote_status}
              onChange={(e) => setFormData({ ...formData, remote_status: e.target.value as any })}
              options={[
                { value: 'office', label: 'Office' },
                { value: 'hybrid', label: 'Hybrid' },
                { value: 'remote', label: 'Remote' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 border-t-2 border-black/10">
            <Input
              label="Emergency Contact Name"
              placeholder="e.g. David Lin"
              value={formData.emergency_contact_name}
              onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
            />
            <Input
              label="Relation"
              placeholder="e.g. Spouse / Parent"
              value={formData.emergency_contact_relation}
              onChange={(e) => setFormData({ ...formData, emergency_contact_relation: e.target.value })}
            />
            <Input
              label="Emergency Phone"
              placeholder="+1 (555) 999-9999"
              value={formData.emergency_contact_phone}
              onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* MODAL 2: ARCHIVE PERSON */}
      <Modal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        title="DEACTIVATE & ARCHIVE PERSON RECORD"
        subtitle="Preserves complete historical attendance, leave, documents, and audit history"
        headerColor="pink"
        maxWidth="md"
        footer={
          <>
            <Button variant="white" size="sm" onClick={() => setIsArchiveModalOpen(false)}>
              CANCEL
            </Button>
            <Button variant="danger" size="sm" onClick={handleArchiveConfirm}>
              CONFIRM ARCHIVAL
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="p-3 bg-red-100 border-2 border-black text-black font-mono text-xs font-bold">
            WARNING: Archiving will mark <strong>{selectedPersonForArchive?.full_name}</strong> as inactive and
            revoke portal credentials. No past data will be erased.
          </div>

          <Input
            label="Last Working Date"
            type="date"
            required
            value={archiveLastWorkingDate}
            onChange={(e) => setArchiveLastWorkingDate(e.target.value)}
          />

          <Textarea
            label="Mandatory Reason for Deactivation"
            required
            placeholder="e.g. Resignation, internship completed, end of contract..."
            value={archiveReason}
            onChange={(e) => setArchiveReason(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}

export default function PeopleDirectoryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-black font-mono text-sm font-bold">Loading People Directory...</div>}>
      <PeopleDirectoryContent />
    </Suspense>
  );
}
