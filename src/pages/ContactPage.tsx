// JANSAATHI AI - Contact & Support Page
// Clear channels for technical integration, clinical feedback, and emergency guidance

import React from 'react';
import { ClinicalDisclaimer } from '../components/common/ClinicalDisclaimer';
import { Mail, PhoneCall, ShieldAlert, Building2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <ClinicalDisclaimer />

        <div className="bg-white rounded border border-slate-300 p-8 shadow-xs mt-6 space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h1 className="text-2xl font-bold text-slate-900">Technical Support & Clinical Feedback</h1>
            <p className="text-xs text-slate-500 mt-1">
              Public Health Deployment Engineering &bull; Hospital Administration Assistance
            </p>
          </div>

          <div className="p-4 bg-red-50 border border-red-200 rounded text-xs text-red-950 flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-red-900 mb-0.5">Emergency Medical Notice:</strong>
              <span>
                JANSAATHI AI is an administrative and triage support tool. If you or a patient is experiencing an acute life-threatening medical emergency, call <strong>108 / 112</strong> or proceed directly to the nearest hospital emergency room immediately.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
            <div className="p-4 bg-slate-50 rounded border border-slate-200 space-y-2">
              <Mail className="w-5 h-5 text-teal-700" />
              <h3 className="font-bold text-slate-900 text-sm">Clinical System Queries</h3>
              <p className="text-slate-600">
                For queries regarding triage schema configuration, deterministic rule customization, or facility deployment:
              </p>
              <div className="font-mono text-teal-900 font-semibold pt-1">
                support@jansaathi.gov.in
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded border border-slate-200 space-y-2">
              <Building2 className="w-5 h-5 text-teal-700" />
              <h3 className="font-bold text-slate-900 text-sm">Facility Administration</h3>
              <p className="text-slate-600">
                Primary Health Centre administrators and medical superintendents seeking telemetry gateway setup:
              </p>
              <div className="font-mono text-teal-900 font-semibold pt-1">
                admin-ops@jansaathi.gov.in
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
