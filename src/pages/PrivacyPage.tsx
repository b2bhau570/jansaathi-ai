// JANSAATHI AI - Privacy & Data Minimisation Statement
// Accurate description of actual data handling without false legal certifications

import React from 'react';
import { ClinicalDisclaimer } from '../components/common/ClinicalDisclaimer';
import { ShieldCheck, Lock, Check } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <ClinicalDisclaimer />

        <div className="bg-white rounded border border-slate-300 p-8 shadow-xs mt-6 space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-teal-800" />
              <h1 className="text-2xl font-bold text-slate-900">Privacy & Data Minimisation Policy</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Effective: January 2026 &bull; Designed with privacy and data-minimisation principles
            </p>
          </div>

          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              1. Strict Data Minimisation
            </h2>
            <p>
              JANSAATHI AI collects only the clinical information strictly required to facilitate the triage-support workflow. We deliberately do NOT collect:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 font-medium text-slate-800">
              <li>Aadhaar numbers or National Identity numbers</li>
              <li>Home street addresses or voter registration records</li>
              <li>Bank account, credit card, or payment credentials</li>
              <li>Biometric fingerprint or facial scans</li>
            </ul>

            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide pt-2">
              2. Anonymous Case Identifiers
            </h2>
            <p>
              Every intake session generates an anonymous case reference formatted as <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">P-YYYY-XXXXXX</code> (e.g. <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">P-2026-000001</code>). Personally identifying information is never embedded in the URL or primary workflow key.
            </p>

            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide pt-2">
              3. Processing of Voice & Uploaded Reports
            </h2>
            <p>
              - <strong>Voice Processing:</strong> Speech recognition is processed natively in the user's browser runtime using standard Web Speech API capabilities where supported. Raw audio recordings are not stored permanently by default.
            </p>
            <p>
              - <strong>Diagnostic Report OCR:</strong> Document scans are analyzed locally inside the client browser via Tesseract.js Web Workers without transmission to external OCR vendors.
            </p>

            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide pt-2">
              4. Access Control & Row Level Security (RLS)
            </h2>
            <p>
              Access to triage cases is enforced via PostgreSQL Row Level Security (RLS) inside Supabase. Only authenticated healthcare personnel assigned to a healthcare facility can inspect cases registered for that facility.
            </p>

            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide pt-2">
              5. Data Retention & Deletion
            </h2>
            <p>
              Temporary intake data may be purged following completed clinician review according to the facility's local clinical data governance schedule. Audit trail logs remain immutable for clinical safety verification.
            </p>

            <div className="p-3 bg-slate-100 rounded border border-slate-200 text-[11px] text-slate-600">
              <strong>Notice:</strong> This architecture is designed in alignment with privacy and data-minimisation principles. It makes no unverified claims of third-party commercial certifications.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
