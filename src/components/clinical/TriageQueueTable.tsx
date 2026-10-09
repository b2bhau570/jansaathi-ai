// JANSAATHI AI - High-Fidelity Claymorphism Clinical Triage Queue Table
// Dense clinical workstation queue with search, filtering, and priority sorting. Zero fake data.

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TriageCase, PriorityLevel } from '../../types';
import { PriorityBadge, StatusBadge } from '../common/Badge';
import { Search, Filter, Clock, Globe, ArrowRight, Activity, FileText, ShieldCheck } from 'lucide-react';

interface TriageQueueTableProps {
  cases: TriageCase[];
  onSelectCase?: (id: string) => void;
}

export const TriageQueueTable: React.FC<TriageQueueTableProps> = ({ cases }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'PRIORITY' | 'NEWEST' | 'OLDEST'>('PRIORITY');

  // Filter & Search
  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.case_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.primary_concern || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.input_language.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority = priorityFilter === 'ALL' || c.priority_level === priorityFilter;
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  // Sort
  const sortedCases = [...filteredCases].sort((a, b) => {
    if (sortBy === 'PRIORITY') {
      const priorityOrder: Record<PriorityLevel, number> = {
        URGENT_REVIEW: 1,
        PRIORITY_REVIEW: 2,
        ROUTINE_REVIEW: 3,
        UNCLASSIFIED: 4,
      };
      const diff = priorityOrder[a.priority_level] - priorityOrder[b.priority_level];
      if (diff !== 0) return diff;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (sortBy === 'NEWEST') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  return (
    <div className="clay-card-static rounded-[36px] p-0 overflow-hidden shadow-clayCard bg-white/85">
      {/* Statutory Audit Lock & Anti-Deletion Notice in Recessed Bar */}
      <div className="bg-[#EFEBF5] px-6 py-3 border-b border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-[#635F69] font-medium shadow-clayPressed">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#7C3AED] shrink-0" />
          <span>Protected Clinical Queue: Under medical audit standards, triage cases cannot be deleted or purged by facility staff.</span>
        </div>
        <span className="font-mono text-[#7C3AED] font-black shrink-0">{filteredCases.length} Active Records</span>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-5 sm:p-6 bg-white/60 border-b border-purple-100 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#7C3AED] absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search by Case ID, symptom..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="clay-input rounded-2xl pl-10 pr-4 py-2.5 text-xs"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#635F69] font-heading">
            <Filter className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>Priority:</span>
          </div>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="clay-input rounded-xl px-3 py-1.5 text-xs w-auto font-bold cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT_REVIEW">Urgent Review</option>
            <option value="PRIORITY_REVIEW">Priority Review</option>
            <option value="ROUTINE_REVIEW">Routine Review</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="clay-input rounded-xl px-3 py-1.5 text-xs w-auto font-bold cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="READY_FOR_REVIEW">Ready For Review</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="ESCALATED">Escalated</option>
            <option value="REFERRED">Referred</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="clay-input rounded-xl px-3 py-1.5 text-xs w-auto font-bold cursor-pointer"
          >
            <option value="PRIORITY">Sort: Priority Signals</option>
            <option value="NEWEST">Sort: Newest Arrival</option>
            <option value="OLDEST">Sort: Waiting Longest</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      {sortedCases.length === 0 ? (
        <div className="p-14 text-center">
          <Clock className="w-12 h-12 text-purple-300 mx-auto mb-3" />
          <h4 className="text-base font-black text-[#332F3A] font-heading">No cases currently require review.</h4>
          <p className="text-xs text-[#635F69] font-medium mt-1 max-w-sm mx-auto">
            {cases.length === 0
              ? 'The triage queue is clear. New cases will appear immediately as patients submit statements via the intake portal.'
              : 'No cases match the selected filter criteria.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-purple-100 text-xs">
            <thead className="bg-[#FAF8FD] text-[#635F69] font-black uppercase tracking-wider text-[11px] font-heading">
              <tr>
                <th className="px-5 py-3.5 text-left">Case ID</th>
                <th className="px-5 py-3.5 text-left">Priority Flag</th>
                <th className="px-5 py-3.5 text-left">Presenting Concern</th>
                <th className="px-5 py-3.5 text-left">Language</th>
                <th className="px-5 py-3.5 text-left">Inputs</th>
                <th className="px-5 py-3.5 text-left">Status</th>
                <th className="px-5 py-3.5 text-left">Arrival Time</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50 bg-white/70">
              {sortedCases.map((c) => (
                <tr key={c.id} className="hover:bg-violet-50/60 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-black text-[#7C3AED] whitespace-nowrap">
                    <Link to={`/cases/${c.id}`} className="hover:underline">
                      {c.case_number}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <PriorityBadge priority={c.priority_level} />
                  </td>
                  <td className="px-5 py-3.5 text-[#332F3A] max-w-xs truncate font-bold font-heading">
                    {c.primary_concern || 'Unspecified complaint'}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-[#635F69]">
                    <span className="clay-pill bg-[#EFEBF5] text-[#332F3A] text-[10px] uppercase font-mono">
                      <Globe className="w-3 h-3 text-[#7C3AED]" />
                      {c.input_language}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-[#635F69]">
                    <div className="flex items-center gap-1.5 font-medium">
                      {c.hardware_readings && c.hardware_readings.length > 0 && (
                        <span title="Telemetry Recorded"><Activity className="w-3.5 h-3.5 text-emerald-600" /></span>
                      )}
                      {c.reports && c.reports.length > 0 && (
                        <span title="Report Attached"><FileText className="w-3.5 h-3.5 text-cyan-600" /></span>
                      )}
                      <span className="text-[11px]">
                        {c.inputs?.map((i) => i.input_type).join(', ') || 'Direct'}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-[#635F69] font-mono text-[11px] font-bold">
                    {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <Link
                      to={`/cases/${c.id}`}
                      className="clay-btn-primary text-xs px-4 py-1.5 min-h-[34px] rounded-[16px]"
                    >
                      <span>Review</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
