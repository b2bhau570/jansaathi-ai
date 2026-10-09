// JANSAATHI AI - High-Fidelity Claymorphism Clinical Safety Disclaimer Banner
// Friendly rounded clay pill/card styling with warm amber tactile depth

import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const ClinicalDisclaimer: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { t } = useLanguage();

  if (compact) {
    return (
      <div className="rounded-full bg-amber-500/10 border border-amber-300/50 backdrop-blur-md px-4 py-1.5 text-xs text-amber-950 flex items-center justify-between shadow-clayPill">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" aria-hidden="true" />
          <span className="font-medium text-[#332F3A]">
            <strong className="text-amber-800 font-heading">CLINICAL TRIAGE ADVISORY:</strong> {t.disclaimer}
          </span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800/80 shrink-0 ml-3 hidden sm:inline font-heading">
          Human-in-the-loop
        </span>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="Clinical safety notice"
      className="clay-card border-amber-200/80 bg-gradient-to-r from-amber-50/80 to-orange-50/60 p-5 rounded-[24px] my-3"
    >
      <div className="flex items-start space-x-3.5">
        <div className="w-9 h-9 rounded-2xl bg-amber-500/20 flex items-center justify-center shrink-0 shadow-clayPill text-amber-700">
          <ShieldAlert className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="text-sm">
          <p className="font-extrabold text-amber-900 uppercase tracking-wider text-xs mb-1 font-heading">
            Clinical Safety & Statutory Governance Notice
          </p>
          <p className="leading-relaxed text-[#332F3A] font-medium">{t.disclaimer}</p>
        </div>
      </div>
    </div>
  );
};
