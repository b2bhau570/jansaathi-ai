// JANSAATHI AI - Patient Confirmation & Verification Step
// Shows the patient exactly what the system understood before submitting for clinical review.

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { TriageExtraction, HardwareReading, ReportDocument } from '../../types';
import { Check, Edit3, ShieldAlert, FileText, Activity } from 'lucide-react';

interface PatientReviewSummaryProps {
  extraction: TriageExtraction;
  vitals: HardwareReading[];
  reports: ReportDocument[];
  onConfirm: () => void;
  onEdit: () => void;
  isSubmitting: boolean;
}

export const PatientReviewSummary: React.FC<PatientReviewSummaryProps> = ({
  extraction,
  vitals,
  reports,
  onConfirm,
  onEdit,
  isSubmitting,
}) => {
  const { t, languageInfo } = useLanguage();

  return (
    <div className="max-w-2xl mx-auto bg-white rounded border border-slate-300 p-6 md:p-8 shadow-xs">
      <div className="border-b border-slate-200 pb-4 mb-6">
        <h2 className="text-xl font-bold text-slate-900">{t.review.title}</h2>
        <p className="text-xs text-slate-600 mt-1">{t.review.subtitle}</p>
        <div className="mt-2 text-[11px] text-teal-800 font-medium">
          Language: {languageInfo.name} ({languageInfo.nativeName})
        </div>
      </div>

      <div className="space-y-4 text-sm text-slate-800">
        {/* Chief concern */}
        <div className="p-3.5 bg-slate-50 rounded border border-slate-200">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
            {t.review.chiefComplaint}:
          </div>
          <div className="text-base font-semibold text-slate-900">
            {extraction.chief_complaint || 'General health consultation'}
          </div>
        </div>

        {/* Symptoms list */}
        {extraction.symptoms.length > 0 && (
          <div className="p-3.5 bg-slate-50 rounded border border-slate-200">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
              Recognized Symptoms:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {extraction.symptoms.map((symptom, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded text-xs font-medium text-slate-800"
                >
                  {symptom}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Duration & Severity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <div className="text-xs font-bold text-slate-600 mb-1">{t.review.duration}:</div>
            <div className="text-sm font-semibold text-slate-900">{extraction.duration || 'Not specified'}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <div className="text-xs font-bold text-slate-600 mb-1">{t.review.severity}:</div>
            <div className="text-sm font-semibold text-slate-900">{extraction.reported_severity}</div>
          </div>
        </div>

        {/* Attached Reports */}
        {reports.length > 0 && (
          <div className="p-3.5 bg-cyan-50/50 rounded border border-cyan-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-700" />
              <span className="text-xs font-semibold text-cyan-950">
                {reports.length} Diagnostic Report(s) Attached & OCR Parsed
              </span>
            </div>
            <span className="text-xs text-cyan-800 font-medium">{reports[0].file_name}</span>
          </div>
        )}

        {/* Recorded Vitals */}
        {vitals.length > 0 && (
          <div className="p-3.5 bg-emerald-50/50 rounded border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-semibold text-emerald-950">
                Telemetry Readings:
              </span>
            </div>
            <div className="flex gap-3 text-xs font-bold text-emerald-900">
              {vitals.map((v) => (
                <span key={v.id}>
                  {v.reading_type}: {v.numerical_value} {v.unit}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Safety notice reminder */}
      <div className="my-6 p-3 bg-amber-50 border border-amber-300 rounded text-xs text-amber-950 flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <span>
          A qualified healthcare professional will review this information. This system does not diagnose or prescribe.
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onEdit}
          disabled={isSubmitting}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded text-xs font-semibold transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{t.review.editInput}</span>
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-teal-800 hover:bg-teal-700 text-white rounded text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
        >
          <Check className="w-4 h-4" />
          <span>{isSubmitting ? 'Registering Case...' : t.review.confirmSubmit}</span>
        </button>
      </div>
    </div>
  );
};
