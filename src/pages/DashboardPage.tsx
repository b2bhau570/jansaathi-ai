// JANSAATHI AI - Clinical Operations Dashboard
// Live metrics queried directly from Supabase / CaseService. Zero hardcoded stats.

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CaseService } from '../services/supabase/CaseService';
import { TriageCase } from '../types';
import { PriorityBadge } from '../components/common/Badge';
import { ClinicalDisclaimer } from '../components/common/ClinicalDisclaimer';
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  FileText,
  Activity,
  ArrowRight,
  TrendingUp,
  Stethoscope,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [cases, setCases] = useState<TriageCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    CaseService.getAllCases().then((data) => {
      setCases(data);
      setLoading(false);
    });
  }, []);

  // Compute live metrics strictly from data
  const totalCases = cases.length;
  const pendingCount = cases.filter(
    (c) => c.status === 'READY_FOR_REVIEW' || c.status === 'NEW'
  ).length;
  const urgentCount = cases.filter(
    (c) => c.priority_level === 'URGENT_REVIEW' && c.status !== 'COMPLETED'
  ).length;
  const underReviewCount = cases.filter((c) => c.status === 'UNDER_REVIEW').length;
  const completedCount = cases.filter((c) => c.status === 'COMPLETED').length;
  const referralCount = cases.filter((c) => c.status === 'REFERRED').length;

  const urgentCases = cases
    .filter((c) => c.priority_level === 'URGENT_REVIEW' && c.status !== 'COMPLETED')
    .slice(0, 5);

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ClinicalDisclaimer />

        {/* Dashboard Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 my-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Clinical Triage Operations Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live facility triage metrics &bull; Real-time database queries &bull; Zero synthetic filler
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/cases"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-800 hover:bg-teal-700 text-white rounded text-xs font-semibold shadow-xs transition-colors"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Open Triage Queue</span>
            </Link>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {/* Awaiting Review */}
          <div className="p-4 bg-white rounded border border-slate-300 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Awaiting Review</span>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {loading ? '...' : pendingCount}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Pending doctor attention</div>
          </div>

          {/* Urgent Flags */}
          <div className="p-4 bg-white rounded border border-red-300 shadow-2xs">
            <div className="flex items-center justify-between text-red-700 text-xs font-bold">
              <span>Urgent Signals</span>
              <AlertCircle className="w-4 h-4 text-red-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-red-900">
              {loading ? '...' : urgentCount}
            </div>
            <div className="text-[10px] text-red-700 mt-1">Predefined red flags</div>
          </div>

          {/* Under Review */}
          <div className="p-4 bg-white rounded border border-slate-300 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Under Review</span>
              <Activity className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {loading ? '...' : underReviewCount}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Currently open by clinician</div>
          </div>

          {/* Completed */}
          <div className="p-4 bg-white rounded border border-slate-300 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Completed</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {loading ? '...' : completedCount}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Fully assessed cases</div>
          </div>

          {/* Referrals */}
          <div className="p-4 bg-white rounded border border-slate-300 shadow-2xs col-span-2 md:col-span-1">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Referrals Sent</span>
              <FileText className="w-4 h-4 text-purple-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {loading ? '...' : referralCount}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Authorized hospital transfers</div>
          </div>
        </div>

        {/* Priority Attention List / Empty State */}
        <div className="bg-white rounded border border-slate-300 p-6 shadow-xs mb-8">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Immediate Urgent-Review Queue ({urgentCases.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Cases flagged with deterministic clinical signals requiring priority doctor review
              </p>
            </div>
            <Link
              to="/cases"
              className="text-xs font-semibold text-teal-800 hover:text-teal-900 flex items-center gap-1"
            >
              <span>View Full Queue ({totalCases})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-500">Querying live database records...</div>
          ) : urgentCases.length === 0 ? (
            <div className="py-12 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-slate-800">
                No active urgent-review signals pending.
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No cases currently match acute emergency criteria (chest pain, respiratory distress, shock, stroke signs).
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 mt-2">
              {urgentCases.map((c) => (
                <div key={c.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-xs">{c.case_number}</span>
                      <PriorityBadge priority={c.priority_level} />
                      <span className="text-[11px] text-slate-500">
                        Arrival: {new Date(c.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-xs text-slate-800 font-medium mt-1">
                      {c.primary_concern || 'Unspecified complaint'}
                    </div>
                  </div>

                  <Link
                    to={`/cases/${c.id}`}
                    className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded text-xs font-semibold shrink-0"
                  >
                    Immediate Review
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
