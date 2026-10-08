// JANSAATHI AI - Permanent Clinical Safety Disclaimer Banner
// Prominently shown across the application to establish clinical boundaries.

import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const ClinicalDisclaimer: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { t } = useLanguage();

  if (compact) {
    return (
      <div className="bg-slate-900 text-slate-200 px-4 py-2 text-xs border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
          <span>
            <strong>ADVISORY CLINICAL TRIAGE ASSISTANT:</strong> {t.disclaimer}
          </span>
        </div>
        <span className="text-[11px] uppercase tracking-wider text-slate-400 shrink-0 ml-4 hidden sm:inline">
          Human-in-the-loop Only
        </span>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="Clinical safety notice"
      className="bg-amber-50 border-l-4 border-amber-600 p-4 text-amber-950 rounded-r shadow-xs my-3"
    >
      <div className="flex items-start space-x-3">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-sm">
          <p className="font-semibold text-amber-900 uppercase tracking-wide text-xs mb-0.5">
            Clinical Safety & Governance Notice
          </p>
          <p className="leading-relaxed text-slate-800">{t.disclaimer}</p>
        </div>
      </div>
    </div>
  );
};
