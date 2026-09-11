import { AttendanceRecord, AttendanceStatusType } from '@/types/database';
import { AttendanceFilterOptions } from '@/types/domain';
import { hrmsStore } from './store';
import { format, parseISO, getDaysInMonth, startOfMonth, addDays } from 'date-fns';

export const attendanceService = {
  getAttendanceForDate(date: string, filters?: Partial<AttendanceFilterOptions>): AttendanceRecord[] {
    let records = hrmsStore.getAttendance(date);

    if (filters?.departmentId && filters.departmentId !== 'all') {
      const personsInDept = hrmsStore.getPersons().filter((p) => p.department_id === filters.departmentId).map((p) => p.id);
      records = records.filter((r) => personsInDept.includes(r.person_id));
    }

    if (filters?.status && filters.status !== 'all') {
      records = records.filter((r) => r.status === filters.status);
    }

    if (filters?.searchQuery?.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      records = records.filter(
        (r) =>
          r.person_name?.toLowerCase().includes(q) ||
          r.person_code?.toLowerCase().includes(q)
      );
    }

    return records;
  },

  getMonthlyMatrix(year: number, month: number) {
    const activePersons = hrmsStore.getPersons().filter((p) => p.is_active);
    const startDate = new Date(year, month - 1, 1);
    const totalDays = getDaysInMonth(startDate);
    const holidays = hrmsStore.getHolidays(year);

    const matrix = activePersons.map((person) => {
      const monthAttendance = hrmsStore.getAttendance(undefined, person.id).filter((att) => {
        const attDate = parseISO(att.attendance_date);
        return attDate.getFullYear() === year && attDate.getMonth() + 1 === month;
      });

      const dayMap: Record<number, AttendanceRecord | { status: AttendanceStatusType }> = {};

      for (let day = 1; day <= totalDays; day++) {
        const curDate = new Date(year, month - 1, day);
        const curDateStr = format(curDate, 'yyyy-MM-dd');
        const dayOfWeek = curDate.getDay();

        // 1. Check if matching attendance record exists
        const found = monthAttendance.find((a) => a.attendance_date === curDateStr);
        if (found) {
          dayMap[day] = found;
          continue;
        }

        // 2. Check if holiday
        const holiday = holidays.find((h) => h.holiday_date === curDateStr);
        if (holiday) {
          dayMap[day] = { status: 'holiday' };
          continue;
        }

        // 3. Check if weekend (week_off)
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          dayMap[day] = { status: 'week_off' };
          continue;
        }

        // 4. Default: unrecorded
        dayMap[day] = { status: 'absent' }; // Or unmarked
      }

      // Summary counts
      let presentCount = 0;
      let absentCount = 0;
      let leaveCount = 0;
      let halfDayCount = 0;
      let wfhCount = 0;
      let holidayCount = 0;
      let weekOffCount = 0;

      Object.values(dayMap).forEach((val) => {
        switch (val.status) {
          case 'present':
            presentCount++;
            break;
          case 'absent':
            absentCount++;
            break;
          case 'leave':
            leaveCount++;
            break;
          case 'half_day':
            halfDayCount++;
            presentCount += 0.5;
            break;
          case 'work_from_home':
            wfhCount++;
            presentCount++;
            break;
          case 'holiday':
            holidayCount++;
            break;
          case 'week_off':
            weekOffCount++;
            break;
        }
      });

      return {
        person,
        dayMap,
        summary: {
          presentCount,
          absentCount,
          leaveCount,
          halfDayCount,
          wfhCount,
          holidayCount,
          weekOffCount,
          totalWorkingDays: totalDays - holidayCount - weekOffCount,
        },
      };
    });

    return {
      daysInMonth: totalDays,
      year,
      month,
      matrix,
    };
  },

  markAttendance(record: Omit<AttendanceRecord, 'id' | 'created_at' | 'updated_at'>, actorName?: string): AttendanceRecord {
    return hrmsStore.markAttendance(record, actorName);
  },

  bulkMarkAttendance(date: string, records: { person_id: string; status: AttendanceStatusType; notes?: string }[], actorName?: string) {
    hrmsStore.bulkMarkAttendance(date, records, actorName);
  },

  correctAttendance(recordId: string, personId: string, date: string, newStatus: AttendanceStatusType, reason: string, notes?: string, actorName?: string): AttendanceRecord {
    return hrmsStore.markAttendance(
      {
        person_id: personId,
        attendance_date: date,
        status: newStatus,
        notes: notes || '',
        source: 'manual',
        corrected: true,
        correction_reason: reason,
      },
      actorName || 'HR Admin'
    );
  },

  getAttendanceExceptions(date: string) {
    const activePersons = hrmsStore.getPersons().filter((p) => p.is_active);
    const recorded = hrmsStore.getAttendance(date);
    const recordedMap = new Map(recorded.map((r) => [r.person_id, r]));

    const missingAttendance = activePersons.filter((p) => !recordedMap.has(p.id));
    const absences = recorded.filter((r) => r.status === 'absent');
    const corrections = recorded.filter((r) => r.corrected);

    return {
      missingAttendance,
      absences,
      corrections,
    };
  }
};
