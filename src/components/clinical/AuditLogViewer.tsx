// JANSAATHI AI - Immutable Audit Log Viewer
// Chronological timeline of clinical, security, and data provenance events

import React, { useEffect, useState } from 'react';
import { AuditLogItem } from '../../types';
import { AuditService } from '../../services/supabase/AuditService';
import { ShieldCheck, History, Clock } from 'lucide-react';

interface AuditLogViewerProps {
  caseId?: string;
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ caseId }) => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AuditService.fetchAuditLogs(caseId).then((items) => {
      setLogs(items);
      setLoading(false);
    });
  }, [caseId]);

  return (
    <div className="bg-white rounded border border-slate-300 p-5 shadow-xs mb-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-teal-800" />
          <h3 className="text-base font-bold text-slate-900">
            {caseId ? 'Case Audit Trail & Provenance History' : 'System Security & Clinical Audit Log'}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Immutable Append-Only Record</span>
        </div>
      </div>

      {loading ? (
        <div className="py-6 text-center text-xs text-slate-500">Loading audit records...</div>
      ) : logs.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-500 italic">
          No audit entries recorded for this scope yet.
        </div>
      ) : (
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Timestamp (UTC)</th>
                <th className="px-3 py-2 text-left font-semibold">Event Type</th>
                <th className="px-3 py-2 text-left font-semibold">Actor Role</th>
                <th className="px-3 py-2 text-left font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60">
                  <td className="px-3 py-2 text-slate-500 font-mono whitespace-nowrap flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 font-semibold text-slate-900">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[10px]">
                      {log.event_type}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    <span className="capitalize">{log.actor_role}</span>
                  </td>
                  <td className="px-3 py-2 text-slate-600 font-mono text-[11px]">
                    {JSON.stringify(log.action_details)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
