import { DashboardMetrics } from '@/types/domain';
import { hrmsStore } from './store';
import { parseISO, differenceInDays } from 'date-fns';

export const reportService = {
  getDashboardMetrics(): DashboardMetrics {
    const persons = hrmsStore.getPersons();
    const activePersons = persons.filter((p) => p.is_active);
    const todayStr = '2026-09-11';
    const attendanceToday = hrmsStore.getAttendance(todayStr);

    let presentToday = 0;
    let absentToday = 0;
    let onLeaveToday = 0;
    let wfhToday = 0;
    let halfDayToday = 0;

    const markedPersonIds = new Set<string>();

    attendanceToday.forEach((att) => {
      markedPersonIds.add(att.person_id);
      switch (att.status) {
        case 'present':
          presentToday++;
          break;
        case 'absent':
          absentToday++;
          break;
        case 'leave':
          onLeaveToday++;
          break;
        case 'work_from_home':
          wfhToday++;
          presentToday++;
          break;
        case 'half_day':
          halfDayToday++;
          presentToday += 0.5;
          break;
      }
    });

    const unmarkedToday = activePersons.filter((p) => !markedPersonIds.has(p.id)).length;

    // Joiners this month
    const today = new Date(todayStr);
    const newJoinersThisMonth = activePersons.filter((p) => {
      const joining = parseISO(p.joining_date);
      return joining.getFullYear() === today.getFullYear() && joining.getMonth() === today.getMonth();
    }).length;

    // Probation ending <= 30 days
    const empRecords = hrmsStore.getEmploymentRecords();
    const upcomingProbationCount = activePersons.filter((p) => {
      const rec = empRecords.find((r) => r.person_id === p.id && r.probation_end_date);
      if (!rec?.probation_end_date) return false;
      const days = differenceInDays(parseISO(rec.probation_end_date), today);
      return days >= 0 && days <= 30;
    }).length;

    // Internships ending <= 30 days
    const upcomingInternshipCompletions = activePersons.filter((p) => {
      if (p.worker_type !== 'intern') return false;
      const rec = empRecords.find((r) => r.person_id === p.id && r.internship_end_date);
      if (!rec?.internship_end_date) return false;
      const days = differenceInDays(parseISO(rec.internship_end_date), today);
      return days >= 0 && days <= 30;
    }).length;

    // Pending leave approvals
    const pendingLeaveApprovals = hrmsStore.getLeaveRequests().filter((r) => r.status === 'pending').length;

    // Documents
    const allDocs = hrmsStore.getDocuments();
    const expiringDocumentsCount = allDocs.filter((d) => {
      if (!d.expiry_date) return false;
      const days = differenceInDays(parseISO(d.expiry_date), today);
      return days >= 0 && days <= 45;
    }).length;

    // Missing required documents count
    const allReqs = hrmsStore.getDocumentRequirements();
    let missingDocsCount = 0;
    activePersons.forEach((p) => {
      const pReqs = allReqs.filter((r) => r.worker_type === p.worker_type && r.required);
      const pDocs = allDocs.filter((d) => d.person_id === p.id && d.is_current);
      pReqs.forEach((req) => {
        const found = pDocs.find((d) => d.document_type === req.document_type || d.category === req.category);
        if (!found) missingDocsCount++;
      });
    });

    const upcomingExitsCount = persons.filter((p) => !p.is_active || p.current_status === 'resigned').length;

    return {
      totalActivePeople: activePersons.length,
      activeEmployees: activePersons.filter((p) => p.worker_type === 'employee').length,
      activeInterns: activePersons.filter((p) => p.worker_type === 'intern').length,
      activeContractors: activePersons.filter((p) => p.worker_type === 'contractor' || p.worker_type === 'consultant').length,
      presentToday,
      absentToday,
      onLeaveToday,
      wfhToday,
      halfDayToday,
      unmarkedToday,
      newJoinersThisMonth,
      upcomingProbationCount,
      upcomingInternshipCompletions,
      pendingLeaveApprovals,
      missingDocumentsCount: missingDocsCount,
      expiringDocumentsCount,
      upcomingExitsCount,
    };
  },

  getDepartmentHeadcount() {
    const depts = hrmsStore.getDepartments();
    const activePersons = hrmsStore.getPersons().filter((p) => p.is_active);

    return depts.map((d) => {
      const deptPersons = activePersons.filter((p) => p.department_id === d.id);
      return {
        id: d.id,
        name: d.name,
        code: d.code,
        total: deptPersons.length,
        employees: deptPersons.filter((p) => p.worker_type === 'employee').length,
        interns: deptPersons.filter((p) => p.worker_type === 'intern').length,
        contractors: deptPersons.filter((p) => p.worker_type === 'contractor' || p.worker_type === 'consultant').length,
      };
    });
  },

  getWorkerTypeDistribution() {
    const activePersons = hrmsStore.getPersons().filter((p) => p.is_active);
    const countMap: Record<string, number> = {};

    activePersons.forEach((p) => {
      countMap[p.worker_type] = (countMap[p.worker_type] || 0) + 1;
    });

    return Object.entries(countMap).map(([type, count]) => ({
      name: type.toUpperCase(),
      count,
    }));
  }
};
