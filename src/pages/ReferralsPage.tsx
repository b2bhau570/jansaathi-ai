// JANSAATHI AI - Clinical Referrals & Transfer Notes Page (/referrals)
// Repository of structured referrals authorized by attending medical officers.

import React, { useEffect, useState } from 'react';
import { CaseService } from '../services/supabase/CaseService';
import { ReferralNote, TriageCase } from '../types';
import { ClinicalDisclaimer } from '../components/common/ClinicalDisclaimer';
import { FileText, Building2, Printer, CheckCircle2 } from 'lucide-react';

export const ReferralsPage: React.FC = () => {
  const [cases, setCases] = useState<TriageCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    CaseService.getAllCases().then((all) => {
      setCases(all);
      setLoading(false);
    });
  }, []);

  const referrals: ReferralNote[] = [];
  cases.forEach((c) => {
    if (c.referral) {
      referrals.push(c.referral);
    }
  });

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ClinicalDisclaimer />

        <div className="my-6">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-800" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Authorized Clinical Referral Orders
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Doctor-authorized inter-facility transfers &bull; Standardized triage clinical handoff documentation
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-white rounded border border-slate-300">
            Querying clinical referrals...
          </div>
        ) : referrals.length === 0 ? (
          <div className="bg-white rounded border border-slate-300 p-12 text-center shadow-xs">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-800">
              No hospital referral notes have been authorized yet.
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              When an attending clinician determines that specialist care is required and authorizes a transfer in the case review workspace, the note is indexed here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {referrals.map((ref) => (
              <div
                key={ref.id}
                className="bg-white rounded border border-slate-300 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {ref.case_number}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200 text-xs font-semibold">
                      Authorized Referral
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-800">
                    Destination: {ref.receiving_facility_name}
                  </div>
                  <div className="text-xs text-slate-600">
                    <strong>Reason:</strong> {ref.reason_for_referral}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Authorized By: {ref.clinician_name} ({ref.clinician_registration}) &bull;{' '}
                    {ref.authorised_at ? new Date(ref.authorised_at).toLocaleString() : ''}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded text-xs font-semibold shrink-0"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Referral Sheet
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
