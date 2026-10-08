// JANSAATHI AI - Accessibility Statement Page
// Documents WCAG 2.2 AA target standards and implementation details

import React from 'react';
import { ClinicalDisclaimer } from '../components/common/ClinicalDisclaimer';
import { Accessibility, CheckCircle2 } from 'lucide-react';

export const AccessibilityPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <ClinicalDisclaimer />

        <div className="bg-white rounded border border-slate-300 p-8 shadow-xs mt-6 space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2">
              <Accessibility className="w-6 h-6 text-teal-800" />
              <h1 className="text-2xl font-bold text-slate-900">Accessibility Statement</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Target Standard: WCAG 2.2 Level AA &bull; Inclusive Public Health Design
            </p>
          </div>

          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <p>
              JANSAATHI AI is engineered for diverse public health environments across India, serving individuals across linguistic backgrounds, varying digital literacy, and varying assistive device requirements.
            </p>

            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide pt-2">
              Key Accessible Engineering Implementations:
            </h3>

            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5 p-3 bg-slate-50 rounded border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900">High Contrast Focus Indicators:</strong>
                  <p className="text-slate-600">
                    Keyboard navigation elements carry explicit 2px contrast outline rings (<code className="font-mono">focus-visible: outline-2</code>) to support non-mouse users.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 bg-slate-50 rounded border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900">Multilingual Font Legibility:</strong>
                  <p className="text-slate-600">
                    System font stacks preserve clean glyph rendering across Devanagari, Odia, Bengali, Telugu, Tamil, and other Indic scripts.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 bg-slate-50 rounded border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900">No Information Conveyed Solely by Color:</strong>
                  <p className="text-slate-600">
                    All urgency, status, and provenance badges include explicit text labels and SVG icons in addition to color variations.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 bg-slate-50 rounded border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900">Reduced Motion Support:</strong>
                  <p className="text-slate-600">
                    Complies with the <code className="font-mono">prefers-reduced-motion</code> media query to deactivate non-essential UI animations for vestibular safety.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
