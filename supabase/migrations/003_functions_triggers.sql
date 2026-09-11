-- ==============================================================================
-- QEVN HRMS — Migration 003: Functions, Views & Automatic Triggers
-- ==============================================================================

-- 1. Automatic Leave Approval -> Attendance Synchronization Trigger
create or replace function public.sync_approved_leave_to_attendance()
returns trigger
language plpgsql
security definer
as $$
declare
  cur_date date;
  day_num int;
begin
  if (NEW.status = 'approved' and (OLD.status is null or OLD.status != 'approved')) then
    cur_date := NEW.start_date;
    while cur_date <= NEW.end_date loop
      day_num := extract(isodow from cur_date);
      -- Skip weekends (6=Sat, 7=Sun)
      if day_num < 6 then
        insert into public.attendance (
          person_id,
          attendance_date,
          status,
          notes,
          source,
          corrected,
          created_by
        ) values (
          NEW.person_id,
          cur_date,
          case when NEW.is_half_day then 'half_day' else 'leave' end,
          'Approved Leave: ' || NEW.reason,
          'system_leave_sync',
          false,
          'System'
        )
        on conflict (person_id, attendance_date) do update set
          status = excluded.status,
          notes = excluded.notes,
          source = 'system_leave_sync',
          updated_at = now();
      end if;
      cur_date := cur_date + interval '1 day';
    end loop;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_sync_approved_leave on public.leave_requests;
create trigger trg_sync_approved_leave
  after update on public.leave_requests
  for each row
  execute function public.sync_approved_leave_to_attendance();

-- 2. Reporting Views
create or replace view public.v_active_headcount as
select
  d.name as department_name,
  d.code as department_code,
  count(p.id) as total_headcount,
  count(case when p.worker_type = 'employee' then 1 end) as employee_count,
  count(case when p.worker_type = 'intern' then 1 end) as intern_count,
  count(case when p.worker_type in ('consultant', 'contractor') then 1 end) as external_count
from public.departments d
left join public.persons p on p.department_id = d.id and p.is_active = true
group by d.id, d.name, d.code;
