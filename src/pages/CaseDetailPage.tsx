// JANSAATHI AI - Complete Clinical Review Workspace (/cases/:id)
// Comprehensive workstation for attending clinicians to inspect evidence, verify findings, and authorize referrals.

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CaseService } from '../services/supabase/CaseService';
import { TriageCase, ReportDocument, ReferralNote } from '../types';
import { PriorityBadge, StatusBadge } from '../components/common/Badge';
import { UrgencyBanner } from '../components/clinical/UrgencyBanner';
import { ExtractionReviewCard } from '../components/clinical/ExtractionReviewCard';
import { MissingInfoCard } from '../components/clinical/MissingInfoCard';
import { ClinicianActionPanel } from '../components/clinical/ClinicianActionPanel';
import { ReferralModal } from '../components/clinical/ReferralModal';
import { ReportViewerModal } from '../components/clinical/ReportViewerModal';
import { AuditLogViewer } from '../components/clinical/AuditLogViewer';
import { ClinicalDisclaimer } from '../components/common/ClinicalDisclaimer';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Clock,
  Globe,
  FileText,
  Activity,
  CheckCircle2,
  Printer,
  ShieldAlert,
} from 'lucide-react';

export const CaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [triageCase, setTriageCase] = useState<TriageCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ReportDocument | null>(null);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (id) {
      CaseService.getCaseById(id).then((found) => {
        setTriageCase(found);
        setLoading(false);
        if (found?.status === 'READY_FOR_REVIEW') {
          // Transition to UNDER_REVIEW
          CaseService.updateCaseStatus(found.id, 'UNDER_REVIEW', user?.role, user?.fullName);
        }
      });
    }
  }, [id, user]);

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen py-12 text-center text-xs text-slate-500">
        Loading case data...
      </div>
    );
  }

  if (!triageCase) {
    return (
      <div className="bg-slate-50 min-h-screen py-16 text-center">
        <h2 className="text-base font-bold text-slate-800">Case Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">The requested case identifier does not exist.</p>
        <Link to="/cases" className="mt-4 inline-block text-xs text-teal-800 font-semibold underline">
          Return to Queue
        </Link>
      </div>
    );
  }

  const handleCompleteReview = async (
    notes: string,
    status: 'REVIEWED' | 'ESCALATED' | 'REFERRED' | 'COMPLETED'
  ) => {
    await CaseService.addClinicianReview(triageCase.id, {
      case_id: triageCase.id,
      clinician_id: user?.id || 'doc-1',
      clinician_name: user?.fullName || 'Attending Physician',
      review_notes: notes,
      clinical_status: status,
      verified_extractions: isVerified,
    });
    // Refresh local
    const refreshed = await CaseService.getCaseById(triageCase.id);
    if (refreshed) setTriageCase(refreshed);
  };

  const handleSaveReferral = async (referral: ReferralNote) => {
    await CaseService.saveReferral(triageCase.id, referral);
    const refreshed = await CaseService.getCaseById(triageCase.id);
    if (refreshed) setTriageCase(refreshed);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ClinicalDisclaimer />

        {/* Back Link */}
        <div className="my-3">
          <Link
            to="/cases"
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Triage Queue</span>
          </Link>
        </div>

        {/* Clinical Workspace Header Bar */}
        <div className="bg-white rounded border border-slate-300 p-5 shadow-xs mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
                  {triageCase.case_number}
                </h1>
                <PriorityBadge priority={triageCase.priority_level} />
                <StatusBadge status={triageCase.status} />
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Arrival: {new Date(triageCase.created_at).toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  Language: <strong className="uppercase">{triageCase.input_language}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Informed Consent Recorded
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded text-xs font-semibold"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Clinical Case Sheet
              </button>
            </div>
          </div>
        </div>

        {/* 1. Deterministic Urgency Banner */}
        <UrgencyBanner flags={triageCase.urgency_flags || []} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Review Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* 2. Structured Extraction Card with Provenance */}
            {triageCase.extractions ? (
              <ExtractionReviewCard
                extraction={triageCase.extractions}
                isVerified={isVerified}
                onVerify={() => setIsVerified(true)}
              />
            ) : (
              <div className="p-4 bg-white rounded border border-slate-300 text-xs text-slate-500">
                No structured extractions generated for this case.
              </div>
            )}

            {/* 3. Missing Information & Follow-Up Questions */}
            <MissingInfoCard
              missingInfo={triageCase.extractions?.missing_information || []}
              followUpQuestions={triageCase.extractions?.follow_up_questions || []}
            />

            {/* 4. Clinician Actions & Disposition */}
            <ClinicianActionPanel
              caseId={triageCase.id}
              onCompleteReview={handleCompleteReview}
              onOpenReferralModal={() => setIsReferralModalOpen(true)}
            />

            {/* 5. Immutable Case Audit Trail */}
            <AuditLogViewer caseId={triageCase.id} />
          </div>

          {/* Right Column: Reports & Telemetry */}
          <div className="lg:col-span-4 space-y-6">
            {/* Telemetry Vitals Card */}
            <div className="bg-white rounded border border-slate-300 p-4 shadow-xs">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-200">
                <Activity className="w-4 h-4 text-emerald-700" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Measured Vital Telemetry
                </h3>
              </div>

              {triageCase.hardware_readings && triageCase.hardware_readings.length > 0 ? (
                <div className="space-y-2 mt-3">
                  {triageCase.hardware_readings.map((reading) => (
                    <div
                      key={reading.id}
                      className="p-2.5 bg-slate-50 rounded border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-800 block">
                          {reading.reading_type}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(reading.measured_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-bold text-slate-900">
                          {reading.numerical_value}
                        </span>
                        <span className="text-[11px] text-slate-600 ml-1">{reading.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 mt-3 italic">
                  No hardware telemetry recorded for this case.
                </p>
              )}
            </div>

            {/* Attached Diagnostic Reports */}
            <div className="bg-white rounded border border-slate-300 p-4 shadow-xs">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-200">
                <FileText className="w-4 h-4 text-cyan-700" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Attached Reports ({triageCase.reports?.length || 0})
                </h3>
              </div>

              {triageCase.reports && triageCase.reports.length > 0 ? (
                <div className="space-y-2.5 mt-3">
                  {triageCase.reports.map((report) => (
                    <div
                      key={report.id}
                      className="p-3 bg-slate-50 rounded border border-slate-200 text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-slate-900 truncate max-w-[180px]">
                          {report.file_name}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {(report.file_size_bytes / 1024).toFixed(0)} KB &bull;{' '}
                          {report.ocr_confidence
                            ? `OCR: ${(report.ocr_confidence * 100).toFixed(0)}%`
                            : 'Uploaded'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedReport(report)}
                        className="px-2.5 py-1 bg-teal-800 hover:bg-teal-700 text-white rounded text-[11px] font-semibold"
                      >
                        Inspect
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 mt-3 italic">
                  No diagnostic documents uploaded for this case.
                </p>
              )}
            </div>

            {/* Raw Input Transcript */}
            <div className="bg-white rounded border border-slate-300 p-4 shadow-xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide pb-2 border-b border-slate-200">
                Original Patient Statement
              </h3>
              <div className="mt-3 p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-800 font-mono leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                {triageCase.inputs?.[0]?.raw_content || 'No text content available'}
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        {selectedReport && (
          <ReportViewerModal
            report={selectedReport}
            isOpen={Boolean(selectedReport)}
            onClose={() => setSelectedReport(null)}
          />
        )}

        <ReferralModal
          triageCase={triageCase}
          isOpen={isReferralModalOpen}
          onClose={() => setIsReferralModalOpen(false)}
          onSaveReferral={handleSaveReferral}
        />
      </div>
    </div>
  );
};
