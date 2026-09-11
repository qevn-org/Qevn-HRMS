-- ==============================================================================
-- QEVN HRMS — Migration 006: Future Phases Scalable Schema (Phases 2–4)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Phase 2: Recruitment & Applicant Tracking System (ATS)
-- ------------------------------------------------------------------------------
create table if not exists public.job_openings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  department_id uuid references public.departments(id),
  hiring_manager_person_id uuid references public.persons(id),
  employment_type_id uuid references public.employment_types(id),
  open_positions int not null default 1,
  status text not null default 'open' check (status in ('draft', 'open', 'paused', 'closed')),
  job_description text,
  requirements text,
  target_start_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.candidates (
  id uuid primary key default gen_random_uuid(),
  candidate_code text not null unique,
  full_name text not null,
  email text not null,
  phone text,
  job_opening_id uuid references public.job_openings(id),
  current_stage text not null default 'sourced' check (current_stage in ('sourced', 'screening', 'technical_interview', 'culture_fit', 'offer_extended', 'hired', 'rejected')),
  resume_storage_path text,
  skills text[],
  years_of_experience numeric,
  source text default 'LinkedIn',
  notes text,
  converted_person_id uuid references public.persons(id),
  created_at timestamptz not null default now()
);

create table if not exists public.interviews (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  stage text not null,
  interviewer_person_id uuid references public.persons(id),
  scheduled_at timestamptz not null,
  duration_minutes int default 45,
  status text default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  feedback_score int check (feedback_score between 1 and 5),
  interviewer_notes text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------------------------
-- Phase 2: Asset Management
-- ------------------------------------------------------------------------------
create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  asset_code text not null unique,
  name text not null,
  category text not null check (category in ('Laptop', 'Monitor', 'Accessory', 'Mobile', 'Security Token', 'Other')),
  manufacturer text,
  model_name text,
  serial_number text unique,
  purchase_date date,
  condition text not null default 'new' check (condition in ('new', 'good', 'fair', 'damaged', 'decommissioned')),
  status text not null default 'available' check (status in ('available', 'assigned', 'in_repair', 'retired')),
  current_person_id uuid references public.persons(id),
  created_at timestamptz not null default now()
);

create table if not exists public.asset_assignments (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets(id) on delete cascade,
  person_id uuid not null references public.persons(id) on delete cascade,
  assigned_date date not null,
  returned_date date,
  return_condition text,
  notes text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------------------------
-- Phase 2: Performance & KPI Management
-- ------------------------------------------------------------------------------
create table if not exists public.kpi_templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  department_id uuid references public.departments(id),
  is_active boolean default true,
  items jsonb default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.review_cycles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  period text not null,
  start_date date not null,
  due_date date not null,
  status text not null default 'active' check (status in ('upcoming', 'active', 'closed')),
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------------------------
-- Phase 3: Payroll / Finance Handoff Staging
-- ------------------------------------------------------------------------------
create table if not exists public.salary_profiles (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.persons(id) on delete cascade,
  effective_from date not null,
  effective_to date,
  currency text default 'USD',
  base_annual_amount numeric not null,
  payroll_cycle text default 'monthly',
  is_active boolean default true,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------------------------
-- Phase 4: AI & Workforce Intelligence
-- ------------------------------------------------------------------------------
create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid,
  actor_person_id uuid references public.persons(id),
  session_title text,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  citations jsonb default '[]'::jsonb,
  created_at timestamptz not null default now()
);
