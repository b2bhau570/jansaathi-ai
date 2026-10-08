// JANSAATHI AI - Professional Healthcare Footer
// Includes privacy principles, clinical boundaries, and regulatory compliance disclosures

import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Activity, Accessibility } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Identity & Mission */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2 text-white font-bold text-sm tracking-wide">
              <span className="w-2.5 h-2.5 bg-teal-500 rounded-full"></span>
              <span>JANSAATHI AI</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Production-ready human-in-the-loop multilingual triage assistant. Structured information synthesis for qualified clinicians.
            </p>
            <div className="text-[11px] text-slate-500 font-mono">
              System Architecture: v1.0.0-PROD
            </div>
          </div>

          {/* Privacy & Governance */}
          <div className="space-y-2">
            <h4 className="text-slate-200 font-semibold uppercase tracking-wider text-[11px]">
              Safety & Governance
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>Deterministic Urgency Rules</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-teal-400" />
                <span>Anonymous Case IDs (No Aadhaar)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-teal-400" />
                <span>Multi-Source Provenance Tracking</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Accessibility className="w-3.5 h-3.5 text-teal-400" />
                <span>WCAG 2.2 AA Principles</span>
              </li>
            </ul>
          </div>

          {/* Compliance & Legal Links */}
          <div className="space-y-2">
            <h4 className="text-slate-200 font-semibold uppercase tracking-wider text-[11px]">
              Documentation & Legal
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link to="/privacy" className="hover:text-teal-400 transition-colors">
                  Privacy Policy & Data Minimisation
                </Link>
              </li>
              <li>
                <Link to="/security" className="hover:text-teal-400 transition-colors">
                  Security Architecture & RLS
                </Link>
              </li>
              <li>
                <Link to="/accessibility" className="hover:text-teal-400 transition-colors">
                  Accessibility Statement
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-teal-400 transition-colors">
                  Terms of Clinical Use
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-teal-400 transition-colors">
                  Technical Support & Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Clinical Disclaimer */}
          <div className="space-y-2 bg-slate-900/60 p-3.5 rounded border border-slate-800">
            <h4 className="text-amber-400 font-semibold uppercase tracking-wider text-[11px]">
              Mandatory Clinical Notice
            </h4>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              JANSAATHI AI is an administrative and triage information organizer. It never issues diagnoses, prescriptions, treatment regimens, or autonomous clinical decisions. A qualified healthcare professional retains complete responsibility.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800/80 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-slate-400 text-[11px]">
          <div>
            &copy; 2026 JANSAATHI AI Project. Public Health Infrastructure System.
          </div>
          <div className="mt-2 sm:mt-0 space-x-4">
            <span>Free / Open-Source Architecture</span>
            <span>&bull;</span>
            <span>Zero Software Cost Design</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
