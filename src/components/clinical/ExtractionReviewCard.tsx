// JANSAATHI AI - Clinical Extraction Review Card
// Distinguishes Patient-Reported, AI-Extracted, Report-OCR, and Hardware telemetry with multi-provenance badges.

import React from 'react';
import { TriageExtraction } from '../../types';
import { SourceBadge } from '../common/Badge';
import { Clock, ShieldAlert, Cpu } from 'lucide-react';

interface ExtractionReviewCardProps {
  extraction: TriageExtraction;
  onVerify?: () => void;
  isVerified?: boolean;
}

export const ExtractionReviewCard: React.FC<ExtractionReviewCardProps> = ({
  extraction,
  onVerify,
  isVerified = false,
}) => {
  return (
    <div className="bg-white rounded border border-slate-300 p-5 shadow-xs mb-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">Structured Triage Extraction</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              Schema v{extraction.schema_version}
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-teal-600" />
            <span>Extracted via: {extraction.ai_provider} ({extraction.model_version})</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isVerified ? (
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-xs font-semibold">
              Clinician Verified
            </span>
          ) : (
            onVerify && (
              <button
                type="button"
                onClick={onVerify}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-semibold transition-colors"
              >
                Mark Information Verified
              </button>
            )
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
        {/* Chief Complaint */}
        <div className="p-3.5 bg-slate-50 rounded border border-slate-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Chief Presenting Complaint:
            </span>
            <SourceBadge source="PATIENT_TEXT" />
          </div>
          <div className="text-sm font-semibold text-slate-900">
            {extraction.chief_complaint}
          </div>
        </div>

        {/* Duration & Intensity */}
        <div className="p-3.5 bg-slate-50 rounded border border-slate-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Duration & Patient-Reported Severity:
            </span>
            <SourceBadge source="PATIENT_TEXT" />
          </div>
          <div className="text-sm text-slate-900">
            <strong>Duration:</strong> {extraction.duration || 'Not specified'} &bull;{' '}
            <strong>Severity:</strong> {extraction.reported_severity}
          </div>
        </div>
      </div>

      {/* Reported Symptoms with Individual Badges */}
      <div className="my-4 p-3.5 bg-slate-50 rounded border border-slate-200">
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2 flex items-center justify-between">
          <span>Identified Symptoms ({extraction.symptoms.length}):</span>
          <span className="text-[11px] text-slate-500 font-normal">Individual Evidence Tags</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {extraction.symptoms.map((symptom, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-300 rounded text-xs font-medium text-slate-800 shadow-2xs"
            >
              <span>{symptom}</span>
              <SourceBadge source="PATIENT_TEXT" />
            </div>
          ))}
        </div>
      </div>

      {/* Chronological Timeline */}
      {extraction.timeline.length > 0 && (
        <div className="my-4 p-3.5 bg-slate-50 rounded border border-slate-200">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-600" />
            <span>Symptom Timeline:</span>
          </div>
          <div className="space-y-2">
            {extraction.timeline.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0 mt-1.5"></span>
                <div className="flex-1">
                  <span className="font-semibold text-slate-900">{item.approximate_time}:</span>{' '}
                  <span className="text-slate-700">{item.description}</span>
                  {item.is_approximate && (
                    <span className="ml-1 text-[10px] text-amber-700 italic">(approximate)</span>
                  )}
                </div>
                <SourceBadge source={item.source} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comorbidities, Medications, Allergies */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4 text-xs">
        <div className="p-3 bg-white rounded border border-slate-200">
          <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
            Reported Medical History:
          </div>
          {extraction.medical_history.length > 0 ? (
            <ul className="list-disc list-inside space-y-0.5 text-slate-800 font-medium">
              {extraction.medical_history.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          ) : (
            <span className="text-slate-400 italic">None reported</span>
          )}
        </div>

        <div className="p-3 bg-white rounded border border-slate-200">
          <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
            Current / Prior Medications:
          </div>
          {extraction.medications_reported.length > 0 ? (
            <ul className="list-disc list-inside space-y-0.5 text-slate-800 font-medium">
              {extraction.medications_reported.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          ) : (
            <span className="text-slate-400 italic">None reported</span>
          )}
        </div>

        <div className="p-3 bg-white rounded border border-slate-200">
          <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
            Reported Allergies:
          </div>
          {extraction.allergies_reported.length > 0 ? (
            <ul className="list-disc list-inside space-y-0.5 text-red-700 font-semibold">
              {extraction.allergies_reported.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          ) : (
            <span className="text-slate-400 italic">None reported</span>
          )}
        </div>
      </div>

      {/* Uncertainty & Safety Disclaimer */}
      {extraction.uncertainties.length > 0 && (
        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded text-xs text-amber-900 mt-3 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Extraction Uncertainty Disclosures:</span>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-700 mt-1">
              {extraction.uncertainties.map((u, i) => (
                <li key={i}>{u}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
