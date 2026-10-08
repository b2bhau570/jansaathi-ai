// JANSAATHI AI - Clinical Triage Queue Page
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
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ClinicalDisclaimer />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 my-6">
          <div>
            <div className="flex items-center gap-2">
              <Stethoscope className="w-6 h-6 text-teal-800" />
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Clinical Triage Review Queue
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Deterministic priority sorting &bull; Human-in-the-loop clinical review &bull; Anonymous Case Identifiers
            </p>
          </div>

          <button
            type="button"
            onClick={fetchCases}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-xs font-semibold shadow-2xs transition-colors self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Queue</span>
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-white rounded border border-slate-300">
            Querying live cases from database...
          </div>
        ) : (
          <TriageQueueTable cases={cases} />
        )}
      </div>
    </div>
  );
};
