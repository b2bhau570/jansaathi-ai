// JANSAATHI AI - Missing Information & Follow-Up Questions Card
// Highlights objective clinical gaps and targeted clarifying queries for health workers.

import React from 'react';
import { HelpCircle, AlertCircle, CheckCircle2 } from 'lucide-react';

interface MissingInfoCardProps {
  missingInfo: string[];
  followUpQuestions: string[];
}

export const MissingInfoCard: React.FC<MissingInfoCardProps> = ({
  missingInfo,
  followUpQuestions,
}) => {
  return (
    <div className="bg-white rounded border border-slate-300 p-5 shadow-xs mb-5">
      <div className="flex items-center space-x-2 pb-3 border-b border-slate-200">
        <HelpCircle className="w-5 h-5 text-indigo-700" />
        <h3 className="text-base font-bold text-slate-900">
          Clinical Gaps & Recommended Follow-Up Queries
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
        {/* Identified Missing Gaps */}
        <div className="p-3.5 bg-slate-50 rounded border border-slate-200">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Missing Clinical Information:</span>
          </h4>
          {missingInfo && missingInfo.length > 0 ? (
            <ul className="space-y-2 text-xs text-slate-800">
              {missingInfo.map((gap, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5"></span>
                  <span className="leading-snug">{gap}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-xs text-emerald-800 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>All baseline triage fields (duration, severity, medications) provided.</span>
            </div>
          )}
        </div>

        {/* Suggested Non-Leading Follow-Up Questions */}
        <div className="p-3.5 bg-indigo-50/50 rounded border border-indigo-200">
          <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-700" />
            <span>Non-Leading Informational Questions for Health Worker:</span>
          </h4>
          {followUpQuestions && followUpQuestions.length > 0 ? (
            <ul className="space-y-2 text-xs text-indigo-950">
              {followUpQuestions.map((q, idx) => (
                <li key={idx} className="p-2 bg-white rounded border border-indigo-150 leading-snug">
                  <strong>Q{idx + 1}:</strong> {q}
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-xs text-slate-500 italic">No specific follow-up questions generated.</span>
          )}
        </div>
      </div>

      <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
        <strong>Governance:</strong> Questions are strictly informational to gather clarifying history. They do NOT suggest diagnoses or lead the patient.
      </div>
    </div>
  );
};
