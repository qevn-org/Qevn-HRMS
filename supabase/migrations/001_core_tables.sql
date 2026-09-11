-- ==============================================================================
-- QEVN HRMS — Migration 001: Core Tables & Lookups (Phase 1)
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Departments
create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  head_person_id uuid,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Designations
create table if not exists public.designations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  department_id uuid references public.departments(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Employment Types
create table if not exists public.employment_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 4. Persons (Master Record)
create table if not exists public.persons (
  id uuid primary key default gen_random_uuid(),
  person_code text not null unique,
  full_name text not null,
  preferred_name text,
  photo_path text,
  personal_email text,
  work_email text not null unique,
  phone text not null,
  date_of_birth date,
  worker_type text not null check (worker_type in ('employee', 'intern', 'consultant', 'contractor', 'other')),
  work_location text not null default 'San Francisco HQ',
  remote_status text not null default 'office' check (remote_status in ('office', 'hybrid', 'remote')),
  joining_date date not null,
  current_status text not null default 'active' check (current_status in ('active', 'probation', 'intern_active', 'on_leave', 'resigned', 'exited', 'discontinued', 'archived')),
  last_working_date date,
  emergency_contact_name text,
  emergency_contact_relation text,
  emergency_contact_phone text,
  is_active boolean not null default true,
  archived_at timestamptz,
  archived_by text,
  archive_reason text,
  department_id uuid references public.departments(id),
  designation_id uuid references public.designations(id),
  manager_person_id uuid references public.persons(id),
  employment_type_id uuid references public.employment_types(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add circular foreign key for Department Head
alter table public.departments
  add constraint fk_department_head
  foreign key (head_person_id) references public.persons(id) on delete set null;

-- 5. Employment Records (Immutable History)
create table if not exists public.employment_records (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.persons(id) on delete cascade,
  department_id uuid not null references public.departments(id),
  designation_id uuid not null references public.designations(id),
  manager_person_id uuid references public.persons(id),
  employment_type_id uuid not null references public.employment_types(id),
  work_location text not null,
  joining_date date not null,
  effective_from date not null,
  effective_to date,
  status text not null,
  probation_start_date date,
  probation_end_date date,
  confirmation_status text check (confirmation_status in ('confirm', 'extend', 'end_employment', 'pending')),
  internship_start_date date,
  internship_end_date date,
  internship_status text check (internship_status in ('active', 'extended', 'completed', 'discontinued')),
  last_working_date date,
  reason_for_change text,
  created_by text,
  created_at timestamptz not null default now()
);

-- 6. Attendance Table
create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.persons(id) on delete cascade,
  attendance_date date not null,
  status text not null check (status in ('present', 'absent', 'leave', 'half_day', 'week_off', 'holiday', 'work_from_home')),
  check_in_at time,
  check_out_at time,
  notes text,
  source text not null default 'manual' check (source in ('manual', 'self_marked', 'manager', 'import', 'system_leave_sync')),
  corrected boolean not null default false,
  correction_reason text,
  created_by text,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_person_attendance_date unique(person_id, attendance_date)
);

-- 7. Leave Types
create table if not exists public.leave_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  description text not null,
  requires_approval boolean not null default true,
  allow_half_day boolean not null default true,
  is_paid boolean not null default true,
  balance_tracking_enabled boolean not null default true,
  default_days_per_year int not null default 12,
  is_active boolean not null default true,
  color_code text default '#CCFF00',
  created_at timestamptz not null default now()
);

-- 8. Leave Balances
create table if not exists public.leave_balances (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.persons(id) on delete cascade,
  leave_type_id uuid not null references public.leave_types(id) on delete cascade,
  year int not null,
  allocated numeric not null default 0,
  used numeric not null default 0,
  adjusted numeric not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  constraint uq_person_leave_balance_year unique(person_id, leave_type_id, year)
);

-- 9. Leave Requests
create table if not exists public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.persons(id) on delete cascade,
  leave_type_id uuid not null references public.leave_types(id),
  start_date date not null,
  end_date date not null,
  duration_days numeric not null,
  is_half_day boolean not null default false,
  reason text not null,
  status text not null default 'pending' check (status in ('draft', 'pending', 'approved', 'rejected', 'clarification_required', 'cancelled')),
  approver_person_id uuid references public.persons(id),
  manager_comment text,
  requested_at timestamptz not null default now(),
  decided_at timestamptz,
  decision_reason text,
  created_by text,
  updated_by text,
  constraint chk_leave_dates check (end_date >= start_date)
);

-- 10. Holidays
create table if not exists public.holidays (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  holiday_date date not null,
  year int not null,
  location_group_id uuid,
  is_optional boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint uq_holiday_date unique(holiday_date, name)
);

-- 11. Documents
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.persons(id) on delete cascade,
  category text not null check (category in ('Joining', 'Employment', 'Internship', 'Performance', 'Exit', 'Other')),
  document_type text not null,
  storage_bucket text not null default 'employee-documents',
  storage_path text not null,
  original_file_name text not null,
  mime_type text not null,
  file_size bigint not null default 0,
  issue_date date,
  expiry_date date,
  is_required boolean not null default false,
  visibility_level text not null default 'hr_only' check (visibility_level in ('hr_only', 'hr_manager', 'person', 'management_read_only_metadata')),
  uploaded_by text not null,
  uploaded_at timestamptz not null default now(),
  version int not null default 1,
  is_current boolean not null default true,
  notes text,
  created_at timestamptz not null default now()
);

-- 12. Document Requirements
create table if not exists public.document_requirements (
  id uuid primary key default gen_random_uuid(),
  worker_type text not null check (worker_type in ('employee', 'intern', 'consultant', 'contractor', 'other')),
  employment_type_id uuid references public.employment_types(id),
  document_type text not null,
  category text not null,
  required boolean not null default true,
  expiry_required boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 13. Onboarding Tasks & Templates
create table if not exists public.onboarding_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  worker_type text not null,
  is_active boolean not null default true,
  tasks jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.onboarding_tasks (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.persons(id) on delete cascade,
  title text not null,
  category text not null check (category in ('HR setup', 'Documents', 'Access', 'Orientation', 'Manager')),
  description text,
  owner_person_id uuid references public.persons(id),
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'blocked', 'skipped')),
  due_date date not null,
  completed_at timestamptz,
  completed_by text,
  notes text,
  created_at timestamptz not null default now()
);

-- 14. Lifecycle Events
create table if not exists public.lifecycle_events (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.persons(id) on delete cascade,
  event_type text not null,
  event_date date not null,
  effective_date date not null,
  title text not null,
  description text not null,
  metadata jsonb default '{}'::jsonb,
  actor_name text,
  created_at timestamptz not null default now()
);

-- 15. HR Actions
create table if not exists public.hr_actions (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.persons(id) on delete cascade,
  action_type text not null check (action_type in ('promotion', 'transfer', 'disciplinary', 'probation_decision', 'recognition', 'note', 'salary_review')),
  title text not null,
  description text not null,
  severity text not null default 'info' check (severity in ('info', 'low', 'medium', 'high', 'critical')),
  visibility_level text not null default 'hr_only',
  reference_type text,
  reference_id text,
  action_date date not null,
  created_by text not null,
  created_at timestamptz not null default now()
);

-- 16. Audit Logs
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_name text not null,
  entity_type text not null,
  entity_id text not null,
  action text not null,
  before_data jsonb,
  after_data jsonb,
  reason text,
  ip_hash_or_safe_metadata text,
  created_at timestamptz not null default now()
);

-- Indexes for high performance
create index if not exists idx_persons_name on public.persons(full_name);
create index if not exists idx_persons_status on public.persons(current_status);
create index if not exists idx_persons_code on public.persons(person_code);
create index if not exists idx_employment_manager on public.employment_records(manager_person_id);
create index if not exists idx_attendance_person_date on public.attendance(person_id, attendance_date);
create index if not exists idx_leave_person_dates on public.leave_requests(person_id, start_date, end_date);
create index if not exists idx_documents_person on public.documents(person_id);
create index if not exists idx_onboarding_person on public.onboarding_tasks(person_id);
create index if not exists idx_audit_created on public.audit_logs(created_at desc);
