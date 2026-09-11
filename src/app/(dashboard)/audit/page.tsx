'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { auditService } from '@/lib/services/auditService';
import { hrmsStore } from '@/lib/services/store';
import { exportService } from '@/lib/services/exportService';
import { AuditLog } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatDateTime } from '@/lib/utils';
import { useAuth } from '@/lib/context/AuthContext';
import { toast } from 'sonner';
import {
  History,
  Search,
  Filter,
  Download,
  Eye,
  ShieldCheck,
  FileCode,
  ArrowRight,
} from 'lucide-react';

export default function AuditTrailPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');

  // Diff Modal
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    loadLogs();
    const unsubscribe = hrmsStore.subscribe(() => {
      loadLogs();
    });
    return unsubscribe;
  }, []);

  const loadLogs = () => {
    hrmsStore.init();
    setLogs(auditService.getAllLogs());
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (entityFilter !== 'all' && log.entity_type !== entityFilter) return false;
      if (actionFilter !== 'all' && log.action !== actionFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          log.actor_name.toLowerCase().includes(q) ||
          log.entity_type.toLowerCase().includes(q) ||
          log.entity_id.toLowerCase().includes(q) ||
          (log.reason && log.reason.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [logs, entityFilter, actionFilter, searchQuery]);

  const handleExportAudit = () => {
    const payload = {
      title: 'Immutable Compliance Audit Trail Log',
      filename: 'QEVN_Audit_Trail',
      reportCategory: 'audit',
      headers: ['Timestamp', 'Actor', 'Action', 'Entity Type', 'Entity ID', 'Reason'],
      rows: filteredLogs.map((l) => [
        l.created_at,
        l.actor_name,
        l.action.toUpperCase(),
        l.entity_type.toUpperCase(),
        l.entity_id,
        l.reason || '—',
      ]),
    };
    exportService.exportToCSV(payload, user.display_name);
    toast.success('Exported audit logs as CSV');
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'create':
        return <Badge variant="lime">CREATE</Badge>;
      case 'approve':
        return <Badge variant="lime">APPROVE</Badge>;
      case 'update':
        return <Badge variant="cyan">UPDATE</Badge>;
      case 'correct':
        return <Badge variant="amber">CORRECT</Badge>;
      case 'archive':
        return <Badge variant="rose">ARCHIVE</Badge>;
      case 'reject':
        return <Badge variant="rose">REJECT</Badge>;
      case 'import':
        return <Badge variant="violet">IMPORT</Badge>;
      default:
        return <Badge variant="neutral">{action.toUpperCase()}</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-[#121218] border-2 border-[#262636] p-4 sm:p-5 shadow-neo flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#CCFF00]" />
            <span className="font-mono text-xs font-bold uppercase text-[#CCFF00] tracking-wider">
              SECURITY & GOVERNANCE
            </span>
          </div>
          <h1 className="font-mono text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
            COMPLIANCE AUDIT TRAIL ({filteredLogs.length})
          </h1>
          <p className="text-xs text-zinc-400 font-sans">
            Immutable before/after state diff recording for all mutations across the HRMS.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportAudit}>
            <Download className="w-4 h-4 mr-1" /> EXPORT AUDIT LOG
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#121218] border-2 border-[#262636] p-4 shadow-neo flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit trail by actor, reason, entity ID..."
            className="w-full bg-[#0A0A0E] border-2 border-[#262636] focus:border-[#CCFF00] text-white pl-9 pr-3.5 py-1.5 font-mono text-xs focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="bg-[#0A0A0E] border-2 border-[#262636] text-white px-2.5 py-1.5 font-mono text-xs cursor-pointer focus:border-[#CCFF00] focus:outline-hidden"
          >
            <option value="all">ALL ENTITIES</option>
            <option value="person">PERSON</option>
            <option value="attendance">ATTENDANCE</option>
            <option value="leave_request">LEAVE REQUEST</option>
            <option value="document">DOCUMENT</option>
            <option value="onboarding_task">ONBOARDING TASK</option>
            <option value="settings">SETTINGS</option>
          </select>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-[#0A0A0E] border-2 border-[#262636] text-white px-2.5 py-1.5 font-mono text-xs cursor-pointer focus:border-[#CCFF00] focus:outline-hidden"
          >
            <option value="all">ALL ACTIONS</option>
            <option value="create">CREATE</option>
            <option value="update">UPDATE</option>
            <option value="approve">APPROVE</option>
            <option value="reject">REJECT</option>
            <option value="correct">CORRECT</option>
            <option value="archive">ARCHIVE</option>
            <option value="import">IMPORT</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-[#121218] border-2 border-[#262636] shadow-neo overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#171722] border-b-2 border-[#262636] text-zinc-400 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">TIMESTAMP</th>
              <th className="py-3 px-4">ACTOR</th>
              <th className="py-3 px-4">ACTION</th>
              <th className="py-3 px-4">ENTITY</th>
              <th className="py-3 px-4">REASON / DESCRIPTION</th>
              <th className="py-3 px-4 text-right">INSPECT DIFF</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#22222E]">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-zinc-500">
                  No audit logs matching query.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#1A1A26] transition-colors">
                  <td className="py-3 px-4 text-zinc-400 whitespace-nowrap">
                    {formatDateTime(log.created_at)}
                  </td>
                  <td className="py-3 px-4 text-white font-bold whitespace-nowrap">
                    {log.actor_name}
                  </td>
                  <td className="py-3 px-4">{getActionBadge(log.action)}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-white uppercase">{log.entity_type}</span>
                    <span className="text-[10px] text-zinc-500 block truncate max-w-[140px]">
                      {log.entity_id}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-zinc-300 max-w-sm">
                    {log.reason || '—'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedLog(log)}
                      className="h-7 px-2 text-[#CCFF00] hover:bg-[#CCFF00]/10"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" /> View Diff
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* JSON DIFF VIEWER MODAL */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="AUDIT STATE DIFF VIEWER"
        subtitle={`Action: ${selectedLog?.action.toUpperCase()} on ${selectedLog?.entity_type.toUpperCase()} by ${selectedLog?.actor_name}`}
        maxWidth="3xl"
        footer={
          <Button variant="outline" size="sm" onClick={() => setSelectedLog(null)}>
            CLOSE DIFF
          </Button>
        }
      >
        <div className="space-y-4 font-mono text-xs">
          <div className="p-3 bg-[#0D0D12] border border-[#262636] space-y-1">
            <div className="text-zinc-400">
              AUDIT ID: <span className="text-white">{selectedLog?.id}</span>
            </div>
            <div className="text-zinc-400">
              RECORDED AT: <span className="text-white">{selectedLog?.created_at}</span>
            </div>
            <div className="text-zinc-400">
              REASON: <span className="text-[#CCFF00]">{selectedLog?.reason || 'Standard mutation'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Before State */}
            <div className="p-3 bg-[#0A0A0E] border border-zinc-800">
              <span className="text-[10px] font-bold text-rose-400 uppercase block mb-1.5 pb-1 border-b border-zinc-800">
                BEFORE STATE (PRIOR DATA)
              </span>
              <pre className="text-[11px] text-zinc-400 overflow-x-auto whitespace-pre-wrap max-h-64">
                {selectedLog?.before_data
                  ? JSON.stringify(selectedLog.before_data, null, 2)
                  : '// No prior state (Entity Created)'}
              </pre>
            </div>

            {/* After State */}
            <div className="p-3 bg-[#0A0A0E] border border-zinc-800">
              <span className="text-[10px] font-bold text-emerald-400 uppercase block mb-1.5 pb-1 border-b border-zinc-800">
                AFTER STATE (NEW COMMITTED DATA)
              </span>
              <pre className="text-[11px] text-emerald-300 overflow-x-auto whitespace-pre-wrap max-h-64">
                {selectedLog?.after_data
                  ? JSON.stringify(selectedLog.after_data, null, 2)
                  : '// Entity Deleted / Archived'}
              </pre>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
