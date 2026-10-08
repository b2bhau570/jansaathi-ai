// JANSAATHI AI - Public Landing Page
// Production healthcare infrastructure overview. Human-in-the-loop triage support.

import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { ClinicalDisclaimer } from '../components/common/ClinicalDisclaimer';
import {
  Stethoscope,
  Globe2,
  FileCheck2,
  ShieldCheck,
  Cpu,
  Activity,
  ArrowRight,
  CheckCircle2,
  Building,
  Lock,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Top Notice */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <ClinicalDisclaimer />
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-100/80 border border-teal-300 rounded-full text-xs font-semibold text-teal-900">
              <span className="w-2 h-2 rounded-full bg-teal-600"></span>
              <span>Public Health Infrastructure &bull; Zero Software Cost Architecture</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Structured Triage Support for Faster Human Review
            </h1>

            <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-2xl">
              Patient health information in public clinics is often multilingual, fragmented, and difficult to review quickly.
              JANSAATHI AI converts messy patient-provided statements and lab reports into a clean, structured triage note for a qualified healthcare professional to review.
            </p>

            <div className="p-4 bg-white rounded border border-slate-300 shadow-xs text-xs text-slate-800 space-y-2">
              <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Core Operational Mandate:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Never acts as a doctor</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Never diagnoses or prescribes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Deterministic urgency rule engine</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>A qualified human always decides</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <Link
                to="/patient"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-800 hover:bg-teal-700 text-white font-semibold text-sm rounded shadow-sm transition-colors"
              >
                <span>Start Patient Intake Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/cases"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-slate-100 text-slate-800 font-semibold text-sm rounded border border-slate-300 shadow-2xs transition-colors"
              >
                <Stethoscope className="w-4 h-4 text-teal-700" />
                <span>Open Clinical Triage Queue</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics / Workflow Card */}
          <div className="lg:col-span-5 bg-white rounded border border-slate-300 p-6 shadow-xs space-y-5">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-200">
              Target Clinical Environments
            </h2>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded border border-slate-200">
                <Building className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">Primary Health Centres (PHCs) & CHCs</strong>
                  <span>Helps Community Health Officers (CHOs) summarize patient presentations before telemedicine doctor calls.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded border border-slate-200">
                <Activity className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">Public Health Camps & Company Clinics</strong>
                  <span>Rapid triage during high-volume health screenings and industrial-estate medical units.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded border border-slate-200">
                <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">Campus & Occupational Health Units</strong>
                  <span>Standardizes baseline symptom capture with zero patient data resale or profiling.</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Security: Supabase Row Level Security</span>
              <span className="font-mono text-emerald-700 font-semibold">Active RLS</span>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Highlights Section */}
      <section className="bg-white border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-slate-900">
              Rigorous Healthcare Safety & Multi-Provenance Architecture
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Every design choice reflects clinical accountability, privacy by design, and zero software investment requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-slate-50 rounded border border-slate-200">
              <Globe2 className="w-8 h-8 text-teal-700 mb-3" />
              <h3 className="text-base font-bold text-slate-900 mb-1">13 Indian Languages</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Honest capability registry for Hindi, Odia, Bengali, Telugu, Tamil, Marathi, and more. When browser speech recognition is not supported for a language, the interface cleanly guides the user to text input without simulating fake recognition.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded border border-slate-200">
              <Cpu className="w-8 h-8 text-teal-700 mb-3" />
              <h3 className="text-base font-bold text-slate-900 mb-1">Deterministic Urgency Engine</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We never let an LLM decide clinical emergency. Predefined, version-controlled rules evaluate acute chest pain, respiratory distress, stroke signals, and vital hypoxia objectively.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded border border-slate-200">
              <FileCheck2 className="w-8 h-8 text-teal-700 mb-3" />
              <h3 className="text-base font-bold text-slate-900 mb-1">In-Browser OCR & Telemetry</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Extracts lab parameters locally via Tesseract.js Web Workers without paid external APIs. Connects directly to pulse oximeters and medical telemetry devices via Web Serial and Web Bluetooth.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
