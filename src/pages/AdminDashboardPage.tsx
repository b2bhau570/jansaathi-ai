// JANSAATHI AI - Administrative Control Center (/admin)
// Manages health facilities, deterministic urgency rules, retention schedules, and provider configs.

import React, { useState } from 'react';
import { SYSTEM_URGENCY_RULES } from '../services/urgency/DeterministicUrgencyEngine';
import { ClinicalDisclaimer } from '../components/common/ClinicalDisclaimer';
import { Shield, Building2, Sliders, CheckCircle2, Lock } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'RULES' | 'FACILITIES' | 'SETTINGS'>('RULES');

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ClinicalDisclaimer />

        <div className="my-6">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-teal-800" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Administrative & Governance Console
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            System configuration &bull; Deterministic urgency rule management &bull; Facility registry
          </p>
        </div>

        {/* Tab Navigator */}
        <div className="flex border-b border-slate-200 mb-6 space-x-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('RULES')}
            className={`pb-2.5 transition-colors border-b-2 ${
              activeTab === 'RULES'
                ? 'border-teal-800 text-teal-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Urgency Rule Registry ({SYSTEM_URGENCY_RULES.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('FACILITIES')}
            className={`pb-2.5 transition-colors border-b-2 ${
              activeTab === 'FACILITIES'
                ? 'border-teal-800 text-teal-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Registered Facilities
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SETTINGS')}
            className={`pb-2.5 transition-colors border-b-2 ${
              activeTab === 'SETTINGS'
                ? 'border-teal-800 text-teal-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            System Settings & Retention
          </button>
        </div>

        {/* TAB 1: Urgency Rules */}
        {activeTab === 'RULES' && (
          <div className="space-y-4">
            <div className="p-4 bg-white rounded border border-slate-300 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Deterministic Clinical Urgency Rules
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Predefined safety criteria evaluated against patient-reported signals. LLMs are strictly forbidden from modifying or bypassing these rules.
                </p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-xs font-semibold">
                Version Controlled
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SYSTEM_URGENCY_RULES.map((rule) => (
                <div key={rule.id} className="p-4 bg-white rounded border border-slate-300 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-teal-900">{rule.rule_code}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        rule.priority === 'URGENT_REVIEW'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {rule.priority}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{rule.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{rule.description}</p>

                  <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-700">
                    <strong>Clinical Rationale:</strong> {rule.rationale}
                  </div>

                  <div className="flex items-center justify-between pt-2 text-[10px] text-slate-400 font-mono">
                    <span>Engine Version: {rule.version}</span>
                    <span className="text-emerald-700 font-medium">Status: Active</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Facilities */}
        {activeTab === 'FACILITIES' && (
          <div className="bg-white rounded border border-slate-300 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Registered Public Health Units & Clinics
            </h2>
            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">District Community Health Centre #4</div>
                  <div className="text-slate-500">Facility Type: COMMUNITY_HEALTH_CENTRE &bull; District: Khordha, State: Odisha</div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-[10px]">
                  Operational
                </span>
              </div>
              <div className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Primary Health Centre (PHC) Chandaka</div>
                  <div className="text-slate-500">Facility Type: PRIMARY_HEALTH_CENTRE &bull; District: Khordha, State: Odisha</div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-[10px]">
                  Operational
                </span>
              </div>
              <div className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Industrial Health Unit - Estate Phase 2</div>
                  <div className="text-slate-500">Facility Type: OCCUPATIONAL_HEALTH_UNIT &bull; District: Angul, State: Odisha</div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-[10px]">
                  Operational
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Settings */}
        {activeTab === 'SETTINGS' && (
          <div className="bg-white rounded border border-slate-300 p-6 shadow-xs space-y-4 text-xs">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              System Parameters & Data Retention
            </h2>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Patient Intake Data Retention:</span>
                  <span className="text-slate-500">Completed triage intake records retain structured summary for clinical review.</span>
                </div>
                <span className="font-mono font-semibold text-slate-800">30 Days</span>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Immutable Security Audit Retention:</span>
                  <span className="text-slate-500">Clinical event and access logs preserved for clinical governance and accountability.</span>
                </div>
                <span className="font-mono font-semibold text-slate-800">Permanent (Append-Only)</span>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">AI Information Organizer Provider:</span>
                  <span className="text-slate-500">Configured provider with schema validation and diagnostic prevention guardrails.</span>
                </div>
                <span className="font-mono font-semibold text-teal-800">Gemini Flash / Deterministic Fallback</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
