// JANSAATHI AI - High-Fidelity Claymorphism Clinical Triage Queue Page
// Workstation queue for attending physicians and community health officers. Zero fake data.

import React, { useEffect, useState } from 'react';
import { CaseService } from '../services/supabase/CaseService';
import { TriageCase } from '../types';
import { TriageQueueTable } from '../components/clinical/TriageQueueTable';
import { ClinicalDisclaimer } from '../components/common/ClinicalDisclaimer';
import { Stethoscope, RefreshCw } from 'lucide-react';

export const CasesQueuePage: React.FC = () => {
  const [cases, setCases] = useState<TriageCase[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCases = async () => {
    setLoading(true);
    const data = await CaseService.getAllCases();
    setCases(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCases();
  }, []);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <ClinicalDisclaimer />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white flex items-center justify-center shrink-0 shadow-clayOrb">
              <Stethoscope className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#332F3A] tracking-tight font-heading">
                Clinical Triage Review Queue
              </h1>
              <p className="text-xs font-semibold text-[#635F69] mt-0.5">
                Deterministic priority signals &bull; Human-in-the-loop clinical review &bull; Anonymous Case Identifiers
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchCases}
            disabled={loading}
            className="clay-btn-secondary text-xs px-5 py-2.5 h-12 rounded-[20px] self-start sm:self-auto"
          >
            <RefreshCw className={`w-4 h-4 text-[#7C3AED] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Queue</span>
          </button>
        </div>

        {loading ? (
          <div className="clay-card rounded-[32px] p-14 text-center text-xs font-bold text-[#635F69] animate-clay-breathe">
            Querying live cases from Supabase medical queue...
          </div>
        ) : (
          <TriageQueueTable cases={cases} />
        )}
      </div>
    </div>
  );
};
