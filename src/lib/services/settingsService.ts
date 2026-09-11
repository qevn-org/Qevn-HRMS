import { AuditLog, Department, Designation, LeaveType, Holiday, DocumentRequirement, OnboardingTemplate } from '@/types/database';
import { hrmsStore } from './store';

export const auditService = {
  getAllLogs(entityType?: string, action?: string): AuditLog[] {
    let logs = hrmsStore.getAuditLogs();
    if (entityType && entityType !== 'all') {
      logs = logs.filter((l) => l.entity_type === entityType);
    }
    if (action && action !== 'all') {
      logs = logs.filter((l) => l.action === action);
    }
    return logs;
  },

  logAction(log: Omit<AuditLog, 'id' | 'created_at'>) {
    hrmsStore.addAuditLog(log);
  }
};

export const settingsService = {
  getDepartments(): Department[] {
    return hrmsStore.getDepartments();
  },

  getDesignations(): Designation[] {
    return hrmsStore.getDesignations();
  },

  getLeaveTypes(): LeaveType[] {
    return hrmsStore.getLeaveTypes();
  },

  getHolidays(year?: number): Holiday[] {
    return hrmsStore.getHolidays(year);
  },

  getDocumentRequirements(): DocumentRequirement[] {
    return hrmsStore.getDocumentRequirements();
  },

  getOnboardingTemplates(): OnboardingTemplate[] {
    return hrmsStore.getOnboardingTemplates();
  },

  addDepartment(dept: Omit<Department, 'id' | 'created_at' | 'updated_at'>, actorName?: string) {
    return hrmsStore.addDepartment(dept, actorName);
  },

  addDesignation(desig: Omit<Designation, 'id' | 'created_at' | 'updated_at'>, actorName?: string) {
    return hrmsStore.addDesignation(desig, actorName);
  },

  addHoliday(hol: Omit<Holiday, 'id'>, actorName?: string) {
    return hrmsStore.addHoliday(hol, actorName);
  },

  addLeaveType(lt: Omit<LeaveType, 'id'>, actorName?: string) {
    return hrmsStore.addLeaveType(lt, actorName);
  },

  resetAllData() {
    hrmsStore.resetToSeedData();
  }
};
