// JANSAATHI AI - About Page
// Practical clinical mission and public health deployment context

import React from 'react';
import { ClinicalDisclaimer } from '../components/common/ClinicalDisclaimer';
import { Stethoscope, CheckCircle2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <ClinicalDisclaimer />

        <div className="bg-white rounded border border-slate-300 p-8 shadow-xs mt-6 space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h1 className="text-2xl font-bold text-slate-900">About JANSAATHI AI</h1>
            <p className="text-xs text-slate-600 mt-1">
              Multilingual Triage Assistant & Human-in-the-Loop Clinical Workflow System
            </p>
          </div>

          <div className="space-y-4 text-sm text-slate-800 leading-relaxed">
            <p>
              In busy public health clinics, Primary Health Centres (PHCs), and health camps across India, patients often present with complex, multilingual descriptions of symptoms alongside paper diagnostic slips. Healthcare workers and medical officers spend substantial consultation time translating and deciphering baseline histories.
            </p>

            <p>
              <strong>JANSAATHI AI</strong> was engineered as an objective triage information organizer. Its single objective is to take messy patient-provided speech, text, and diagnostic reports, and synthesize them into a structured triage note with verified provenance for a doctor to review.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded border border-slate-200 space-y-2 text-xs">
            <h3 className="font-bold text-slate-900 uppercase tracking-wide">
              Foundational System Principles:
            </h3>
            <ul className="space-y-2 text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Strict Non-Diagnostic Scope:</strong> The system NEVER diagnoses disease, prescribes medication, or determines definitive medical conclusions.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Deterministic Urgency:</strong> Red flags (chest pain, severe dyspnea, stroke signs, SpO2 &lt; 92%) are triggered strictly by rule-based criteria, never by generative AI prediction.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Data Minimization:</strong> Patients are identified solely by anonymous sequence identifiers (e.g. P-2026-000001). We collect zero Aadhaar numbers or unnecessary personal identifiers.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Zero Software Investment:</strong> Operates entirely on open-source, in-browser capabilities (Web Speech API, Tesseract.js client OCR, Web Serial) and Supabase free tier.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
