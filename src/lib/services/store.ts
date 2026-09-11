import {
  Person,
  Department,
  Designation,
  EmploymentType,
  EmploymentRecord,
  AttendanceRecord,
  LeaveType,
  LeaveBalance,
  LeaveRequest,
  Holiday,
  DocumentRecord,
  DocumentRequirement,
  OnboardingTask,
  OnboardingTemplate,
  LifecycleEvent,
  HRAction,
  PerformanceSnapshot,
  AuditLog,
  NotificationItem,
  UserProfile,
} from '@/types/database';

import {
  initialDepartments,
  initialDesignations,
  initialEmploymentTypes,
  initialLeaveTypes,
  initialHolidays,
  initialDocumentRequirements,
  initialOnboardingTemplates,
  initialPersons,
  initialEmploymentRecords,
  initialAttendanceRecords,
  initialLeaveBalances,
  initialLeaveRequests,
  initialDocuments,
  initialOnboardingTasks,
  initialLifecycleEvents,
  initialHRActions,
  initialAuditLogs,
  initialNotifications,
  initialUserProfiles,
} from '@/lib/data/initialSeedData';

const STORAGE_KEY_PREFIX = 'qevn_hrms_v1_';

interface DataStoreState {
  persons: Person[];
  departments: Department[];
  designations: Designation[];
  employmentTypes: EmploymentType[];
  employmentRecords: EmploymentRecord[];
  attendance: AttendanceRecord[];
  leaveTypes: LeaveType[];
  leaveBalances: LeaveBalance[];
  leaveRequests: LeaveRequest[];
  holidays: Holiday[];
  documents: DocumentRecord[];
  documentRequirements: DocumentRequirement[];
  onboardingTemplates: OnboardingTemplate[];
  onboardingTasks: OnboardingTask[];
  lifecycleEvents: LifecycleEvent[];
  hrActions: HRAction[];
  performanceSnapshots: PerformanceSnapshot[];
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  userProfiles: UserProfile[];
  currentRole: string;
}

class HRMSDataStore {
  private state: DataStoreState;
  private listeners: Set<() => void> = new Set();
  private initialized = false;

  constructor() {
    this.state = {
      persons: initialPersons,
      departments: initialDepartments,
      designations: initialDesignations,
      employmentTypes: initialEmploymentTypes,
      employmentRecords: initialEmploymentRecords,
      attendance: initialAttendanceRecords,
      leaveTypes: initialLeaveTypes,
      leaveBalances: initialLeaveBalances,
      leaveRequests: initialLeaveRequests,
      holidays: initialHolidays,
      documents: initialDocuments,
      documentRequirements: initialDocumentRequirements,
      onboardingTemplates: initialOnboardingTemplates,
      onboardingTasks: initialOnboardingTasks,
      lifecycleEvents: initialLifecycleEvents,
      hrActions: initialHRActions,
      performanceSnapshots: [],
      auditLogs: initialAuditLogs,
      notifications: initialNotifications,
      userProfiles: initialUserProfiles,
      currentRole: 'super_admin',
    };
  }

  public init() {
    if (typeof window === 'undefined' || this.initialized) return;

    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}state`);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.state = { ...this.state, ...parsed };
      } else {
        this.persist();
      }
    } catch {
      // fallback to memory
    }
    this.initialized = true;
  }

  private persist() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}state`, JSON.stringify(this.state));
      this.notify();
    } catch {
      // Storage quota or private mode
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public resetToSeedData() {
    this.state = {
      persons: [...initialPersons],
      departments: [...initialDepartments],
      designations: [...initialDesignations],
      employmentTypes: [...initialEmploymentTypes],
      employmentRecords: [...initialEmploymentRecords],
      attendance: [...initialAttendanceRecords],
      leaveTypes: [...initialLeaveTypes],
      leaveBalances: [...initialLeaveBalances],
      leaveRequests: [...initialLeaveRequests],
      holidays: [...initialHolidays],
      documents: [...initialDocuments],
      documentRequirements: [...initialDocumentRequirements],
      onboardingTemplates: [...initialOnboardingTemplates],
      onboardingTasks: [...initialOnboardingTasks],
      lifecycleEvents: [...initialLifecycleEvents],
      hrActions: [...initialHRActions],
      performanceSnapshots: [],
      auditLogs: [...initialAuditLogs],
      notifications: [...initialNotifications],
      userProfiles: [...initialUserProfiles],
      currentRole: this.state.currentRole,
    };
    this.persist();
  }

  // --- GETTERS ---
  public getPersons(): Person[] {
    this.init();
    return this.state.persons.map((p) => {
      const dept = this.state.departments.find((d) => d.id === p.department_id);
      const desig = this.state.designations.find((d) => d.id === p.designation_id);
      const manager = p.manager_person_id ? this.state.persons.find((m) => m.id === p.manager_person_id) : null;
      const empType = this.state.employmentTypes.find((et) => et.id === p.employment_type_id);
      return {
        ...p,
        department: dept,
        designation: desig,
        manager: manager || null,
        employment_type_name: empType?.name || 'Full Time',
      };
    });
  }

  public getPersonById(id: string): Person | null {
    const persons = this.getPersons();
    return persons.find((p) => p.id === id) || null;
  }

  public getDepartments(): Department[] {
    this.init();
    return this.state.departments;
  }

  public getDesignations(): Designation[] {
    this.init();
    return this.state.designations;
  }

  public getEmploymentTypes(): EmploymentType[] {
    this.init();
    return this.state.employmentTypes;
  }

  public getEmploymentRecords(personId?: string): EmploymentRecord[] {
    this.init();
    if (personId) {
      return this.state.employmentRecords.filter((er) => er.person_id === personId);
    }
    return this.state.employmentRecords;
  }

  public getAttendance(date?: string, personId?: string): AttendanceRecord[] {
    this.init();
    let records = this.state.attendance;
    if (date) {
      records = records.filter((r) => r.attendance_date === date);
    }
    if (personId) {
      records = records.filter((r) => r.person_id === personId);
    }
    const persons = this.getPersons();
    return records.map((r) => {
      const p = persons.find((person) => person.id === r.person_id);
      return {
        ...r,
        person_name: p?.full_name || 'Unknown',
        person_code: p?.person_code || '',
        department_name: p?.department?.name || '',
      };
    });
  }

  public getLeaveTypes(): LeaveType[] {
    this.init();
    return this.state.leaveTypes;
  }

  public getLeaveBalances(personId?: string): LeaveBalance[] {
    this.init();
    const balances = personId ? this.state.leaveBalances.filter((b) => b.person_id === personId) : this.state.leaveBalances;
    return balances.map((b) => ({
      ...b,
      leave_type: this.state.leaveTypes.find((lt) => lt.id === b.leave_type_id),
    }));
  }

  public getLeaveRequests(personId?: string): LeaveRequest[] {
    this.init();
    const persons = this.getPersons();
    let requests = this.state.leaveRequests;
    if (personId) {
      requests = requests.filter((lr) => lr.person_id === personId);
    }
    return requests.map((lr) => {
      const person = persons.find((p) => p.id === lr.person_id);
      const leaveType = this.state.leaveTypes.find((lt) => lt.id === lr.leave_type_id);
      const approver = lr.approver_person_id ? persons.find((p) => p.id === lr.approver_person_id) : undefined;
      return {
        ...lr,
        person,
        leave_type: leaveType,
        approver,
      };
    });
  }

  public getHolidays(year?: number): Holiday[] {
    this.init();
    if (year) {
      return this.state.holidays.filter((h) => h.year === year);
    }
    return this.state.holidays;
  }

  public getDocuments(personId?: string): DocumentRecord[] {
    this.init();
    const persons = this.getPersons();
    let docs = this.state.documents;
    if (personId) {
      docs = docs.filter((d) => d.person_id === personId);
    }
    return docs.map((d) => {
      const p = persons.find((person) => person.id === d.person_id);
      return {
        ...d,
        person_name: p?.full_name,
        person_code: p?.person_code,
      };
    });
  }

  public getDocumentRequirements(workerType?: string): DocumentRequirement[] {
    this.init();
    if (workerType) {
      return this.state.documentRequirements.filter((dr) => dr.worker_type === workerType);
    }
    return this.state.documentRequirements;
  }

  public getOnboardingTasks(personId?: string): OnboardingTask[] {
    this.init();
    const persons = this.getPersons();
    let tasks = this.state.onboardingTasks;
    if (personId) {
      tasks = tasks.filter((t) => t.person_id === personId);
    }
    return tasks.map((t) => {
      const person = persons.find((p) => p.id === t.person_id);
      const owner = t.owner_person_id ? persons.find((p) => p.id === t.owner_person_id) : undefined;
      return {
        ...t,
        person_name: person?.full_name,
        owner_name: owner?.full_name || 'HR Team',
      };
    });
  }

  public getOnboardingTemplates(): OnboardingTemplate[] {
    this.init();
    return this.state.onboardingTemplates;
  }

  public getLifecycleEvents(personId?: string): LifecycleEvent[] {
    this.init();
    if (personId) {
      return this.state.lifecycleEvents.filter((le) => le.person_id === personId);
    }
    return this.state.lifecycleEvents;
  }

  public getHRActions(personId?: string): HRAction[] {
    this.init();
    if (personId) {
      return this.state.hrActions.filter((ha) => ha.person_id === personId);
    }
    return this.state.hrActions;
  }

  public getPerformanceSnapshots(personId?: string): PerformanceSnapshot[] {
    this.init();
    const persons = this.getPersons();
    let snaps = this.state.performanceSnapshots;
    if (personId) {
      snaps = snaps.filter((s) => s.person_id === personId);
    }
    return snaps.map((s) => {
      const mgr = s.manager_person_id ? persons.find((p) => p.id === s.manager_person_id) : undefined;
      return {
        ...s,
        manager_name: mgr?.full_name,
      };
    });
  }

  public getAuditLogs(): AuditLog[] {
    this.init();
    return this.state.auditLogs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getNotifications(): NotificationItem[] {
    this.init();
    return this.state.notifications;
  }

  public getUserProfiles(): UserProfile[] {
    this.init();
    return this.state.userProfiles;
  }

  public getCurrentRole(): string {
    this.init();
    return this.state.currentRole;
  }

  public setCurrentRole(role: string) {
    this.state.currentRole = role;
    this.persist();
  }

  // --- MUTATIONS ---

  public addAuditLog(log: Omit<AuditLog, 'id' | 'created_at'>) {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      created_at: new Date().toISOString(),
      ...log,
    };
    this.state.auditLogs.unshift(newLog);
    this.persist();
  }

  public addPerson(personData: Omit<Person, 'id' | 'created_at' | 'updated_at'>, actorName: string = 'HR Admin'): Person {
    const nextNum = this.state.persons.length + 1;
    const personCode = personData.person_code || `QEVN-${String(nextNum).padStart(3, '0')}`;
    const newPerson: Person = {
      id: `person-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...personData,
      person_code: personCode,
      is_active: true,
    };

    this.state.persons.push(newPerson);

    // Create initial employment record
    if (personData.department_id && personData.designation_id) {
      const er: EmploymentRecord = {
        id: `er-${Date.now()}`,
        person_id: newPerson.id,
        department_id: personData.department_id,
        designation_id: personData.designation_id,
        manager_person_id: personData.manager_person_id,
        employment_type_id: personData.employment_type_id || 'empt-1',
        work_location: personData.work_location,
        joining_date: personData.joining_date,
        effective_from: personData.joining_date,
        status: personData.current_status,
        created_at: new Date().toISOString(),
      };
      this.state.employmentRecords.push(er);
    }

    // Allocate initial leave balances
    this.state.leaveTypes.forEach((lt) => {
      this.state.leaveBalances.push({
        id: `lb-${Date.now()}-${lt.id}`,
        person_id: newPerson.id,
        leave_type_id: lt.id,
        year: new Date().getFullYear(),
        allocated: lt.default_days_per_year,
        used: 0,
        adjusted: 0,
      });
    });

    // Generate onboarding tasks from matching template
    const template = this.state.onboardingTemplates.find((t) => t.worker_type === newPerson.worker_type && t.is_active);
    if (template) {
      const joiningDateObj = new Date(newPerson.joining_date);
      template.tasks.forEach((t, idx) => {
        const dueDate = new Date(joiningDateObj);
        dueDate.setDate(dueDate.getDate() + t.due_days_after_joining);
        this.state.onboardingTasks.push({
          id: `task-${Date.now()}-${idx}`,
          person_id: newPerson.id,
          title: t.title,
          category: t.category,
          description: t.description,
          owner_person_id: t.default_owner_role === 'manager' ? newPerson.manager_person_id : null,
          status: 'pending',
          due_date: dueDate.toISOString().split('T')[0],
        });
      });
    }

    // Add Lifecycle Event
    this.state.lifecycleEvents.push({
      id: `lce-${Date.now()}`,
      person_id: newPerson.id,
      event_type: 'Joined',
      event_date: newPerson.joining_date,
      effective_date: newPerson.joining_date,
      title: `Joined QEVN as ${newPerson.worker_type.toUpperCase()}`,
      description: `New person profile created with Code ${personCode}.`,
      actor_name: actorName,
      created_at: new Date().toISOString(),
    });

    this.addAuditLog({
      actor_name: actorName,
      entity_type: 'person',
      entity_id: newPerson.id,
      action: 'create',
      after_data: newPerson as unknown as Record<string, unknown>,
      reason: `Created master profile for ${newPerson.full_name} (${personCode})`,
    });

    this.persist();
    return newPerson;
  }

  public updatePerson(id: string, updates: Partial<Person>, actorName: string = 'HR Admin'): Person | null {
    const idx = this.state.persons.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    const before = { ...this.state.persons[idx] };
    const updated: Person = {
      ...this.state.persons[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // Check if department or manager or designation changed to create employment record
    if (
      (updates.department_id && updates.department_id !== before.department_id) ||
      (updates.designation_id && updates.designation_id !== before.designation_id) ||
      (updates.manager_person_id !== undefined && updates.manager_person_id !== before.manager_person_id)
    ) {
      this.state.employmentRecords.push({
        id: `er-${Date.now()}`,
        person_id: id,
        department_id: updated.department_id || before.department_id || 'dept-1',
        designation_id: updated.designation_id || before.designation_id || 'desig-1',
        manager_person_id: updated.manager_person_id,
        employment_type_id: updated.employment_type_id || before.employment_type_id || 'empt-1',
        work_location: updated.work_location,
        joining_date: updated.joining_date,
        effective_from: new Date().toISOString().split('T')[0],
        status: updated.current_status,
        reason_for_change: 'Role or assignment update',
        created_at: new Date().toISOString(),
      });

      this.state.lifecycleEvents.push({
        id: `lce-${Date.now()}`,
        person_id: id,
        event_type: 'Assignment Change',
        event_date: new Date().toISOString().split('T')[0],
        effective_date: new Date().toISOString().split('T')[0],
        title: 'Department, Role or Manager Assignment Updated',
        description: `Updated profile details.`,
        actor_name: actorName,
        created_at: new Date().toISOString(),
      });
    }

    this.state.persons[idx] = updated;

    this.addAuditLog({
      actor_name: actorName,
      entity_type: 'person',
      entity_id: id,
      action: 'update',
      before_data: before as unknown as Record<string, unknown>,
      after_data: updated as unknown as Record<string, unknown>,
      reason: 'Profile details updated',
    });

    this.persist();
    return updated;
  }

  public archivePerson(id: string, reason: string, lastWorkingDate: string, actorName: string = 'HR Admin'): boolean {
    const idx = this.state.persons.findIndex((p) => p.id === id);
    if (idx === -1) return false;

    const before = { ...this.state.persons[idx] };
    const updated: Person = {
      ...before,
      is_active: false,
      current_status: 'archived',
      last_working_date: lastWorkingDate,
      archived_at: new Date().toISOString(),
      archived_by: actorName,
      archive_reason: reason,
      updated_at: new Date().toISOString(),
    };

    this.state.persons[idx] = updated;

    this.state.lifecycleEvents.push({
      id: `lce-${Date.now()}`,
      person_id: id,
      event_type: 'Exit',
      event_date: lastWorkingDate,
      effective_date: lastWorkingDate,
      title: 'Person Profile Deactivated & Archived',
      description: `Reason: ${reason}. Historical records preserved.`,
      actor_name: actorName,
      created_at: new Date().toISOString(),
    });

    this.addAuditLog({
      actor_name: actorName,
      entity_type: 'person',
      entity_id: id,
      action: 'archive',
      before_data: before as unknown as Record<string, unknown>,
      after_data: updated as unknown as Record<string, unknown>,
      reason,
    });

    this.persist();
    return true;
  }

  public markAttendance(record: Omit<AttendanceRecord, 'id' | 'created_at' | 'updated_at'>, actorName: string = 'Self'): AttendanceRecord {
    const existingIdx = this.state.attendance.findIndex(
      (a) => a.person_id === record.person_id && a.attendance_date === record.attendance_date
    );

    const now = new Date().toISOString();
    if (existingIdx >= 0) {
      const before = { ...this.state.attendance[existingIdx] };
      const updated: AttendanceRecord = {
        ...before,
        ...record,
        updated_at: now,
      };
      this.state.attendance[existingIdx] = updated;

      if (record.corrected) {
        this.addAuditLog({
          actor_name: actorName,
          entity_type: 'attendance',
          entity_id: updated.id,
          action: 'correct',
          before_data: before as unknown as Record<string, unknown>,
          after_data: updated as unknown as Record<string, unknown>,
          reason: record.correction_reason || 'Attendance corrected with reason',
        });
      }

      this.persist();
      return updated;
    } else {
      const newRecord: AttendanceRecord = {
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        created_at: now,
        updated_at: now,
        ...record,
      };
      this.state.attendance.push(newRecord);
      this.persist();
      return newRecord;
    }
  }

  public bulkMarkAttendance(date: string, records: { person_id: string; status: AttendanceRecord['status']; notes?: string }[], actorName: string = 'HR Admin') {
    records.forEach((r) => {
      this.markAttendance(
        {
          person_id: r.person_id,
          attendance_date: date,
          status: r.status,
          notes: r.notes,
          source: 'manual',
          corrected: false,
        },
        actorName
      );
    });
  }

  public submitLeaveRequest(request: Omit<LeaveRequest, 'id' | 'status' | 'requested_at'>, actorName: string = 'Employee'): LeaveRequest {
    const newRequest: LeaveRequest = {
      id: `lr-${Date.now()}`,
      status: 'pending',
      requested_at: new Date().toISOString(),
      ...request,
    };
    this.state.leaveRequests.push(newRequest);

    this.addAuditLog({
      actor_name: actorName,
      entity_type: 'leave_request',
      entity_id: newRequest.id,
      action: 'create',
      after_data: newRequest as unknown as Record<string, unknown>,
      reason: `Leave request submitted for ${request.duration_days} day(s)`,
    });

    // Add notification
    const person = this.getPersonById(request.person_id);
    this.state.notifications.unshift({
      id: `notif-${Date.now()}`,
      type: 'approval_needed',
      title: 'New Leave Request Submitted',
      message: `${person?.full_name || 'An employee'} requested ${request.duration_days} day(s) off.`,
      link_url: '/leave',
      created_at: new Date().toISOString(),
    });

    this.persist();
    return newRequest;
  }

  public decideLeaveRequest(
    id: string,
    decision: 'approved' | 'rejected' | 'clarification_required',
    comment?: string,
    actorName: string = 'Manager'
  ): boolean {
    const idx = this.state.leaveRequests.findIndex((lr) => lr.id === id);
    if (idx === -1) return false;

    const request = this.state.leaveRequests[idx];
    const before = { ...request };

    request.status = decision;
    request.decided_at = new Date().toISOString();
    request.manager_comment = comment;

    // --- CRITICAL RULE: AUTOMATIC ATTENDANCE SYNC ON APPROVAL ---
    if (decision === 'approved') {
      const start = new Date(request.start_date);
      const end = new Date(request.end_date);

      const cur = new Date(start);
      while (cur <= end) {
        const dayOfWeek = cur.getDay();
        // Skip Saturday (6) and Sunday (0) for work sync if week-off
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          const dateStr = cur.toISOString().split('T')[0];
          this.markAttendance(
            {
              person_id: request.person_id,
              attendance_date: dateStr,
              status: request.is_half_day ? 'half_day' : 'leave',
              notes: `Approved Leave: ${request.reason}`,
              source: 'system_leave_sync',
              corrected: false,
            },
            'System Leave Sync'
          );
        }
        cur.setDate(cur.getDate() + 1);
      }

      // Deduct balance
      const balance = this.state.leaveBalances.find(
        (b) => b.person_id === request.person_id && b.leave_type_id === request.leave_type_id && b.year === new Date(request.start_date).getFullYear()
      );
      if (balance) {
        balance.used += request.duration_days;
      }
    }

    this.addAuditLog({
      actor_name: actorName,
      entity_type: 'leave_request',
      entity_id: id,
      action: decision === 'approved' ? 'approve' : 'reject',
      before_data: before as unknown as Record<string, unknown>,
      after_data: request as unknown as Record<string, unknown>,
      reason: comment || `Leave request ${decision}`,
    });

    this.persist();
    return true;
  }

  public uploadDocument(doc: Omit<DocumentRecord, 'id' | 'uploaded_at' | 'version' | 'is_current'>, actorName: string = 'HR Admin'): DocumentRecord {
    const newDoc: DocumentRecord = {
      id: `doc-${Date.now()}`,
      uploaded_at: new Date().toISOString(),
      version: 1,
      is_current: true,
      ...doc,
    };
    this.state.documents.push(newDoc);

    this.addAuditLog({
      actor_name: actorName,
      entity_type: 'document',
      entity_id: newDoc.id,
      action: 'create',
      after_data: newDoc as unknown as Record<string, unknown>,
      reason: `Uploaded ${newDoc.document_type} for person ${newDoc.person_id}`,
    });

    this.persist();
    return newDoc;
  }

  public updateOnboardingTask(id: string, status: OnboardingTask['status'], actorName: string = 'HR Admin'): boolean {
    const task = this.state.onboardingTasks.find((t) => t.id === id);
    if (!task) return false;

    const before = { ...task };
    task.status = status;
    if (status === 'completed') {
      task.completed_at = new Date().toISOString();
      task.completed_by = actorName;
    } else {
      task.completed_at = null;
      task.completed_by = null;
    }

    this.addAuditLog({
      actor_name: actorName,
      entity_type: 'onboarding_task',
      entity_id: id,
      action: 'update',
      before_data: before as unknown as Record<string, unknown>,
      after_data: task as unknown as Record<string, unknown>,
      reason: `Task status updated to ${status}`,
    });

    this.persist();
    return true;
  }

  public recordProbationDecision(
    personId: string,
    recommendation: 'confirm' | 'extend' | 'end_employment',
    notes: string,
    newEndDate?: string,
    actorName: string = 'HR Admin'
  ): boolean {
    const person = this.state.persons.find((p) => p.id === personId);
    if (!person) return false;

    if (recommendation === 'confirm') {
      person.current_status = 'active';
      this.state.lifecycleEvents.push({
        id: `lce-${Date.now()}`,
        person_id: personId,
        event_type: 'Probation Confirmed',
        event_date: new Date().toISOString().split('T')[0],
        effective_date: new Date().toISOString().split('T')[0],
        title: 'Probation Completed & Confirmed as Full-Time Employee',
        description: notes || 'Successfully cleared probation evaluation.',
        actor_name: actorName,
        created_at: new Date().toISOString(),
      });
    } else if (recommendation === 'extend') {
      this.state.lifecycleEvents.push({
        id: `lce-${Date.now()}`,
        person_id: personId,
        event_type: 'Probation Extended',
        event_date: new Date().toISOString().split('T')[0],
        effective_date: newEndDate || new Date().toISOString().split('T')[0],
        title: `Probation Extended until ${newEndDate}`,
        description: notes || 'Extension granted for additional performance review period.',
        actor_name: actorName,
        created_at: new Date().toISOString(),
      });
    }

    this.addAuditLog({
      actor_name: actorName,
      entity_type: 'person',
      entity_id: personId,
      action: 'update',
      after_data: { probation_status: recommendation, notes },
      reason: `Probation decision recorded: ${recommendation}`,
    });

    this.persist();
    return true;
  }

  public recordInternshipCompletion(
    personId: string,
    status: 'completed' | 'extended' | 'discontinued',
    notes: string,
    actorName: string = 'HR Admin'
  ): boolean {
    const person = this.state.persons.find((p) => p.id === personId);
    if (!person) return false;

    if (status === 'completed') {
      this.state.lifecycleEvents.push({
        id: `lce-${Date.now()}`,
        person_id: personId,
        event_type: 'Internship Completed',
        event_date: new Date().toISOString().split('T')[0],
        effective_date: new Date().toISOString().split('T')[0],
        title: 'Internship Term Completed with Honors',
        description: notes || 'Completed all project deliverables and final internship presentation.',
        actor_name: actorName,
        created_at: new Date().toISOString(),
      });
    }

    this.addAuditLog({
      actor_name: actorName,
      entity_type: 'person',
      entity_id: personId,
      action: 'update',
      after_data: { internship_status: status, notes },
      reason: `Internship milestone decision: ${status}`,
    });

    this.persist();
    return true;
  }

  public addHRAction(action: Omit<HRAction, 'id' | 'created_at'>, actorName: string = 'HR Admin'): HRAction {
    const newAction: HRAction = {
      id: `hra-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...action,
    };
    this.state.hrActions.unshift(newAction);

    this.addAuditLog({
      actor_name: actorName,
      entity_type: 'hr_action',
      entity_id: newAction.id,
      action: 'create',
      after_data: newAction as unknown as Record<string, unknown>,
      reason: `Logged HR action: ${newAction.title}`,
    });

    this.persist();
    return newAction;
  }

  public savePerformanceSnapshot(snap: Omit<PerformanceSnapshot, 'id'>, actorName: string = 'Manager'): PerformanceSnapshot {
    const newSnap: PerformanceSnapshot = {
      id: `snap-${Date.now()}`,
      ...snap,
    };
    this.state.performanceSnapshots.unshift(newSnap);

    this.addAuditLog({
      actor_name: actorName,
      entity_type: 'performance_snapshot',
      entity_id: newSnap.id,
      action: 'create',
      after_data: newSnap as unknown as Record<string, unknown>,
      reason: `Recorded review for period ${newSnap.review_period}`,
    });

    this.persist();
    return newSnap;
  }

  public addDepartment(dept: Omit<Department, 'id' | 'created_at' | 'updated_at'>, actorName: string = 'HR Admin'): Department {
    const newDept: Department = {
      id: `dept-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...dept,
    };
    this.state.departments.push(newDept);
    this.addAuditLog({
      actor_name: actorName,
      entity_type: 'settings',
      entity_id: newDept.id,
      action: 'create',
      after_data: newDept as unknown as Record<string, unknown>,
      reason: `Created department ${newDept.name}`,
    });
    this.persist();
    return newDept;
  }

  public addDesignation(desig: Omit<Designation, 'id' | 'created_at' | 'updated_at'>, actorName: string = 'HR Admin'): Designation {
    const newDesig: Designation = {
      id: `desig-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...desig,
    };
    this.state.designations.push(newDesig);
    this.addAuditLog({
      actor_name: actorName,
      entity_type: 'settings',
      entity_id: newDesig.id,
      action: 'create',
      after_data: newDesig as unknown as Record<string, unknown>,
      reason: `Created designation ${newDesig.name}`,
    });
    this.persist();
    return newDesig;
  }

  public addHoliday(hol: Omit<Holiday, 'id'>, actorName: string = 'HR Admin'): Holiday {
    const newHoliday: Holiday = {
      id: `hol-${Date.now()}`,
      ...hol,
    };
    this.state.holidays.push(newHoliday);
    this.addAuditLog({
      actor_name: actorName,
      entity_type: 'settings',
      entity_id: newHoliday.id,
      action: 'create',
      after_data: newHoliday as unknown as Record<string, unknown>,
      reason: `Added holiday ${newHoliday.name}`,
    });
    this.persist();
    return newHoliday;
  }

  public addLeaveType(lt: Omit<LeaveType, 'id'>, actorName: string = 'HR Admin'): LeaveType {
    const newLt: LeaveType = {
      id: `lt-${Date.now()}`,
      ...lt,
    };
    this.state.leaveTypes.push(newLt);
    this.addAuditLog({
      actor_name: actorName,
      entity_type: 'settings',
      entity_id: newLt.id,
      action: 'create',
      after_data: newLt as unknown as Record<string, unknown>,
      reason: `Added leave policy type ${newLt.name}`,
    });
    this.persist();
    return newLt;
  }
}

export const hrmsStore = new HRMSDataStore();
