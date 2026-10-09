// JANSAATHI AI - High-Fidelity Claymorphism Landing Page
// Tactile silicone & digital clay materiality, 4-layer shadow stacks, Nunito Black display typography, and zero sharp corners

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
  Sparkles,
  Search,
  HeartPulse,
  Award,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen py-4 sm:py-6">
      {/* Top Advisory Pill Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <ClinicalDisclaimer />
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Hero Content Left */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/80 border border-white/90 shadow-clayPill text-xs font-black tracking-wide text-[#7C3AED] font-heading">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DB2777] shadow-xs animate-ping"></span>
              <span>DIGITAL CLAY TRIAGE &bull; PUBLIC HEALTH INFRASTRUCTURE</span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-7xl font-black text-[#332F3A] tracking-tight leading-[1.08] font-heading">
              Structured Triage <br />
              <span className="clay-text-gradient">For Faster Human Review</span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-[#635F69] font-medium leading-relaxed max-w-2xl font-body">
              Patient health information in rural clinics is often multilingual, fragmented, and urgent.
              JANSAATHI AI transforms spoken vernacular statements and lab reports into a structured, tactile triage dossier ready for licensed clinicians.
            </p>

            {/* Core Mandates Clay Pill Panel */}
            <div className="clay-card-static rounded-[28px] p-6 bg-white/70">
              <div className="font-black text-[#332F3A] uppercase tracking-wider text-xs mb-3.5 flex items-center gap-2 font-heading">
                <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                <span>Deterministic Clinical Safety Protocol:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm font-bold text-[#332F3A] font-heading">
                <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-emerald-500/10 border border-emerald-300/40">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Never acts as a doctor</span>
                </div>
                <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-emerald-500/10 border border-emerald-300/40">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Never diagnoses or prescribes</span>
                </div>
                <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-emerald-500/10 border border-emerald-300/40">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Deterministic urgency engine</span>
                </div>
                <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-emerald-500/10 border border-emerald-300/40">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>A licensed doctor decides</span>
                </div>
              </div>
            </div>

            {/* CTAs with Squish and Depth */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <Link
                to="/patient"
                className="clay-btn-primary w-full sm:w-auto text-base px-8 py-4 h-16 rounded-[22px] group"
              >
                <span>Start Patient Intake</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/status"
                className="clay-btn-secondary w-full sm:w-auto text-base px-7 py-4 h-16 rounded-[22px] group"
              >
                <Search className="w-5 h-5 text-[#7C3AED]" />
                <span>Track Case ID</span>
              </Link>
              <Link
                to="/cases"
                className="clay-btn-accent-pink w-full sm:w-auto text-base px-7 py-4 h-16 rounded-[22px]"
              >
                <Stethoscope className="w-5 h-5" />
                <span>Doctor Queue</span>
              </Link>
            </div>
          </div>

          {/* Hero Bento Composition Right */}
          <div className="lg:col-span-5 space-y-5">
            {/* Main Interactive Clay Showcase Card */}
            <div className="clay-card rounded-[36px] p-7 sm:p-8 space-y-6 relative">
              <div className="flex items-center justify-between pb-4 border-b border-purple-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center shadow-clayOrb text-white">
                    <HeartPulse className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-[#332F3A] font-heading">
                      PHC Triage Engine
                    </h2>
                    <span className="text-xs font-semibold text-[#635F69]">Primary Care Assist</span>
                  </div>
                </div>
                <span className="clay-pill bg-emerald-500/15 text-emerald-800 text-[11px]">
                  Realtime Active
                </span>
              </div>

              {/* Clay Feature Pills inside Card */}
              <div className="space-y-3.5 text-xs sm:text-sm font-medium text-[#332F3A]">
                <div className="flex items-start gap-3.5 p-4 rounded-[22px] bg-white/90 shadow-clayPill border border-white">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-[#332F3A] block font-heading text-sm font-bold">Primary Health Centres (PHCs)</strong>
                    <span className="text-[#635F69] text-xs leading-relaxed">Assists frontline Community Health Officers in preparing structured dossiers prior to teleconsultation.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-4 rounded-[22px] bg-white/90 shadow-clayPill border border-white">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-[#332F3A] block font-heading text-sm font-bold">Health Camps & Mobile Vans</strong>
                    <span className="text-[#635F69] text-xs leading-relaxed">Handles loud, noisy environments with smart voice input, local speech processing, and offline fallback.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-4 rounded-[22px] bg-white/90 shadow-clayPill border border-white">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-[#332F3A] block font-heading text-sm font-bold">Protected Audit Ledger</strong>
                    <span className="text-[#635F69] text-xs leading-relaxed">Non-deletable clinical case records strictly protected by PostgreSQL Row Level Security.</span>
                  </div>
                </div>
              </div>

              {/* Floating Stat Orbs */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-200/50 text-center shadow-clayPill">
                  <div className="text-xl sm:text-2xl font-black text-[#7C3AED] font-heading">13+</div>
                  <div className="text-[10px] font-bold text-[#635F69] uppercase tracking-wide">Languages</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-200/50 text-center shadow-clayPill">
                  <div className="text-xl sm:text-2xl font-black text-[#DB2777] font-heading">100%</div>
                  <div className="text-[10px] font-bold text-[#635F69] uppercase tracking-wide">Doctor Led</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-sky-500/10 to-cyan-500/10 border border-sky-200/50 text-center shadow-clayPill">
                  <div className="text-xl sm:text-2xl font-black text-[#0EA5E9] font-heading">0₹</div>
                  <div className="text-[10px] font-bold text-[#635F69] uppercase tracking-wide">Software Cost</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* High-Fidelity Bento Grid Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-block clay-pill bg-violet-100 text-[#7C3AED] text-xs font-black uppercase font-heading">
            Zero Software Cost Public Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#332F3A] tracking-tight font-heading">
            Engineering for India's Primary Care Realities
          </h2>
          <p className="text-base sm:text-lg text-[#635F69] font-medium leading-relaxed font-body">
            Every layer embraces physical tangibility, deterministic safety, and zero commercial vendor lock-in.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Bento Card 1 */}
          <div className="clay-card rounded-[32px] p-8 space-y-4 hover:scale-[1.02]">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white shadow-clayOrb mb-4">
              <Globe2 className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black text-[#332F3A] font-heading">
              13 Indian Languages
            </h3>
            <p className="text-sm text-[#635F69] font-medium leading-relaxed font-body">
              Honest speech and vernacular text recognition across Hindi, Odia, Bengali, Telugu, Tamil, Marathi, and more. Transparent fallback ensures users are never trapped in failed audio prompts.
            </p>
            <div className="pt-2">
              <span className="clay-pill bg-blue-500/15 text-blue-900 text-xs">
                Zero Cloud STT Fees
              </span>
            </div>
          </div>

          {/* Bento Card 2 */}
          <div className="clay-card rounded-[32px] p-8 space-y-4 hover:scale-[1.02]">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white shadow-clayOrb mb-4">
              <Cpu className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black text-[#332F3A] font-heading">
              Deterministic Urgency Rules
            </h3>
            <p className="text-sm text-[#635F69] font-medium leading-relaxed font-body">
              Emergency escalation cannot be trusted to unpredictable generative AI hallucination. Hard-coded, audit-trailed clinical rules flag red-flag symptoms with mathematically predictable precision.
            </p>
            <div className="pt-2">
              <span className="clay-pill bg-purple-500/15 text-purple-900 text-xs">
                Audited Clinical Safety
              </span>
            </div>
          </div>

          {/* Bento Card 3 */}
          <div className="clay-card rounded-[32px] p-8 space-y-4 hover:scale-[1.02]">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white shadow-clayOrb mb-4">
              <FileCheck2 className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black text-[#332F3A] font-heading">
              In-Browser Optical Character Recognition
            </h3>
            <p className="text-sm text-[#635F69] font-medium leading-relaxed font-body">
              Client-side Tesseract.js processes blood work, CBC results, and doctor prescriptions entirely on the local device without sending sensitive medical scans to third-party image hosts.
            </p>
            <div className="pt-2">
              <span className="clay-pill bg-pink-500/15 text-pink-900 text-xs">
                Client-Side Privacy
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Sticky Squish CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-[40px] sm:rounded-[48px] bg-gradient-to-br from-[#8B5CF6]/20 via-[#EC4899]/15 to-[#0EA5E9]/20 backdrop-blur-2xl border border-white p-8 sm:p-12 shadow-clayCard flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-3xl sm:text-4xl font-black text-[#332F3A] font-heading">
              Ready to experience modern clinical triage?
            </h3>
            <p className="text-base text-[#635F69] font-medium max-w-xl font-body">
              Start an intake as a patient or inspect live clinical triage queues with interactive AI clarification.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <Link
              to="/patient"
              className="clay-btn-primary px-8 py-4 h-16 text-base text-center"
            >
              Intake Workflow
            </Link>
            <Link
              to="/status"
              className="clay-btn-secondary px-8 py-4 h-16 text-base text-center"
            >
              Check Case Status
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
