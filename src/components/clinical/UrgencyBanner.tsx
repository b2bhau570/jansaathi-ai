// JANSAATHI AI - High-Fidelity Claymorphism Deterministic Urgency Review Banner
// Displays explicit rule-triggered signals with clinical rationales. Never claims AI medical diagnoses.

import React from 'react';
import { UrgencyFlag } from '../../types';
import { AlertCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

interface UrgencyBannerProps {
  flags: UrgencyFlag[];
}

export const UrgencyBanner: React.FC<UrgencyBannerProps> = ({ flags }) => {
  if (!flags || flags.length === 0) {
    return (
      <div className="clay-card-static rounded-[28px] p-5 text-xs text-[#332F3A] flex items-center gap-3 mb-6 bg-white/80 shadow-clayPill">
        <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-emerald-700 shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <span className="font-medium">
          No predefined urgency-review signals were detected from the available patient information. Proceed with routine clinical assessment.
        </span>
      </div>
    );
  }

  const urgentFlags = flags.filter((f) => f.priority === 'URGENT_REVIEW');
  const isUrgent = urgentFlags.length > 0;

  return (
    <div
      role="alert"
      className={`rounded-[32px] p-6 sm:p-7 mb-6 shadow-clayCard ${
        isUrgent
          ? 'bg-rose-500/10 border-2 border-rose-300 text-rose-950'
          : 'bg-amber-500/10 border-2 border-amber-300 text-amber-950'
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-clayOrb ${
            isUrgent ? 'bg-gradient-to-br from-rose-400 to-rose-600' : 'bg-gradient-to-br from-amber-400 to-amber-600'
          }`}
        >
          {isUrgent ? <AlertCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
        </div>
        <div className="w-full">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base sm:text-lg tracking-tight uppercase font-heading">
              {isUrgent ? 'Urgent Review Signal Detected' : 'Priority Review Signal Detected'}
            </h3>
            <span className="clay-pill bg-white text-[#332F3A] text-[10px] font-mono">
              Deterministic Rules
            </span>
          </div>

          <p className="text-xs sm:text-sm mt-1 mb-4 text-[#332F3A] font-medium leading-relaxed">
            The following objective signals triggered predefined safety criteria. This is NOT a diagnosis; immediate qualified clinical evaluation is advised.
          </p>

          <div className="space-y-3">
            {flags.map((flag) => (
              <div
                key={flag.id}
                className="p-4 bg-white/95 rounded-[22px] border border-white text-xs text-[#332F3A] shadow-clayPill"
              >
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className="text-rose-700 font-mono font-black">{flag.rule_code}</span>
                  <span className="text-[10px] text-[#635F69] font-mono">
                    Source: {flag.source_reference}
                  </span>
                </div>
                <div className="text-[#332F3A] font-extrabold text-sm font-heading">{flag.detected_signal}</div>
                <div className="text-xs text-[#635F69] mt-1 leading-relaxed font-medium">
                  {flag.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
