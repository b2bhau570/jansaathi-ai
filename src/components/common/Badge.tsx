// JANSAATHI AI - Standardized Status, Priority, and Source Badges
// Uses WCAG-compliant high-contrast styling with zero emojis

import React from 'react';
import { PriorityLevel, CaseStatus, SourceType } from '../../types';
import { AlertTriangle, AlertCircle, Clock, CheckCircle2, FileText, Mic, Activity, User, Shield } from 'lucide-react';

export const PriorityBadge: React.FC<{ priority: PriorityLevel }> = ({ priority }) => {
  switch (priority) {
    case 'URGENT_REVIEW':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
          <AlertCircle className="w-3.5 h-3.5 text-red-700" aria-hidden="true" />
          URGENT REVIEW
        </span>
      );
    case 'PRIORITY_REVIEW':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />
          PRIORITY REVIEW
        </span>
      );
    case 'ROUTINE_REVIEW':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-900 border border-blue-300">
          <Clock className="w-3.5 h-3.5 text-blue-700" aria-hidden="true" />
          ROUTINE REVIEW
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300">
          UNCLASSIFIED
        </span>
      );
  }
};

export const StatusBadge: React.FC<{ status: CaseStatus }> = ({ status }) => {
  switch (status) {
    case 'READY_FOR_REVIEW':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" aria-hidden="true" />
          Ready For Review
        </span>
      );
    case 'UNDER_REVIEW':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-800 border border-indigo-300">
          <Clock className="w-3 h-3 text-indigo-600" aria-hidden="true" />
          Under Review
        </span>
      );
    case 'ESCALATED':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-800 border border-red-300">
          <AlertCircle className="w-3 h-3 text-red-600" aria-hidden="true" />
          Escalated
        </span>
      );
    case 'REFERRED':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-800 border border-purple-300">
          <Shield className="w-3 h-3 text-purple-600" aria-hidden="true" />
          Referred
        </span>
      );
    case 'COMPLETED':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 border border-slate-300">
          <CheckCircle2 className="w-3 h-3 text-slate-600" aria-hidden="true" />
          Completed
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300">
          {status}
        </span>
      );
  }
};

export const SourceBadge: React.FC<{ source: SourceType }> = ({ source }) => {
  switch (source) {
    case 'PATIENT_VOICE':
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-teal-50 text-teal-800 border border-teal-200">
          <Mic className="w-3 h-3 text-teal-600" />
          Patient Voice
        </span>
      );
    case 'PATIENT_TEXT':
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200">
          <FileText className="w-3 h-3 text-slate-600" />
          Patient Text
        </span>
      );
    case 'REPORT_OCR':
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-cyan-50 text-cyan-800 border border-cyan-200">
          <FileText className="w-3 h-3 text-cyan-600" />
          Report OCR
        </span>
      );
    case 'HARDWARE_READING':
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
          <Activity className="w-3 h-3 text-emerald-600" />
          Hardware Telemetry
        </span>
      );
    case 'CLINICIAN_ENTRY':
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
          <User className="w-3 h-3 text-amber-600" />
          Clinician Entry
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
          {source}
        </span>
      );
  }
};
