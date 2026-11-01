import {
  Department,
  Designation,
  EmploymentType,
  LeaveType,
  Holiday,
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
  AuditLog,
  NotificationItem,
  UserProfile,
  OnboardingTemplate
} from '@/types/database';

export const initialDepartments: Department[] = [
  { id: 'dept-1', name: 'Engineering & Tech', code: 'ENG', is_active: true, sort_order: 1, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: 'dept-2', name: 'Product & Design', code: 'PRD', is_active: true, sort_order: 2, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: 'dept-3', name: 'Operations & Growth', code: 'OPS', is_active: true, sort_order: 3, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: 'dept-4', name: 'People & Culture (HR)', code: 'HR', is_active: true, sort_order: 4, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: 'dept-5', name: 'Finance & Accounts', code: 'FIN', is_active: true, sort_order: 5, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
];


export const initialEmploymentTypes: EmploymentType[] = [
  { id: 'empt-1', name: 'Full Time', code: 'FT', is_active: true },
  { id: 'empt-2', name: 'Intern', code: 'INT', is_active: true },
  { id: 'empt-3', name: 'Part Time', code: 'PT', is_active: true },
  { id: 'empt-4', name: 'Consultant', code: 'CNS', is_active: true },
  { id: 'empt-5', name: 'Contractor', code: 'CTR', is_active: true },
];

export const initialLeaveTypes: LeaveType[] = [
  { id: 'lt-1', name: 'Casual / Personal Leave', code: 'CL', description: 'Personal time off for appointments and emergencies', requires_approval: true, allow_half_day: true, is_paid: true, balance_tracking_enabled: true, default_days_per_year: 12, is_active: true, color_code: '#00D06C' },
  { id: 'lt-2', name: 'Sick / Medical Leave', code: 'SL', description: 'Leave due to illness or health recovery', requires_approval: true, allow_half_day: true, is_paid: true, balance_tracking_enabled: true, default_days_per_year: 10, is_active: true, color_code: '#FF6B9D' },
  { id: 'lt-3', name: 'Earned / Vacation Leave', code: 'PL', description: 'Annual vacation time off', requires_approval: true, allow_half_day: true, is_paid: true, balance_tracking_enabled: true, default_days_per_year: 18, is_active: true, color_code: '#8B5CF6' },
  { id: 'lt-4', name: 'Work From Home (WFH)', code: 'WFH', description: 'Remote work day', requires_approval: true, allow_half_day: true, is_paid: true, balance_tracking_enabled: true, default_days_per_year: 24, is_active: true, color_code: '#38BDF8' },
  { id: 'lt-5', name: 'Unpaid Leave (LWP)', code: 'LWP', description: 'Leave without pay', requires_approval: true, allow_half_day: true, is_paid: false, balance_tracking_enabled: false, default_days_per_year: 0, is_active: true, color_code: '#A1A1AA' },
];

export const initialHolidays: Holiday[] = [
  { id: 'hol-1', name: "New Year's Day", holiday_date: '2026-01-01', year: 2026, is_optional: false, is_active: true },
  { id: 'hol-2', name: 'Republic Day', holiday_date: '2026-01-26', year: 2026, is_optional: false, is_active: true },
  { id: 'hol-3', name: 'Holi Festival', holiday_date: '2026-03-04', year: 2026, is_optional: false, is_active: true },
  { id: 'hol-4', name: 'Eid ul-Fitr', holiday_date: '2026-03-21', year: 2026, is_optional: false, is_active: true },
  { id: 'hol-5', name: 'Good Friday', holiday_date: '2026-04-03', year: 2026, is_optional: false, is_active: true },
  { id: 'hol-6', name: 'Independence Day', holiday_date: '2026-08-15', year: 2026, is_optional: false, is_active: true },
  { id: 'hol-7', name: 'Gandhi Jayanti', holiday_date: '2026-10-02', year: 2026, is_optional: false, is_active: true },
  { id: 'hol-8', name: 'Dussehra', holiday_date: '2026-10-20', year: 2026, is_optional: false, is_active: true },
  { id: 'hol-9', name: 'Diwali', holiday_date: '2026-11-08', year: 2026, is_optional: false, is_active: true },
  { id: 'hol-10', name: 'Christmas Day', holiday_date: '2026-12-25', year: 2026, is_optional: false, is_active: true },
];

export const initialDocumentRequirements: DocumentRequirement[] = [
  { id: 'dr-1', worker_type: 'employee', document_type: 'Government ID / Passport / Aadhaar', category: 'Joining', required: true, expiry_required: true, active: true },
  { id: 'dr-2', worker_type: 'employee', document_type: 'Signed Employment Agreement', category: 'Employment', required: true, expiry_required: false, active: true },
  { id: 'dr-3', worker_type: 'employee', document_type: 'Non-Disclosure Agreement (NDA)', category: 'Employment', required: true, expiry_required: false, active: true },
  { id: 'dr-4', worker_type: 'employee', document_type: 'Education & Previous Experience Certificates', category: 'Joining', required: true, expiry_required: false, active: true },
  { id: 'dr-5', worker_type: 'intern', document_type: 'Internship Agreement', category: 'Internship', required: true, expiry_required: false, active: true },
];

export const initialOnboardingTemplates: OnboardingTemplate[] = [
  {
    id: 'ot-1',
    name: 'Standard Team Onboarding',
    worker_type: 'employee',
    is_active: true,
    tasks: [
      { title: 'HR Profile Setup & ID Allocation', category: 'HR setup', description: 'Create employee record and email alias', default_owner_role: 'hr_admin', due_days_after_joining: 0 },
      { title: 'Identity & Address Document Verification', category: 'Documents', description: 'Collect and verify Government ID and agreements', default_owner_role: 'hr_admin', due_days_after_joining: 2 },
      { title: 'Corporate Email & GitHub Access Setup', category: 'Access', description: 'Provision email, GitHub organization, and tools', default_owner_role: 'hr_admin', due_days_after_joining: 1 },
      { title: 'Hardware Asset Handover', category: 'Access', description: 'Issue machine and configure security credentials', default_owner_role: 'hr_admin', due_days_after_joining: 1 },
      { title: 'Team Culture & Architecture Orientation', category: 'Orientation', description: 'Product roadmap and architecture walkthrough', default_owner_role: 'hr_admin', due_days_after_joining: 3 },
    ],
  },
];

/* Production starts with no demo records. People, attendance, leave, documents,
   audit and notifications are created by authorised users. */
export const initialDesignations: Designation[] = [];
export const initialPersons: Person[] = [];
export const initialEmploymentRecords: EmploymentRecord[] = [];
export const initialAttendanceRecords: AttendanceRecord[] = [];
export const initialLeaveBalances: LeaveBalance[] = [];
export const initialLeaveRequests: LeaveRequest[] = [];
export const initialDocuments: DocumentRecord[] = [];
export const initialOnboardingTasks: OnboardingTask[] = [];
export const initialLifecycleEvents: LifecycleEvent[] = [];
export const initialHRActions: HRAction[] = [];
export const initialAuditLogs: AuditLog[] = [];
export const initialNotifications: NotificationItem[] = [];
export const initialUserProfiles: UserProfile[] = [];
