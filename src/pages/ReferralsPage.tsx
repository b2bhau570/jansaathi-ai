// JANSAATHI AI - High-Fidelity Claymorphism Clinical Referrals & Transfer Notes Page (/referrals)
// Repository of structured referrals authorized by attending medical officers.

import React, { useEffect, useState } from 'react';
import { CaseService } from '../services/supabase/CaseService';
import { ReferralNote, TriageCase } from '../types';
import { ClinicalDisclaimer } from '../components/common/ClinicalDisclaimer';
import { FileText, Building2, Printer } from 'lucide-react';

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
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <ClinicalDisclaimer />

        <div className="flex items-center gap-3.5 my-4">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white shadow-clayOrb shrink-0">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#332F3A] tracking-tight font-heading">
              Authorized Clinical Referral Orders
            </h1>
            <p className="text-xs font-semibold text-[#635F69] mt-0.5">
              Doctor-authorized inter-facility transfers &bull; Standardized triage clinical handoff documentation
            </p>
          </div>
        </div>

        {loading ? (
          <div className="clay-card rounded-[32px] p-12 text-center text-xs font-bold text-[#635F69] animate-clay-breathe">
            Querying clinical referrals...
          </div>
        ) : referrals.length === 0 ? (
          <div className="clay-card rounded-[36px] p-14 text-center">
            <Building2 className="w-14 h-14 text-purple-300 mx-auto mb-3" />
            <h4 className="text-base font-black text-[#332F3A] font-heading">
              No hospital referral notes have been authorized yet.
            </h4>
            <p className="text-xs text-[#635F69] font-medium mt-1 max-w-sm mx-auto">
              When an attending clinician determines that specialist care is required and authorizes a transfer in the case review workspace, the note is indexed here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {referrals.map((ref) => (
              <div
                key={ref.id}
                className="clay-card-static rounded-[28px] p-6 bg-white/85 shadow-clayCard flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-black text-[#7C3AED] text-base">
                      {ref.case_number}
                    </span>
                    <span className="clay-pill bg-purple-500/15 text-[#7C3AED] text-xs font-bold">
                      Authorized Referral
                    </span>
                  </div>
                  <div className="text-sm font-bold text-[#332F3A] font-heading">
                    Destination: {ref.receiving_facility_name}
                  </div>
                  <div className="text-xs text-[#635F69] font-medium">
                    <strong className="text-[#332F3A]">Reason:</strong> {ref.reason_for_referral}
                  </div>
                  <div className="text-[11px] text-[#635F69] font-medium">
                    Authorized By: {ref.clinician_name} ({ref.clinician_registration}) &bull;{' '}
                    {ref.authorised_at ? new Date(ref.authorised_at).toLocaleString() : ''}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="clay-btn-secondary text-xs px-5 py-2.5 h-11 rounded-[18px] shrink-0"
                >
                  <Printer className="w-4 h-4 text-[#7C3AED]" />
                  <span>Print Referral Sheet</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
