// JANSAATHI AI - High-Fidelity Claymorphism Patient Informed Consent Step
// Rounded-[36px] glass-clay card with tactile recessed consent checklist and squish buttons

import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { ShieldCheck, Check, AlertCircle } from 'lucide-react';

interface ConsentStepProps {
  onConsentGiven: () => void;
  onDecline: () => void;
}

export const ConsentStep: React.FC<ConsentStepProps> = ({ onConsentGiven, onDecline }) => {
  const { t } = useLanguage();
  const [understoodPurpose, setUnderstoodPurpose] = useState(false);
  const [understoodNoDiagnosis, setUnderstoodNoDiagnosis] = useState(false);
  const [understoodHumanReview, setUnderstoodHumanReview] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleProceed = () => {
    if (!understoodPurpose || !understoodNoDiagnosis || !understoodHumanReview) {
      setErrorMessage(t.consent.mustAgree);
      return;
    }
    setErrorMessage('');
    onConsentGiven();
  };

  return (
    <div className="max-w-2xl mx-auto clay-card rounded-[36px] p-7 md:p-10">
      <div className="flex items-center space-x-4 pb-5 border-b border-purple-100">
        <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center shrink-0 text-white shadow-clayOrb">
          <ShieldCheck className="w-7 h-7" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-[#332F3A] font-heading">{t.consent.title}</h2>
          <p className="text-xs font-semibold text-[#635F69] mt-0.5">Version 1.0 (2026) &bull; Standard Triage Intake</p>
        </div>
      </div>

      <p className="text-sm text-[#332F3A] my-5 font-medium leading-relaxed">{t.consent.purpose}</p>

      {errorMessage && (
        <div
          role="alert"
          className="mb-5 p-4 bg-rose-500/15 border border-rose-300 rounded-[20px] text-rose-900 text-xs font-bold flex items-center gap-2.5 shadow-clayPill"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Informed points checkboxes inside tactile recessed clay container */}
      <div className="space-y-4 my-6 bg-[#EFEBF5] p-6 rounded-[28px] shadow-clayPressed text-sm">
        <label className="flex items-start gap-3.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={understoodPurpose}
            onChange={(e) => setUnderstoodPurpose(e.target.checked)}
            className="mt-1 w-5 h-5 text-[#7C3AED] rounded-lg accent-[#7C3AED] cursor-pointer"
          />
          <span className="text-[#332F3A] font-medium leading-snug">{t.consent.point1}</span>
        </label>

        <label className="flex items-start gap-3.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={understoodNoDiagnosis}
            onChange={(e) => setUnderstoodNoDiagnosis(e.target.checked)}
            className="mt-1 w-5 h-5 text-[#7C3AED] rounded-lg accent-[#7C3AED] cursor-pointer"
          />
          <span className="text-[#332F3A] font-extrabold leading-snug">
            {t.consent.point2}
          </span>
        </label>

        <label className="flex items-start gap-3.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={understoodHumanReview}
            onChange={(e) => setUnderstoodHumanReview(e.target.checked)}
            className="mt-1 w-5 h-5 text-[#7C3AED] rounded-lg accent-[#7C3AED] cursor-pointer"
          />
          <span className="text-[#332F3A] font-medium leading-snug">{t.consent.point3}</span>
        </label>

        <div className="pt-3 border-t border-purple-200/60 text-xs text-[#635F69] font-bold flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 shadow-xs"></span>
          <span>{t.consent.point4}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-purple-100">
        <button
          type="button"
          onClick={onDecline}
          className="clay-btn-secondary w-full sm:w-auto text-xs px-6 py-3.5 h-13 rounded-[20px]"
        >
          {t.consent.declineButton}
        </button>

        <button
          type="button"
          onClick={handleProceed}
          className="clay-btn-primary w-full sm:w-auto text-xs px-8 py-3.5 h-13 rounded-[20px]"
        >
          <Check className="w-4 h-4" />
          <span>{t.consent.agreeButton}</span>
        </button>
      </div>
    </div>
  );
};
