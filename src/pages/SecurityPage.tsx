// JANSAATHI AI - Security Architecture & Controls Page
// Technical overview of RLS, role isolation, immutable audits, and zero leaked secrets

import React from 'react';
import { ClinicalDisclaimer } from '../components/common/ClinicalDisclaimer';
import { ShieldCheck, Database, KeyRound, FileLock2 } from 'lucide-react';

export const SecurityPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <ClinicalDisclaimer />

        <div className="bg-white rounded border border-slate-300 p-8 shadow-xs mt-6 space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-teal-800" />
              <h1 className="text-2xl font-bold text-slate-900">Security Architecture & Controls</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Production Security Baseline &bull; Supabase PostgreSQL &bull; Row Level Security
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded border border-slate-200 space-y-1.5">
              <Database className="w-5 h-5 text-teal-700" />
              <h3 className="font-bold text-slate-900 text-sm">Row Level Security (RLS)</h3>
              <p className="text-slate-600 leading-relaxed">
                Every table in the PostgreSQL database enforces explicit RLS policies. Queries cannot bypass facility boundaries or access other units without explicit authorization.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded border border-slate-200 space-y-1.5">
              <KeyRound className="w-5 h-5 text-teal-700" />
              <h3 className="font-bold text-slate-900 text-sm">Role-Based Access Control (RBAC)</h3>
              <p className="text-slate-600 leading-relaxed">
                Roles are strictly database-backed (<code className="font-mono">patient</code>, <code className="font-mono">health_worker</code>, <code className="font-mono">clinician</code>, <code className="font-mono">facility_admin</code>, <code className="font-mono">system_admin</code>). Users cannot elevate their own permissions client-side.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded border border-slate-200 space-y-1.5">
              <FileLock2 className="w-5 h-5 text-teal-700" />
              <h3 className="font-bold text-slate-900 text-sm">Immutable Audit Logging</h3>
              <p className="text-slate-600 leading-relaxed">
                The <code className="font-mono">audit_logs</code> table is strictly append-only. No UPDATE or DELETE operations are permitted by any normal user, ensuring an untampered historical record for clinical review.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded border border-slate-200 space-y-1.5">
              <ShieldCheck className="w-5 h-5 text-teal-700" />
              <h3 className="font-bold text-slate-900 text-sm">Zero Client-Side Secret Leaks</h3>
              <p className="text-slate-600 leading-relaxed">
                Only the public Supabase Anon key is exposed to the browser. High-privilege service-role keys are strictly prohibited from frontend bundles.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
