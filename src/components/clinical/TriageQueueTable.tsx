// JANSAATHI AI - Clinical Triage Queue Table
// Dense clinical workstation queue with search, filtering, and priority sorting. Zero fake data.

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TriageCase, PriorityLevel, CaseStatus } from '../../types';
import { PriorityBadge, StatusBadge } from '../common/Badge';
import { Search, Filter, Clock, Globe, ArrowRight, Activity, FileText } from 'lucide-react';

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
    <div className="bg-white rounded border border-slate-300 shadow-xs overflow-hidden">
      {/* Search & Filter Toolbar */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Case ID, symptom..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs text-slate-900 focus:ring-1 focus:ring-teal-700 bg-white"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5" />
            <span>Priority:</span>
          </div>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border border-slate-300 rounded px-2.5 py-1 text-xs bg-white text-slate-800"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT_REVIEW">Urgent Review</option>
            <option value="PRIORITY_REVIEW">Priority Review</option>
            <option value="ROUTINE_REVIEW">Routine Review</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-300 rounded px-2.5 py-1 text-xs bg-white text-slate-800"
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
            className="border border-slate-300 rounded px-2.5 py-1 text-xs bg-white text-slate-800 font-medium"
          >
            <option value="PRIORITY">Sort: Priority Signals</option>
            <option value="NEWEST">Sort: Newest Arrival</option>
            <option value="OLDEST">Sort: Waiting Longest</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      {sortedCases.length === 0 ? (
        <div className="p-12 text-center">
          <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-slate-800">No cases currently require review.</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {cases.length === 0
              ? 'The triage queue is clear. New cases will appear immediately as patients submit statements via the intake portal.'
              : 'No cases match the selected filter criteria.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-100/70 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3 text-left">Case ID</th>
                <th className="px-4 py-3 text-left">Priority Flag</th>
                <th className="px-4 py-3 text-left">Presenting Concern</th>
                <th className="px-4 py-3 text-left">Language</th>
                <th className="px-4 py-3 text-left">Inputs</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Arrival Time</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {sortedCases.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                    <Link to={`/cases/${c.id}`} className="hover:text-teal-700">
                      {c.case_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <PriorityBadge priority={c.priority_level} />
                  </td>
                  <td className="px-4 py-3 text-slate-900 max-w-xs truncate font-medium">
                    {c.primary_concern || 'Unspecified complaint'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                    <span className="inline-flex items-center gap-1 uppercase text-[11px] font-mono px-1.5 py-0.5 bg-slate-100 rounded">
                      <Globe className="w-3 h-3 text-slate-400" />
                      {c.input_language}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                    <div className="flex items-center gap-1.5">
                      {c.hardware_readings && c.hardware_readings.length > 0 && (
                        <span title="Telemetry Recorded"><Activity className="w-3.5 h-3.5 text-emerald-600" /></span>
                      )}
                      {c.reports && c.reports.length > 0 && (
                        <span title="Report Attached"><FileText className="w-3.5 h-3.5 text-cyan-600" /></span>
                      )}
                      <span className="text-[11px] text-slate-600">
                        {c.inputs?.map((i) => i.input_type).join(', ') || 'Direct'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                    {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link
                      to={`/cases/${c.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-800 hover:bg-teal-700 text-white rounded text-xs font-semibold transition-colors"
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
