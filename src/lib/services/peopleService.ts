import { Person, WorkerType, EmploymentStatusType } from '@/types/database';
import { PeopleFilterOptions } from '@/types/domain';
import { hrmsStore } from './store';

export const peopleService = {
  getAllPersons(): Person[] {
    return hrmsStore.getPersons();
  },

  getPersonById(id: string): Person | null {
    return hrmsStore.getPersonById(id);
  },

  getFilteredPersons(filters: PeopleFilterOptions): Person[] {
    let persons = hrmsStore.getPersons();

    if (filters.searchQuery?.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      persons = persons.filter(
        (p) =>
          p.full_name.toLowerCase().includes(q) ||
          p.person_code.toLowerCase().includes(q) ||
          p.work_email.toLowerCase().includes(q) ||
          p.phone.toLowerCase().includes(q) ||
          p.designation?.name.toLowerCase().includes(q) ||
          p.department?.name.toLowerCase().includes(q)
      );
    }

    if (filters.workerType && filters.workerType !== 'all') {
      persons = persons.filter((p) => p.worker_type === filters.workerType);
    }

    if (filters.departmentId && filters.departmentId !== 'all') {
      persons = persons.filter((p) => p.department_id === filters.departmentId);
    }

    if (filters.managerId && filters.managerId !== 'all') {
      persons = persons.filter((p) => p.manager_person_id === filters.managerId);
    }

    if (filters.employmentStatus && filters.employmentStatus !== 'all') {
      persons = persons.filter((p) => p.current_status === filters.employmentStatus);
    }

    if (filters.workLocation && filters.workLocation !== 'all') {
      persons = persons.filter((p) => p.work_location === filters.workLocation);
    }

    if (filters.remoteStatus && filters.remoteStatus !== 'all') {
      persons = persons.filter((p) => p.remote_status === filters.remoteStatus);
    }

    return persons;
  },

  createPerson(personData: Omit<Person, 'id' | 'created_at' | 'updated_at'>, actorName?: string): Person {
    return hrmsStore.addPerson(personData, actorName);
  },

  updatePerson(id: string, updates: Partial<Person>, actorName?: string): Person | null {
    return hrmsStore.updatePerson(id, updates, actorName);
  },

  archivePerson(id: string, reason: string, lastWorkingDate: string, actorName?: string): boolean {
    return hrmsStore.archivePerson(id, reason, lastWorkingDate, actorName);
  },

  bulkUpdateDepartment(personIds: string[], departmentId: string, actorName?: string) {
    personIds.forEach((id) => {
      hrmsStore.updatePerson(id, { department_id: departmentId }, actorName);
    });
  },

  bulkUpdateManager(personIds: string[], managerId: string, actorName?: string) {
    personIds.forEach((id) => {
      hrmsStore.updatePerson(id, { manager_person_id: managerId }, actorName);
    });
  },

  bulkUpdateStatus(personIds: string[], status: EmploymentStatusType, actorName?: string) {
    personIds.forEach((id) => {
      hrmsStore.updatePerson(id, { current_status: status }, actorName);
    });
  }
};
