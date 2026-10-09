// JANSAATHI AI - High-Fidelity Claymorphism Patient Confirmation & Verification Step
// Shows the patient exactly what the system understood before submitting for clinical review.

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { TriageExtraction, HardwareReading, ReportDocument } from '../../types';
import { Check, Edit3, ShieldAlert, FileText, Activity } from 'lucide-react';
import { EcgWaveformGraph } from '../clinical/EcgWaveformGraph';

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

  const ecgVital = vitals.find((v) => v.reading_type === 'ECG');
  const prVital = vitals.find((v) => v.reading_type === 'PULSE_RATE');

  return (
    <div className="max-w-2xl mx-auto clay-card rounded-[36px] p-7 md:p-10">
      <div className="border-b border-purple-100 pb-5 mb-6">
        <h2 className="text-2xl font-black text-[#332F3A] font-heading">{t.review.title}</h2>
        <p className="text-xs font-semibold text-[#635F69] mt-1">{t.review.subtitle}</p>
        <div className="mt-2.5 inline-block clay-pill bg-purple-100 text-[#7C3AED] text-xs font-black font-heading">
          Language: {languageInfo.name} ({languageInfo.nativeName})
        </div>
      </div>

      <div className="space-y-4 text-sm text-[#332F3A]">
        {/* Chief concern */}
        <div className="p-5 rounded-[24px] bg-[#EFEBF5] shadow-clayPressed">
          <div className="text-xs font-black text-[#635F69] uppercase tracking-wider mb-1 font-heading">
            {t.review.chiefComplaint}:
          </div>
          <div className="text-lg font-black text-[#332F3A] font-heading">
            {extraction.chief_complaint || 'General health consultation'}
          </div>
        </div>

        {/* Symptoms list */}
        {extraction.symptoms.length > 0 && (
          <div className="p-5 rounded-[24px] bg-[#EFEBF5] shadow-clayPressed">
            <div className="text-xs font-black text-[#635F69] uppercase tracking-wider mb-2.5 font-heading">
              Recognized Symptoms:
            </div>
            <div className="flex flex-wrap gap-2">
              {extraction.symptoms.map((symptom, idx) => (
                <span
                  key={idx}
                  className="clay-pill bg-white text-[#332F3A] border border-white text-xs font-bold"
                >
                  {symptom}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Duration & Severity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="p-4 rounded-[22px] bg-white/90 shadow-clayPill border border-white">
            <div className="text-xs font-bold text-[#635F69] mb-1 font-heading">{t.review.duration}:</div>
            <div className="text-sm font-black text-[#332F3A] font-heading">{extraction.duration || 'Not specified'}</div>
          </div>
          <div className="p-4 rounded-[22px] bg-white/90 shadow-clayPill border border-white">
            <div className="text-xs font-bold text-[#635F69] mb-1 font-heading">{t.review.severity}:</div>
            <div className="text-sm font-black text-[#332F3A] font-heading">{extraction.reported_severity}</div>
          </div>
        </div>

        {/* Attached Reports */}
        {reports.length > 0 && (
          <div className="p-4 rounded-[22px] bg-cyan-500/10 border border-cyan-300/50 shadow-clayPill flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-cyan-700" />
              <span className="text-xs font-bold text-cyan-950 font-heading">
                {reports.length} Diagnostic Report(s) Attached & OCR Parsed
              </span>
            </div>
            <span className="text-xs text-cyan-800 font-semibold">{reports[0].file_name}</span>
          </div>
        )}

        {/* Recorded Vitals */}
        {vitals.length > 0 && (
          <div className="space-y-3">
            <div className="p-4 rounded-[22px] bg-emerald-500/10 border border-emerald-300/50 shadow-clayPill flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold text-emerald-950 font-heading">
                  Telemetry Readings:
                </span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-black text-emerald-900 font-heading">
                {vitals.map((v) => (
                  <span key={v.id} className="clay-pill bg-white text-emerald-800 text-[11px]">
                    {v.reading_type}: {v.numerical_value} {v.unit}
                  </span>
                ))}
              </div>
            </div>

            {/* ECG Strip Recorded Preview */}
            {ecgVital && (
              <div className="mt-2">
                <EcgWaveformGraph
                  samples={ecgVital.waveform_samples}
                  ppgSamples={ecgVital.ppg_samples}
                  liveValue={ecgVital.numerical_value}
                  isLive={false}
                  leadsOff={!ecgVital.is_stable}
                  heartRate={prVital?.numerical_value || 74}
                  spo2Value={vitals.find((v) => v.reading_type === 'SPO2')?.numerical_value || 98}
                  title="15-Second Diagnostic ECG Rhythm Strip (Lead I Attached)"
                  subtitle="Recorded for clinician electrophysiological analysis"
                  compact={true}
                  allowFreeze={false}
                  showControls={false}
                  height={150}
                  durationSeconds={15}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Safety notice reminder */}
      <div className="my-6 p-4 rounded-[22px] bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-300/60 shadow-clayPill text-xs text-amber-950 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <span className="font-medium">
          A licensed clinician will review this dossier in the clinical queue. This system does not diagnose or prescribe autonomously.
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-purple-100">
        <button
          type="button"
          onClick={onEdit}
          disabled={isSubmitting}
          className="clay-btn-secondary w-full sm:w-auto text-xs px-6 py-3.5 h-13"
        >
          <Edit3 className="w-3.5 h-3.5 text-[#7C3AED]" />
          <span>{t.review.editInput}</span>
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting}
          className="clay-btn-primary w-full sm:w-auto text-xs px-8 py-3.5 h-13 disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          <span>{isSubmitting ? 'Registering Case...' : t.review.confirmSubmit}</span>
        </button>
      </div>
    </div>
  );
};
