import { LeaveRequest, LeaveBalance, LeaveType, LeaveRequestStatusType } from '@/types/database';
import { LeaveFilterOptions } from '@/types/domain';
import { hrmsStore } from './store';
import { parseISO, differenceInCalendarDays } from 'date-fns';

export const leaveService = {
  getAllLeaveRequests(filters?: Partial<LeaveFilterOptions>): LeaveRequest[] {
    let requests = hrmsStore.getLeaveRequests();

    if (filters?.status && filters.status !== 'all') {
      requests = requests.filter((r) => r.status === filters.status);
    }

    if (filters?.leaveTypeId && filters.leaveTypeId !== 'all') {
      requests = requests.filter((r) => r.leave_type_id === filters.leaveTypeId);
    }

    if (filters?.personId && filters.personId !== 'all') {
      requests = requests.filter((r) => r.person_id === filters.personId);
    }

    if (filters?.departmentId && filters.departmentId !== 'all') {
      requests = requests.filter((r) => r.person?.department_id === filters.departmentId);
    }

    return requests;
  },

  getLeaveBalancesForPerson(personId: string): LeaveBalance[] {
    return hrmsStore.getLeaveBalances(personId);
  },

  getLeaveTypes(): LeaveType[] {
    return hrmsStore.getLeaveTypes();
  },

  calculateWorkingDays(startDateStr: string, endDateStr: string, isHalfDay: boolean = false): number {
    if (isHalfDay) return 0.5;

    try {
      const start = parseISO(startDateStr);
      const end = parseISO(endDateStr);
      if (end < start) return 0;

      const holidays = hrmsStore.getHolidays();
      const holidayDates = new Set(holidays.map((h) => h.holiday_date));

      let count = 0;
      const cur = new Date(start);
      while (cur <= end) {
        const dayOfWeek = cur.getDay();
        const dateStr = cur.toISOString().split('T')[0];
        // Skip Saturday (6) and Sunday (0) and company holidays
        if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayDates.has(dateStr)) {
          count++;
        }
        cur.setDate(cur.getDate() + 1);
      }
      return Math.max(count, 1);
    } catch {
      return 1;
    }
  },

  submitRequest(request: Omit<LeaveRequest, 'id' | 'status' | 'requested_at'>, actorName?: string): LeaveRequest {
    return hrmsStore.submitLeaveRequest(request, actorName);
  },

  approveRequest(id: string, comment?: string, actorName?: string): boolean {
    return hrmsStore.decideLeaveRequest(id, 'approved', comment, actorName);
  },

  rejectRequest(id: string, comment?: string, actorName?: string): boolean {
    return hrmsStore.decideLeaveRequest(id, 'rejected', comment, actorName);
  },

  requestClarification(id: string, comment: string, actorName?: string): boolean {
    return hrmsStore.decideLeaveRequest(id, 'clarification_required', comment, actorName);
  },

  getHolidayCalendar(year?: number) {
    return hrmsStore.getHolidays(year);
  },

  addHoliday(holiday: { name: string; holiday_date: string; is_optional: boolean }, actorName?: string) {
    const year = new Date(holiday.holiday_date).getFullYear();
    return hrmsStore.addHoliday({ ...holiday, year, is_active: true }, actorName);
  }
};
