// QEVN HRMS Database Types & Domain Definitions

export type WorkerType = 'employee' | 'intern' | 'consultant' | 'contractor' | 'other';

export type EmploymentStatusType =
  | 'active'
  | 'probation'
  | 'intern_active'
  | 'on_leave'
  | 'resigned'
  | 'exited'
  | 'discontinued'
  | 'archived';

export type AttendanceStatusType =
  | 'present'
  | 'absent'
  | 'leave'
  | 'half_day'
  | 'week_off'
  | 'holiday'
  | 'work_from_home';

export type LeaveRequestStatusType =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'clarification_required'
  | 'cancelled';

export type OnboardingTaskStatusType =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'blocked'
  | 'skipped';

export type OnboardingCategory =
  | 'HR setup'
  | 'Documents'
  | 'Access'
  | 'Orientation'
  | 'Manager';

export type DocumentCategoryType =
  | 'Joining'
  | 'Employment'
  | 'Internship'
  | 'Performance'
  | 'Exit'
  | 'Other';

export type DocumentVisibilityLevel =
  | 'hr_only'
  | 'hr_manager'
  | 'person'
  | 'management_read_only_metadata';

export type RoleName =
  | 'super_admin'
  | 'hr_admin'
  | 'manager'
  | 'employee'
  | 'management_readonly';

export type ProbationRecommendationType =
  | 'confirm'
  | 'extend'
  | 'end_employment'
  | 'pending';

export type InternshipStatusType =
  | 'active'
  | 'extended'
  | 'completed'
  | 'discontinued';

export interface Department {
  id: string;
  name: string;
  code: string;
  head_person_id?: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Designation {
  id: string;
  name: string;
  department_id?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmploymentType {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
}

export interface Person {
  id: string;
  person_code: string; // e.g. QEVN-101
  full_name: string;
  preferred_name?: string | null;
  photo_path?: string | null;
  personal_email?: string | null;
  work_email: string;
  phone: string;
  date_of_birth?: string | null;
  worker_type: WorkerType;
  work_location: string;
  remote_status: 'office' | 'hybrid' | 'remote';
  joining_date: string;
  current_status: EmploymentStatusType;
  last_working_date?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_relation?: string | null;
  emergency_contact_phone?: string | null;
  is_active: boolean;
  archived_at?: string | null;
  archived_by?: string | null;
  archive_reason?: string | null;
  created_at: string;
  updated_at: string;

  // Joined / Denormalized convenience properties
  department?: Department;
  department_id?: string;
  designation?: Designation;
  designation_id?: string;
  manager?: Person | null;
  manager_person_id?: string | null;
  employment_type_id?: string;
  employment_type_name?: string;
}

export interface EmploymentRecord {
  id: string;
  person_id: string;
  department_id: string;
  designation_id: string;
  manager_person_id?: string | null;
  employment_type_id: string;
  work_location: string;
  joining_date: string;
  effective_from: string;
  effective_to?: string | null;
  status: EmploymentStatusType;
  probation_start_date?: string | null;
  probation_end_date?: string | null;
  confirmation_status?: ProbationRecommendationType;
  internship_start_date?: string | null;
  internship_end_date?: string | null;
  internship_status?: InternshipStatusType;
  last_working_date?: string | null;
  reason_for_change?: string | null;
  created_by?: string;
  created_at: string;
  
  // Display joins
  department_name?: string;
  designation_name?: string;
  manager_name?: string;
}

export interface AttendanceRecord {
  id: string;
  person_id: string;
  attendance_date: string; // YYYY-MM-DD
  status: AttendanceStatusType;
  check_in_at?: string | null;
  check_out_at?: string | null;
  notes?: string | null;
  source: 'manual' | 'self_marked' | 'manager' | 'import' | 'system_leave_sync';
  corrected: boolean;
  correction_reason?: string | null;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;

  // Joined
  person_name?: string;
  person_code?: string;
  department_name?: string;
}

export interface LeaveType {
  id: string;
  name: string;
  code: string;
  description: string;
  requires_approval: boolean;
  allow_half_day: boolean;
  is_paid: boolean;
  balance_tracking_enabled: boolean;
  default_days_per_year: number;
  is_active: boolean;
  color_code?: string;
}

export interface LeaveBalance {
  id: string;
  person_id: string;
  leave_type_id: string;
  year: number;
  allocated: number;
  used: number;
  adjusted: number;
  notes?: string | null;
  leave_type?: LeaveType;
}

export interface LeaveRequest {
  id: string;
  person_id: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  is_half_day: boolean;
  reason: string;
  status: LeaveRequestStatusType;
  approver_person_id?: string | null;
  manager_comment?: string | null;
  requested_at: string;
  decided_at?: string | null;
  decision_reason?: string | null;
  created_by?: string;
  updated_by?: string;
  
  // Joins
  person?: Person;
  leave_type?: LeaveType;
  approver?: Person;
}

export interface Holiday {
  id: string;
  name: string;
  holiday_date: string; // YYYY-MM-DD
  year: number;
  location_group_id?: string | null;
  is_optional: boolean;
  is_active: boolean;
}

export interface DocumentRecord {
  id: string;
  person_id: string;
  category: DocumentCategoryType;
  document_type: string;
  storage_bucket: string;
  storage_path: string;
  original_file_name: string;
  mime_type: string;
  file_size: number;
  issue_date?: string | null;
  expiry_date?: string | null;
  is_required: boolean;
  visibility_level: DocumentVisibilityLevel;
  uploaded_by: string;
  uploaded_at: string;
  version: number;
  is_current: boolean;
  notes?: string | null;
  file_url?: string;
  
  // Joins
  person_name?: string;
  person_code?: string;
}

export interface DocumentRequirement {
  id: string;
  worker_type: WorkerType;
  employment_type_id?: string | null;
  document_type: string;
  category: DocumentCategoryType;
  required: boolean;
  expiry_required: boolean;
  active: boolean;
}

export interface OnboardingTemplate {
  id: string;
  name: string;
  worker_type: WorkerType;
  department_id?: string | null;
  is_active: boolean;
  tasks: {
    title: string;
    category: OnboardingCategory;
    description: string;
    default_owner_role: string;
    due_days_after_joining: number;
  }[];
}

export interface OnboardingTask {
  id: string;
  person_id: string;
  template_task_id?: string | null;
  title: string;
  category: OnboardingCategory;
  description?: string | null;
  owner_person_id?: string | null;
  status: OnboardingTaskStatusType;
  due_date: string;
  completed_at?: string | null;
  completed_by?: string | null;
  notes?: string | null;
  
  // Joins
  person_name?: string;
  owner_name?: string;
}

export interface LifecycleEvent {
  id: string;
  person_id: string;
  event_type: string;
  event_date: string;
  effective_date: string;
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
  actor_person_id?: string | null;
  actor_name?: string;
  created_at: string;
}

export interface HRAction {
  id: string;
  person_id: string;
  action_type: 'promotion' | 'transfer' | 'disciplinary' | 'probation_decision' | 'recognition' | 'note' | 'salary_review';
  title: string;
  description: string;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  visibility_level: DocumentVisibilityLevel;
  reference_type?: string | null;
  reference_id?: string | null;
  action_date: string;
  created_by: string;
  created_at: string;
}

export interface PerformanceSnapshot {
  id: string;
  person_id: string;
  review_period: string; // e.g. Q1 2026, H1 2026
  manager_person_id?: string | null;
  rating: number; // 1 to 5
  status: 'draft' | 'submitted' | 'acknowledged';
  strengths: string;
  improvement_areas: string;
  next_period_goals: string;
  review_date: string;
  acknowledged_at?: string | null;
  acknowledged_by?: string | null;
  manager_name?: string;
}

export interface AuditLog {
  id: string;
  actor_user_id?: string;
  actor_person_id?: string;
  actor_name: string;
  entity_type: string; // 'person' | 'attendance' | 'leave_request' | 'document' | 'onboarding_task' | 'settings'
  entity_id: string;
  action: 'create' | 'update' | 'delete' | 'archive' | 'approve' | 'reject' | 'correct' | 'import';
  before_data?: Record<string, unknown> | null;
  after_data?: Record<string, unknown> | null;
  reason?: string | null;
  ip_hash_or_safe_metadata?: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  recipient_person_id?: string;
  type: 'approval_needed' | 'deadline' | 'document' | 'attendance' | 'lifecycle' | 'system';
  title: string;
  message: string;
  reference_type?: string;
  reference_id?: string;
  link_url?: string;
  read_at?: string | null;
  created_at: string;
}

export interface UserProfile {
  id: string;
  auth_user_id: string;
  person_id?: string;
  display_name: string;
  email: string;
  avatar_url?: string;
  role: RoleName;
  is_active: boolean;
  person?: Person;
}
