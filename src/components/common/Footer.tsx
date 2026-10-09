// JANSAATHI AI - High-Fidelity Claymorphism Footer
// Rounded-[40px] floating clay container with WCAG-compliant charcoal & dark lavender typography

import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Activity, Accessibility } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto rounded-[36px] sm:rounded-[44px] bg-white/75 backdrop-blur-2xl border border-white/90 shadow-clayCard p-8 sm:p-10 text-[#635F69] text-xs">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Identity & Mission */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2.5 text-[#332F3A] font-black text-base tracking-tight font-heading">
              <span className="w-3.5 h-3.5 bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] rounded-full shadow-clayPill"></span>
              <span>JANSAATHI AI</span>
            </div>
            <p className="text-[#635F69] text-xs leading-relaxed font-medium">
              Human-in-the-loop multilingual triage assistant for Primary Health Centres. Transforms audio, vernacular text, and lab records into structured clinical reviews.
            </p>
            <div className="inline-block clay-pill bg-purple-100/70 text-[#7C3AED] text-[10px] font-bold">
              High-Fidelity Clay Edition v2.0
            </div>
          </div>

          {/* Privacy & Governance */}
          <div className="space-y-3">
            <h4 className="text-[#332F3A] font-black uppercase tracking-wider text-xs font-heading">
              Safety & Governance
            </h4>
            <ul className="space-y-2 text-[#635F69] font-medium">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#7C3AED]" />
                <span>Deterministic Urgency Rules</span>
              </li>
              <li className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#DB2777]" />
                <span>Anonymous Case IDs (No Aadhaar)</span>
              </li>
              <li className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#0EA5E9]" />
                <span>Multi-Source Provenance Tracking</span>
              </li>
              <li className="flex items-center gap-2">
                <Accessibility className="w-4 h-4 text-[#10B981]" />
                <span>WCAG 2.2 AA Contrast Principles</span>
              </li>
            </ul>
          </div>

          {/* Compliance & Legal Links */}
          <div className="space-y-3">
            <h4 className="text-[#332F3A] font-black uppercase tracking-wider text-xs font-heading">
              Documentation & Legal
            </h4>
            <ul className="space-y-2 font-medium">
              <li>
                <Link to="/privacy" className="hover:text-[#7C3AED] transition-colors">
                  Privacy Policy & Data Minimisation
                </Link>
              </li>
              <li>
                <Link to="/security" className="hover:text-[#7C3AED] transition-colors">
                  Security Architecture & RLS
                </Link>
              </li>
              <li>
                <Link to="/accessibility" className="hover:text-[#7C3AED] transition-colors">
                  Accessibility Statement
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-[#7C3AED] transition-colors">
                  Terms of Clinical Use
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#7C3AED] transition-colors">
                  Technical Support & Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Clinical Disclaimer */}
          <div className="space-y-2.5 bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-5 rounded-[24px] border border-amber-300/60 shadow-clayPill">
            <h4 className="text-amber-900 font-black uppercase tracking-wider text-xs font-heading">
              Mandatory Clinical Notice
            </h4>
            <p className="text-[#332F3A] text-xs leading-relaxed font-medium">
              JANSAATHI AI is an administrative and triage information organizer. It never issues autonomous diagnoses or prescriptions. Qualified clinicians retain final decision authority.
            </p>
          </div>
        </div>

        <div className="border-t border-purple-100/80 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-[#635F69] text-xs font-medium">
          <div>
            &copy; 2026 JANSAATHI AI. Digital Clay Healthcare Design System.
          </div>
          <div className="mt-2 sm:mt-0 space-x-3">
            <span>Deterministic Clinical Safety</span>
            <span>&bull;</span>
            <span>Zero Data Brokerage</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
