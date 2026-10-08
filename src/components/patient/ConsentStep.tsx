// JANSAATHI AI - Patient Informed Consent Step
// Mandatory explicit agreement before capturing any symptom data.

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
    <div className="max-w-2xl mx-auto bg-white rounded border border-slate-300 shadow-xs p-6 md:p-8">
      <div className="flex items-center space-x-3 pb-4 border-b border-slate-200">
        <div className="w-10 h-10 rounded bg-teal-100 border border-teal-300 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-6 h-6 text-teal-800" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t.consent.title}</h2>
          <p className="text-xs text-slate-600 mt-0.5">Version 1.0 (2026) &bull; Standard Triage Intake</p>
        </div>
      </div>

      <p className="text-sm text-slate-700 my-4 leading-relaxed">{t.consent.purpose}</p>

      {errorMessage && (
        <div
          role="alert"
          className="mb-4 p-3 bg-red-50 border border-red-300 text-red-900 rounded text-xs flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Informed points checkboxes */}
      <div className="space-y-3.5 my-6 bg-slate-50 p-4 rounded border border-slate-200 text-sm">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={understoodPurpose}
            onChange={(e) => setUnderstoodPurpose(e.target.checked)}
            className="mt-1 w-4 h-4 text-teal-700 border-slate-400 rounded focus:ring-teal-600"
          />
          <span className="text-slate-800 leading-snug">{t.consent.point1}</span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={understoodNoDiagnosis}
            onChange={(e) => setUnderstoodNoDiagnosis(e.target.checked)}
            className="mt-1 w-4 h-4 text-teal-700 border-slate-400 rounded focus:ring-teal-600"
          />
          <span className="text-slate-800 leading-snug font-medium text-slate-900">
            {t.consent.point2}
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={understoodHumanReview}
            onChange={(e) => setUnderstoodHumanReview(e.target.checked)}
            className="mt-1 w-4 h-4 text-teal-700 border-slate-400 rounded focus:ring-teal-600"
          />
          <span className="text-slate-800 leading-snug">{t.consent.point3}</span>
        </label>

        <div className="pt-2 border-t border-slate-200 text-xs text-slate-600 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0"></span>
          <span>{t.consent.point4}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onDecline}
          className="w-full sm:w-auto px-4 py-2 border border-slate-300 text-slate-700 rounded text-xs font-semibold hover:bg-slate-100 transition-colors"
        >
          {t.consent.declineButton}
        </button>

        <button
          type="button"
          onClick={handleProceed}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-teal-800 hover:bg-teal-700 text-white rounded text-xs font-semibold shadow-xs transition-colors"
        >
          <Check className="w-4 h-4" />
          <span>{t.consent.agreeButton}</span>
        </button>
      </div>
    </div>
  );
};
