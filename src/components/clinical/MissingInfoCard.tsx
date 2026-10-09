// JANSAATHI AI - High-Fidelity Claymorphism Missing Information & Follow-Up Questions Card
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
    <div className="clay-card-static rounded-[36px] p-7 md:p-8 bg-white/85 shadow-clayCard mb-6 space-y-5">
      <div className="flex items-center space-x-3 pb-4 border-b border-purple-100">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white shadow-clayOrb shrink-0">
          <HelpCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-black text-[#332F3A] font-heading">
            Clinical Gaps & Recommended Follow-Up Queries
          </h3>
          <p className="text-xs font-semibold text-[#635F69] mt-0.5">
            Objective baseline analysis for attending clinicians and health workers
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
        {/* Identified Missing Gaps */}
        <div className="p-5 rounded-[24px] bg-[#EFEBF5] shadow-clayPressed">
          <h4 className="text-xs font-black text-[#332F3A] uppercase tracking-wide mb-3 flex items-center gap-2 font-heading">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Missing Clinical Information:</span>
          </h4>
          {missingInfo && missingInfo.length > 0 ? (
            <ul className="space-y-2 text-xs text-[#332F3A] font-medium">
              {missingInfo.map((gap, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1"></span>
                  <span className="leading-snug">{gap}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-xs text-emerald-800 flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>All baseline triage fields (duration, severity, medications) provided.</span>
            </div>
          )}
        </div>

        {/* Suggested Non-Leading Follow-Up Questions */}
        <div className="p-5 rounded-[24px] bg-purple-500/10 border border-purple-200/60 shadow-clayPill">
          <h4 className="text-xs font-black text-purple-950 uppercase tracking-wide mb-3 flex items-center gap-2 font-heading">
            <HelpCircle className="w-4 h-4 text-[#7C3AED]" />
            <span>Non-Leading Informational Queries:</span>
          </h4>
          {followUpQuestions && followUpQuestions.length > 0 ? (
            <ul className="space-y-2 text-xs text-purple-950">
              {followUpQuestions.map((q, idx) => (
                <li key={idx} className="p-3 bg-white/95 rounded-2xl border border-white leading-snug font-medium shadow-xs">
                  <strong className="font-heading text-[#7C3AED]">Q{idx + 1}:</strong> {q}
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-xs text-[#635F69] italic">No specific follow-up questions generated.</span>
          )}
        </div>
      </div>

      <div className="text-xs text-[#635F69] pt-3 border-t border-purple-100 font-medium">
        <strong className="font-heading text-[#332F3A]">Governance:</strong> Questions are strictly informational to gather clarifying history. They do NOT suggest diagnoses or lead the patient.
      </div>
    </div>
  );
};
