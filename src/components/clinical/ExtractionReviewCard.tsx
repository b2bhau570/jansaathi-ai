// JANSAATHI AI - High-Fidelity Claymorphism Clinical Extraction Review Card
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
    <div className="clay-card-static rounded-[36px] p-7 md:p-8 bg-white/85 shadow-clayCard mb-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-purple-100 gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-xl font-black text-[#332F3A] font-heading">Structured Triage Extraction</h3>
            <span className="clay-pill bg-[#EFEBF5] text-[#7C3AED] text-[10px] font-mono">
              Schema v{extraction.schema_version}
            </span>
          </div>
          <div className="text-xs text-[#635F69] mt-1 flex items-center gap-2 font-medium">
            <Cpu className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>Extracted via: {extraction.ai_provider} ({extraction.model_version})</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isVerified ? (
            <span className="clay-pill bg-emerald-500/15 text-emerald-900 text-xs font-black">
              Clinician Verified
            </span>
          ) : (
            onVerify && (
              <button
                type="button"
                onClick={onVerify}
                className="clay-btn-primary text-xs px-5 py-2.5 min-h-[38px] rounded-[18px]"
              >
                Mark Information Verified
              </button>
            )
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
        {/* Chief Complaint */}
        <div className="p-5 rounded-[24px] bg-[#EFEBF5] shadow-clayPressed">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-black text-[#635F69] uppercase tracking-wide font-heading">
              Chief Presenting Complaint:
            </span>
            <SourceBadge source="PATIENT_TEXT" />
          </div>
          <div className="text-base font-black text-[#332F3A] font-heading">
            {extraction.chief_complaint}
          </div>
        </div>

        {/* Duration & Intensity */}
        <div className="p-5 rounded-[24px] bg-[#EFEBF5] shadow-clayPressed">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-black text-[#635F69] uppercase tracking-wide font-heading">
              Duration & Reported Severity:
            </span>
            <SourceBadge source="PATIENT_TEXT" />
          </div>
          <div className="text-sm font-bold text-[#332F3A]">
            <strong>Duration:</strong> {extraction.duration || 'Not specified'} &bull;{' '}
            <strong>Severity:</strong> {extraction.reported_severity}
          </div>
        </div>
      </div>

      {/* Reported Symptoms with Individual Badges */}
      <div className="p-5 rounded-[28px] bg-[#EFEBF5] shadow-clayPressed">
        <div className="text-xs font-black text-[#332F3A] uppercase tracking-wide mb-3 flex items-center justify-between font-heading">
          <span>Identified Symptoms ({extraction.symptoms.length}):</span>
          <span className="text-[11px] text-[#635F69] font-medium lowercase">Individual Evidence Tags</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {extraction.symptoms.map((symptom, idx) => (
            <div
              key={idx}
              className="clay-pill bg-white/95 text-[#332F3A] border border-white shadow-clayPill text-xs font-bold"
            >
              <span>{symptom}</span>
              <SourceBadge source="PATIENT_TEXT" />
            </div>
          ))}
        </div>
      </div>

      {/* Chronological Timeline */}
      {extraction.timeline.length > 0 && (
        <div className="p-5 rounded-[28px] bg-[#EFEBF5] shadow-clayPressed">
          <div className="text-xs font-black text-[#332F3A] uppercase tracking-wide mb-3 flex items-center gap-2 font-heading">
            <Clock className="w-4 h-4 text-[#7C3AED]" />
            <span>Symptom Timeline:</span>
          </div>
          <div className="space-y-2.5">
            {extraction.timeline.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs bg-white/80 p-3 rounded-2xl shadow-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED] shrink-0 mt-1"></span>
                <div className="flex-1 font-medium text-[#332F3A]">
                  <span className="font-black text-[#332F3A] font-heading">{item.approximate_time}:</span>{' '}
                  <span>{item.description}</span>
                  {item.is_approximate && (
                    <span className="ml-1 text-[10px] text-amber-700 italic font-bold">(approximate)</span>
                  )}
                </div>
                <SourceBadge source={item.source} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comorbidities, Medications, Allergies */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
        <div className="p-4 rounded-[22px] bg-white/90 shadow-clayPill border border-white">
          <div className="font-black text-[#332F3A] uppercase tracking-wider text-[11px] mb-2 font-heading">
            Reported Medical History:
          </div>
          {extraction.medical_history.length > 0 ? (
            <ul className="list-disc list-inside space-y-1 text-[#332F3A] font-medium">
              {extraction.medical_history.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          ) : (
            <span className="text-[#635F69] italic">None reported</span>
          )}
        </div>

        <div className="p-4 rounded-[22px] bg-white/90 shadow-clayPill border border-white">
          <div className="font-black text-[#332F3A] uppercase tracking-wider text-[11px] mb-2 font-heading">
            Current / Prior Medications:
          </div>
          {extraction.medications_reported.length > 0 ? (
            <ul className="list-disc list-inside space-y-1 text-[#332F3A] font-medium">
              {extraction.medications_reported.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          ) : (
            <span className="text-[#635F69] italic">None reported</span>
          )}
        </div>

        <div className="p-4 rounded-[22px] bg-white/90 shadow-clayPill border border-white">
          <div className="font-black text-[#332F3A] uppercase tracking-wider text-[11px] mb-2 font-heading">
            Reported Allergies:
          </div>
          {extraction.allergies_reported.length > 0 ? (
            <ul className="list-disc list-inside space-y-1 text-rose-700 font-bold">
              {extraction.allergies_reported.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          ) : (
            <span className="text-[#635F69] italic">None reported</span>
          )}
        </div>
      </div>

      {/* Uncertainty & Safety Disclaimer */}
      {extraction.uncertainties.length > 0 && (
        <div className="p-4 rounded-[24px] bg-amber-500/10 border border-amber-300/60 shadow-clayPill text-xs text-amber-950 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-black block font-heading">Extraction Uncertainty Disclosures:</span>
            <ul className="list-disc list-inside space-y-0.5 text-xs text-[#332F3A] mt-1 font-medium">
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
