// JANSAATHI AI - High-Fidelity Claymorphism Clinical Operations Dashboard
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
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <ClinicalDisclaimer />

        {/* Dashboard Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#332F3A] tracking-tight font-heading">
              Clinical Triage Operations Dashboard
            </h1>
            <p className="text-xs font-semibold text-[#635F69] mt-0.5">
              Live facility triage metrics &bull; Real-time database queries &bull; Zero synthetic filler
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/cases"
              className="clay-btn-primary text-xs px-6 py-2.5 h-12 rounded-[20px]"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Open Triage Queue</span>
            </Link>
          </div>
        </div>

        {/* Metrics Grid with Clay Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {/* Awaiting Review */}
          <div className="clay-card rounded-[28px] p-5 sm:p-6 hover:-translate-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-[#635F69] font-heading">
              <span>Awaiting Review</span>
              <Clock className="w-4 h-4 text-[#7C3AED]" />
            </div>
            <div className="mt-3 text-3xl font-black text-[#332F3A] font-heading">
              {loading ? '...' : pendingCount}
            </div>
            <div className="text-[11px] text-[#635F69] font-medium mt-1">Pending doctor attention</div>
          </div>

          {/* Urgent Flags */}
          <div className="clay-card rounded-[28px] p-5 sm:p-6 hover:-translate-y-1 border-rose-300/80 bg-rose-500/10">
            <div className="flex items-center justify-between text-xs font-black text-rose-700 font-heading">
              <span>Urgent Signals</span>
              <AlertCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="mt-3 text-3xl font-black text-rose-900 font-heading">
              {loading ? '...' : urgentCount}
            </div>
            <div className="text-[11px] text-rose-700 font-bold mt-1">Predefined red flags</div>
          </div>

          {/* Under Review */}
          <div className="clay-card rounded-[28px] p-5 sm:p-6 hover:-translate-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-[#635F69] font-heading">
              <span>Under Review</span>
              <Activity className="w-4 h-4 text-[#0EA5E9]" />
            </div>
            <div className="mt-3 text-3xl font-black text-[#0EA5E9] font-heading">
              {loading ? '...' : underReviewCount}
            </div>
            <div className="text-[11px] text-[#635F69] font-medium mt-1">Currently evaluating</div>
          </div>

          {/* Completed */}
          <div className="clay-card rounded-[28px] p-5 sm:p-6 hover:-translate-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-[#635F69] font-heading">
              <span>Completed</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-3 text-3xl font-black text-emerald-700 font-heading">
              {loading ? '...' : completedCount}
            </div>
            <div className="text-[11px] text-[#635F69] font-medium mt-1">Clinical notes closed</div>
          </div>

          {/* Referrals */}
          <div className="clay-card rounded-[28px] p-5 sm:p-6 hover:-translate-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-[#635F69] font-heading">
              <span>Referred</span>
              <FileText className="w-4 h-4 text-[#DB2777]" />
            </div>
            <div className="mt-3 text-3xl font-black text-[#DB2777] font-heading">
              {loading ? '...' : referralCount}
            </div>
            <div className="text-[11px] text-[#635F69] font-medium mt-1">Dispatched to hospital</div>
          </div>
        </div>

        {/* Urgent Cases Table Box */}
        {urgentCases.length > 0 && (
          <div className="clay-card rounded-[32px] p-7 border-rose-300/80 bg-rose-500/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-black text-rose-950 uppercase tracking-wide font-heading">
                  High-Priority Emergency Reviews ({urgentCases.length})
                </h3>
              </div>
              <Link to="/cases" className="clay-pill bg-white text-rose-900 text-xs font-bold">
                View All in Queue &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {urgentCases.map((c) => (
                <Link
                  key={c.id}
                  to={`/cases/${c.id}`}
                  className="p-4 rounded-[22px] bg-white/95 shadow-clayPill hover:-translate-y-1 transition-all block border border-white"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-black text-[#7C3AED] text-sm">{c.case_number}</span>
                    <PriorityBadge priority={c.priority_level} />
                  </div>
                  <p className="font-bold text-xs text-[#332F3A] truncate font-heading">
                    {c.primary_concern || 'Unspecified complaint'}
                  </p>
                  <div className="text-[11px] text-[#635F69] mt-2 flex items-center justify-between font-medium">
                    <span>{new Date(c.created_at).toLocaleTimeString()}</span>
                    <span className="text-[#7C3AED] font-bold">Review &rarr;</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
