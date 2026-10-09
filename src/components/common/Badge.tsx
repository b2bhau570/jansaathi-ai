// JANSAATHI AI - High-Fidelity Claymorphism Badges & Pills
// Rounded-full, tactile clay depth, WCAG AA contrast

import React from 'react';
import { PriorityLevel, CaseStatus, SourceType } from '../../types';
import { AlertTriangle, AlertCircle, Clock, CheckCircle2, FileText, Mic, Activity, User, Shield } from 'lucide-react';

export const PriorityBadge: React.FC<{ priority: PriorityLevel }> = ({ priority }) => {
  switch (priority) {
    case 'URGENT_REVIEW':
      return (
        <span className="clay-pill bg-rose-500/15 text-rose-800 border border-rose-300/80">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600" aria-hidden="true" />
          URGENT REVIEW
        </span>
      );
    case 'PRIORITY_REVIEW':
      return (
        <span className="clay-pill bg-amber-500/15 text-amber-900 border border-amber-300/80">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />
          PRIORITY REVIEW
        </span>
      );
    case 'ROUTINE_REVIEW':
      return (
        <span className="clay-pill bg-sky-500/15 text-sky-900 border border-sky-300/80">
          <Clock className="w-3.5 h-3.5 text-sky-700" aria-hidden="true" />
          ROUTINE REVIEW
        </span>
      );
    default:
      return (
        <span className="clay-pill bg-slate-200/60 text-[#332F3A] border border-slate-300/80">
          UNCLASSIFIED
        </span>
      );
  }
};

export const StatusBadge: React.FC<{ status: CaseStatus }> = ({ status }) => {
  switch (status) {
    case 'READY_FOR_REVIEW':
      return (
        <span className="clay-pill bg-emerald-500/15 text-emerald-800 border border-emerald-300/80">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
          Ready For Review
        </span>
      );
    case 'UNDER_REVIEW':
      return (
        <span className="clay-pill bg-indigo-500/15 text-indigo-900 border border-indigo-300/80">
          <Clock className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
          Under Review
        </span>
      );
    case 'ESCALATED':
      return (
        <span className="clay-pill bg-rose-500/15 text-rose-800 border border-rose-300/80">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600" aria-hidden="true" />
          Escalated
        </span>
      );
    case 'REFERRED':
      return (
        <span className="clay-pill bg-purple-500/15 text-purple-900 border border-purple-300/80">
          <Shield className="w-3.5 h-3.5 text-purple-600" aria-hidden="true" />
          Referred
        </span>
      );
    case 'COMPLETED':
      return (
        <span className="clay-pill bg-emerald-600/15 text-emerald-900 border border-emerald-400/80">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
          Completed
        </span>
      );
    default:
      return (
        <span className="clay-pill bg-slate-200/60 text-[#332F3A] border border-slate-300/80">
          {status}
        </span>
      );
  }
};

export const SourceBadge: React.FC<{ source: SourceType }> = ({ source }) => {
  switch (source) {
    case 'PATIENT_VOICE':
      return (
        <span className="clay-pill bg-teal-500/15 text-teal-900 border border-teal-300/80">
          <Mic className="w-3.5 h-3.5 text-teal-600" />
          Patient Voice
        </span>
      );
    case 'PATIENT_TEXT':
      return (
        <span className="clay-pill bg-purple-500/15 text-purple-900 border border-purple-300/80">
          <FileText className="w-3.5 h-3.5 text-purple-600" />
          Patient Text
        </span>
      );
    case 'REPORT_OCR':
      return (
        <span className="clay-pill bg-sky-500/15 text-sky-900 border border-sky-300/80">
          <FileText className="w-3.5 h-3.5 text-sky-600" />
          Report OCR
        </span>
      );
    case 'HARDWARE_READING':
      return (
        <span className="clay-pill bg-emerald-500/15 text-emerald-900 border border-emerald-300/80">
          <Activity className="w-3.5 h-3.5 text-emerald-600" />
          Hardware Telemetry
        </span>
      );
    case 'CLINICIAN_ENTRY':
      return (
        <span className="clay-pill bg-amber-500/15 text-amber-900 border border-amber-300/80">
          <User className="w-3.5 h-3.5 text-amber-600" />
          Clinician Entry
        </span>
      );
    default:
      return (
        <span className="clay-pill bg-slate-200/60 text-[#332F3A] border border-slate-300/80">
          {source}
        </span>
      );
  }
};
