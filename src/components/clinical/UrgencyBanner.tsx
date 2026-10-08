// JANSAATHI AI - Deterministic Urgency Review Banner
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
      <div className="bg-slate-50 border border-slate-200 rounded p-4 text-xs text-slate-700 flex items-center gap-2 mb-4">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
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
      className={`rounded border-l-4 p-4 mb-5 shadow-xs ${
        isUrgent
          ? 'bg-red-50 border-red-700 text-red-950'
          : 'bg-amber-50 border-amber-600 text-amber-950'
      }`}
    >
      <div className="flex items-start gap-3">
        {isUrgent ? (
          <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        )}
        <div className="w-full">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm tracking-tight uppercase">
              {isUrgent ? 'Urgent Review Signal Detected' : 'Priority Review Signal Detected'}
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/80 border border-slate-300">
              Deterministic Engine
            </span>
          </div>

          <p className="text-xs mt-1 mb-3 text-slate-800">
            The following objective signals triggered predefined safety criteria. This is NOT a diagnosis; immediate qualified clinical evaluation is advised.
          </p>

          <div className="space-y-2.5">
            {flags.map((flag) => (
              <div
                key={flag.id}
                className="p-3 bg-white/90 rounded border border-slate-200 text-xs text-slate-900 shadow-2xs"
              >
                <div className="flex items-center justify-between font-semibold mb-1">
                  <span className="text-red-900">{flag.rule_code}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Source: {flag.source_reference}
                  </span>
                </div>
                <div className="text-slate-800 font-medium">{flag.detected_signal}</div>
                <div className="text-[11px] text-slate-600 mt-1 leading-relaxed">
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
