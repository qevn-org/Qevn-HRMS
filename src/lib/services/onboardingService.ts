import { OnboardingTask, Person, EmploymentRecord } from '@/types/database';
import { hrmsStore } from './store';
import { parseISO, differenceInDays } from 'date-fns';

export interface ProbationRadarItem {
  person: Person;
  employmentRecord?: EmploymentRecord;
  probationEndDate: string;
  daysRemaining: number;
  isOverdue: boolean;
  status: string;
  managerName: string;
}

export interface InternshipRadarItem {
  person: Person;
  employmentRecord?: EmploymentRecord;
  internshipStartDate: string;
  internshipEndDate: string;
  daysRemaining: number;
  isOverdue: boolean;
  status: string;
  managerName: string;
}

export const onboardingService = {
  getNewJoiners(daysThreshold: number = 60): Person[] {
    const today = new Date();
    const persons = hrmsStore.getPersons().filter((p) => p.is_active);

    return persons.filter((p) => {
      const joining = parseISO(p.joining_date);
      const diff = differenceInDays(today, joining);
      return diff >= 0 && diff <= daysThreshold;
    });
  },

  getTasksForPerson(personId: string): OnboardingTask[] {
    return hrmsStore.getOnboardingTasks(personId);
  },

  getAllTasks(): OnboardingTask[] {
    return hrmsStore.getOnboardingTasks();
  },

  updateTaskStatus(taskId: string, status: OnboardingTask['status'], actorName?: string): boolean {
    return hrmsStore.updateOnboardingTask(taskId, status, actorName);
  },

  getProbationRadar(withinDays: number = 45): ProbationRadarItem[] {
    const today = new Date();
    const activePersons = hrmsStore.getPersons().filter((p) => p.is_active && (p.current_status === 'probation' || p.worker_type === 'employee'));
    const records = hrmsStore.getEmploymentRecords();

    const items: ProbationRadarItem[] = [];

    activePersons.forEach((person) => {
      const empRecord = records.find((r) => r.person_id === person.id && r.probation_end_date);
      if (empRecord?.probation_end_date) {
        const end = parseISO(empRecord.probation_end_date);
        const days = differenceInDays(end, today);
        if (days <= withinDays) {
          items.push({
            person,
            employmentRecord: empRecord,
            probationEndDate: empRecord.probation_end_date,
            daysRemaining: days,
            isOverdue: days < 0,
            status: empRecord.confirmation_status || 'pending',
            managerName: person.manager?.full_name || 'HR Team',
          });
        }
      }
    });

    return items.sort((a, b) => a.daysRemaining - b.daysRemaining);
  },

  recordProbationDecision(
    personId: string,
    recommendation: 'confirm' | 'extend' | 'end_employment',
    notes: string,
    newEndDate?: string,
    actorName?: string
  ): boolean {
    return hrmsStore.recordProbationDecision(personId, recommendation, notes, newEndDate, actorName);
  },

  getInternshipRadar(withinDays: number = 45): InternshipRadarItem[] {
    const today = new Date();
    const interns = hrmsStore.getPersons().filter((p) => p.is_active && p.worker_type === 'intern');
    const records = hrmsStore.getEmploymentRecords();

    const items: InternshipRadarItem[] = [];

    interns.forEach((person) => {
      const empRecord = records.find((r) => r.person_id === person.id && r.internship_end_date);
      if (empRecord?.internship_end_date) {
        const end = parseISO(empRecord.internship_end_date);
        const days = differenceInDays(end, today);
        if (days <= withinDays) {
          items.push({
            person,
            employmentRecord: empRecord,
            internshipStartDate: empRecord.internship_start_date || person.joining_date,
            internshipEndDate: empRecord.internship_end_date,
            daysRemaining: days,
            isOverdue: days < 0,
            status: empRecord.internship_status || 'active',
            managerName: person.manager?.full_name || 'Mentor Team',
          });
        }
      }
    });

    return items.sort((a, b) => a.daysRemaining - b.daysRemaining);
  },

  recordInternshipCompletion(
    personId: string,
    status: 'completed' | 'extended' | 'discontinued',
    notes: string,
    actorName?: string
  ): boolean {
    return hrmsStore.recordInternshipCompletion(personId, status, notes, actorName);
  }
};
