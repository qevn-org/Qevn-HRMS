-- ==============================================================================
-- QEVN HRMS — Migration 002: Roles, Permissions & Row Level Security (RLS)
-- ==============================================================================

-- 1. Roles & Profiles
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text
);

insert into public.roles (name, description) values
  ('super_admin', 'Full platform and security controls access'),
  ('hr_admin', 'HR operations, people, attendance, leave, documents, onboarding'),
  ('manager', 'Team attendance, direct reports, leave approvals, evaluations'),
  ('employee', 'Self-service profile, attendance, leave requests, own documents'),
  ('management_readonly', 'High-level aggregated reports and company headcount')
on conflict (name) do nothing;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique,
  person_id uuid references public.persons(id) on delete set null,
  display_name text not null,
  role_id uuid references public.roles(id),
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Security Helper Functions for RLS
create or replace function public.get_current_role()
returns text
language sql
stable
as $$
  select r.name
  from public.profiles p
  join public.roles r on r.id = p.role_id
  where p.auth_user_id = auth.uid()
  limit 1;
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.profiles p
    join public.roles r on r.id = p.role_id
    where p.auth_user_id = auth.uid() and r.name = 'super_admin'
  );
$$;

create or replace function public.is_hr_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.profiles p
    join public.roles r on r.id = p.role_id
    where p.auth_user_id = auth.uid() and r.name in ('super_admin', 'hr_admin')
  );
$$;

create or replace function public.get_current_person_id()
returns uuid
language sql
stable
as $$
  select p.person_id
  from public.profiles p
  where p.auth_user_id = auth.uid()
  limit 1;
$$;

-- 3. Enable RLS on All Protected Tables
alter table public.persons enable row level security;
alter table public.employment_records enable row level security;
alter table public.attendance enable row level security;
alter table public.leave_requests enable row level security;
alter table public.leave_balances enable row level security;
alter table public.documents enable row level security;
alter table public.onboarding_tasks enable row level security;
alter table public.lifecycle_events enable row level security;
alter table public.hr_actions enable row level security;
alter table public.audit_logs enable row level security;

-- 4. Policies Examples
-- Persons: HR admins can view/edit all; Managers can view team; Employees can view directory & self
create policy "HR Admins full access to persons"
  on public.persons
  for all
  using (public.is_hr_admin());

create policy "Employees can read active persons"
  on public.persons
  for select
  using (is_active = true);

-- Attendance: HR admin full; Managers team; Employees self
create policy "HR Admins full access to attendance"
  on public.attendance
  for all
  using (public.is_hr_admin());

create policy "Employees read own attendance"
  on public.attendance
  for select
  using (person_id = public.get_current_person_id());

-- Documents: Strict visibility policy
create policy "HR Admins full access to documents"
  on public.documents
  for all
  using (public.is_hr_admin());

create policy "Employees read permitted own documents"
  on public.documents
  for select
  using (
    person_id = public.get_current_person_id()
    and visibility_level in ('person', 'hr_manager')
  );

-- Audit Logs: Only Super Admin and HR Admin can read
create policy "Only HR and Super Admins read audit logs"
  on public.audit_logs
  for select
  using (public.is_hr_admin());
