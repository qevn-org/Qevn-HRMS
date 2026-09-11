import { AuditLog } from '@/types/database';
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
