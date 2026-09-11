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
  Search,
  Download,
  Eye,
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
        return <Badge variant="green">CREATE</Badge>;
      case 'approve':
        return <Badge variant="green">APPROVE</Badge>;
      case 'update':
        return <Badge variant="cyan">UPDATE</Badge>;
      case 'correct':
        return <Badge variant="amber">CORRECT</Badge>;
      case 'archive':
        return <Badge variant="rose">ARCHIVE</Badge>;
      case 'reject':
        return <Badge variant="rose">REJECT</Badge>;
      case 'import':
        return <Badge variant="purple">IMPORT</Badge>;
      default:
        return <Badge variant="neutral">{action.toUpperCase()}</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white border-3 border-black p-5 sm:p-6 shadow-neo flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="sticker-tag bg-[#8B5CF6] text-white">
              IMMUTABLE RECORD
            </span>
            <span className="sticker-tag bg-[#00D06C] text-black">
              FULL STATE DIFFS
            </span>
          </div>
          <h1 className="font-mono text-2xl sm:text-3xl font-black text-black tracking-tight mt-1 uppercase">
            COMPLIANCE AUDIT TRAIL ({filteredLogs.length})
          </h1>
          <p className="text-xs sm:text-sm text-zinc-700 font-sans font-medium">
            Immutable before/after state diff recording for all mutations across the HRMS platform.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="white" size="sm" onClick={handleExportAudit}>
            <Download className="w-4 h-4 mr-1" /> EXPORT AUDIT LOG
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border-3 border-black p-4 shadow-neo flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-black absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit trail by actor, reason, entity ID..."
            className="w-full bg-[#FCFAF5] border-2 border-black text-black pl-9 pr-3.5 py-1.5 font-mono text-xs focus:outline-hidden shadow-[2px_2px_0px_#000]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="bg-white border-2 border-black text-black px-2.5 py-1.5 font-mono text-xs font-bold cursor-pointer focus:outline-hidden shadow-[2px_2px_0px_#000]"
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
            className="bg-white border-2 border-black text-black px-2.5 py-1.5 font-mono text-xs font-bold cursor-pointer focus:outline-hidden shadow-[2px_2px_0px_#000]"
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

      {/* Audit Log Table with Retro Window Chrome */}
      <div className="bg-white border-3 border-black shadow-neo overflow-hidden">
        <div className="bg-[#8B5CF6] border-b-3 border-black px-4 py-2.5 flex items-center justify-between font-mono text-xs font-black uppercase text-white">
          <span>TAMPER-EVIDENT AUDIT RECORD MATRIX</span>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-white border border-black inline-block text-[7px] leading-none text-center font-bold text-black">_</span>
            <span className="w-2.5 h-2.5 bg-white border border-black inline-block text-[7px] leading-none text-center font-bold text-black">□</span>
            <span className="w-2.5 h-2.5 bg-white border border-black inline-block text-[7px] leading-none text-center font-bold text-black">✕</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#FAF7EE] border-b-2 border-black text-black uppercase font-black">
              <tr>
                <th className="py-3 px-4">TIMESTAMP</th>
                <th className="py-3 px-4">ACTOR</th>
                <th className="py-3 px-4">ACTION</th>
                <th className="py-3 px-4">ENTITY</th>
                <th className="py-3 px-4">REASON / DESCRIPTION</th>
                <th className="py-3 px-4 text-right">INSPECT DIFF</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black/10">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-600 font-bold">
                    No audit logs matching query.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FFFDF5] transition-colors">
                    <td className="py-3.5 px-4 text-zinc-700 font-bold whitespace-nowrap">
                      {formatDateTime(log.created_at)}
                    </td>
                    <td className="py-3.5 px-4 text-black font-black whitespace-nowrap">
                      {log.actor_name}
                    </td>
                    <td className="py-3.5 px-4">{getActionBadge(log.action)}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-black text-black uppercase">{log.entity_type}</span>
                      <span className="text-[10px] text-zinc-600 block truncate max-w-[140px] font-bold">
                        {log.entity_id}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-black max-w-sm font-medium">
                      {log.reason || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="green"
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                        className="h-7 px-2 text-xs"
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
      </div>

      {/* JSON DIFF VIEWER MODAL */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="AUDIT STATE DIFF VIEWER"
        subtitle={`Action: ${selectedLog?.action.toUpperCase()} on ${selectedLog?.entity_type.toUpperCase()} by ${selectedLog?.actor_name}`}
        headerColor="purple"
        maxWidth="3xl"
        footer={
          <Button variant="white" size="sm" onClick={() => setSelectedLog(null)}>
            CLOSE DIFF
          </Button>
        }
      >
        <div className="space-y-4 font-mono text-xs">
          <div className="p-3 bg-[#FAF7EE] border-2 border-black space-y-1">
            <div className="text-zinc-700 font-bold">
              AUDIT ID: <span className="text-black font-black">{selectedLog?.id}</span>
            </div>
            <div className="text-zinc-700 font-bold">
              RECORDED AT: <span className="text-black font-black">{selectedLog?.created_at}</span>
            </div>
            <div className="text-zinc-700 font-bold">
              REASON: <span className="text-black font-black bg-[#FFDE59] px-1 border border-black">{selectedLog?.reason || 'Standard mutation'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Before State */}
            <div className="p-3 bg-white border-2 border-black shadow-neo-sm">
              <span className="text-[10px] font-black text-[#FF4365] uppercase block mb-1.5 pb-1 border-b border-black/10">
                BEFORE STATE (PRIOR DATA)
              </span>
              <pre className="text-[11px] text-black overflow-x-auto whitespace-pre-wrap max-h-64 font-bold bg-[#FAF7EE] p-2 border border-black">
                {selectedLog?.before_data
                  ? JSON.stringify(selectedLog.before_data, null, 2)
                  : '// No prior state (Entity Created)'}
              </pre>
            </div>

            {/* After State */}
            <div className="p-3 bg-white border-2 border-black shadow-neo-sm">
              <span className="text-[10px] font-black text-[#00D06C] uppercase block mb-1.5 pb-1 border-b border-black/10">
                AFTER STATE (NEW COMMITTED DATA)
              </span>
              <pre className="text-[11px] text-black overflow-x-auto whitespace-pre-wrap max-h-64 font-bold bg-[#FAF7EE] p-2 border border-black">
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
