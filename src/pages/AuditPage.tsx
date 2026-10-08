// JANSAATHI AI - Security & Clinical Audit Trail Page (/audit)
// System-wide tamper-evident ledger for governance, accountability, and clinical safety.

import React from 'react';
import { AuditLogViewer } from '../components/clinical/AuditLogViewer';
import { ClinicalDisclaimer } from '../components/common/ClinicalDisclaimer';
import { History, ShieldCheck } from 'lucide-react';

export const AuditPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ClinicalDisclaimer />

        <div className="my-6">
          <div className="flex items-center gap-2">
            <History className="w-6 h-6 text-teal-800" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Security & Clinical Governance Audit Trail
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Append-only PostgreSQL audit log &bull; Zero modification privileges &bull; Full event traceability
          </p>
        </div>

        <AuditLogViewer />
      </div>
    </div>
  );
};
