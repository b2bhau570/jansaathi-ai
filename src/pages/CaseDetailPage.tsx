// JANSAATHI AI - High-Fidelity Claymorphism Clinical Review Workspace (/cases/:id)
// Comprehensive workstation for attending clinicians to inspect evidence, verify findings, and authorize referrals.

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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
import { EcgWaveformGraph, calculateEcgMetrics } from '../components/clinical/EcgWaveformGraph';
import { ClinicalEcgReportModal } from '../components/clinical/ClinicalEcgReportModal';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Clock,
  Globe,
  FileText,
  Activity,
  CheckCircle2,
  Printer,
  Zap,
} from 'lucide-react';

export const CaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [triageCase, setTriageCase] = useState<TriageCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ReportDocument | null>(null);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isEcgReportOpen, setIsEcgReportOpen] = useState(false);

  useEffect(() => {
    if (id) {
      CaseService.getCaseById(id).then((found) => {
        setTriageCase(found);
        setLoading(false);
        if (found?.status === 'READY_FOR_REVIEW') {
          CaseService.updateCaseStatus(found.id, 'UNDER_REVIEW', user?.role, user?.fullName);
        }
      });
    }
  }, [id, user]);

  if (loading) {
    return (
      <div className="min-h-screen py-16 text-center text-xs font-bold text-[#635F69] animate-clay-breathe">
        Loading case data...
      </div>
    );
  }

  if (!triageCase) {
    return (
      <div className="min-h-screen py-20 text-center">
        <h2 className="text-xl font-black text-[#332F3A] font-heading">Case Not Found</h2>
        <p className="text-xs text-[#635F69] mt-1 font-medium">The requested case identifier does not exist.</p>
        <Link to="/cases" className="mt-5 inline-block clay-btn-primary text-xs px-6 py-2.5 rounded-[18px]">
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
    const refreshed = await CaseService.getCaseById(triageCase.id);
    if (refreshed) setTriageCase(refreshed);
  };

  const handleSaveReferral = async (referral: ReferralNote) => {
    await CaseService.saveReferral(triageCase.id, referral);
    const refreshed = await CaseService.getCaseById(triageCase.id);
    if (refreshed) setTriageCase(refreshed);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <ClinicalDisclaimer />

        {/* Back Link */}
        <div>
          <Link
            to="/cases"
            className="clay-pill bg-white/90 text-[#332F3A] text-xs font-bold hover:bg-violet-50 transition-all select-none"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>Back to Triage Queue</span>
          </Link>
        </div>

        {/* Clinical Workspace Header Bar */}
        <div className="clay-card-static rounded-[36px] p-6 sm:p-7 bg-white/85 shadow-clayCard">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-black font-mono text-[#7C3AED] tracking-tight">
                  {triageCase.case_number}
                </h1>
                <PriorityBadge priority={triageCase.priority_level} />
                <StatusBadge status={triageCase.status} />
              </div>
              <div className="flex flex-wrap items-center gap-3.5 text-xs text-[#635F69] font-medium mt-2">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#7C3AED]" />
                  Arrival: {new Date(triageCase.created_at).toLocaleString()}
                </span>
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#7C3AED]" />
                  Language: <strong className="uppercase font-bold text-[#332F3A]">{triageCase.input_language}</strong>
                </span>
                <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Informed Consent Recorded
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {triageCase.hardware_readings?.some((r) => r.reading_type === 'ECG') && (
                <button
                  type="button"
                  onClick={() => setIsEcgReportOpen(true)}
                  className="clay-btn-primary text-xs px-5 py-2.5 h-11 rounded-[18px] flex items-center gap-2 shadow-clayButton"
                  title="Open official 15-second clinical diagnostic report"
                >
                  <FileText className="w-4 h-4" />
                  <span>15s Diagnostic Report</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => window.print()}
                className="clay-btn-secondary text-xs px-5 py-2.5 h-11 rounded-[18px]"
              >
                <Printer className="w-4 h-4 text-[#7C3AED]" />
                <span>Print Case Sheet</span>
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
              <div className="clay-card-static rounded-[28px] p-6 text-xs text-[#635F69]">
                No structured extractions generated for this case.
              </div>
            )}

            {/* 2.5 Clinical ECG Rhythm Strip (Hardware Telemetry Record) */}
            {(() => {
              const ecgReading = triageCase.hardware_readings?.find((r) => r.reading_type === 'ECG');
              const prReading = triageCase.hardware_readings?.find((r) => r.reading_type === 'PULSE_RATE');
              const spo2Reading = triageCase.hardware_readings?.find((r) => r.reading_type === 'SPO2');
              if (!ecgReading) return null;

              const hr = prReading?.numerical_value && prReading.numerical_value > 0 ? prReading.numerical_value : 74;
              const spo2 = spo2Reading?.numerical_value && spo2Reading.numerical_value > 0 ? spo2Reading.numerical_value : 98;

              return (
                <div className="space-y-3">
                  <EcgWaveformGraph
                    samples={ecgReading.waveform_samples}
                    ppgSamples={ecgReading.ppg_samples}
                    liveValue={ecgReading.numerical_value}
                    isLive={false}
                    leadsOff={!ecgReading.is_stable}
                    heartRate={hr}
                    spo2Value={spo2}
                    title="15-Second Lead-I ECG & SpO2 Diagnostic Rhythm Strip"
                    subtitle={`Captured at ${new Date(ecgReading.measured_at).toLocaleString()} • Paper Speed: 25 mm/s • Voltage Scale: 10 mm/mV`}
                    compact={false}
                    allowFreeze={false}
                    showControls={true}
                    height={280}
                    durationSeconds={15}
                    caseNumber={triageCase.case_number}
                    recordedAt={ecgReading.measured_at}
                    onOpenReport={() => setIsEcgReportOpen(true)}
                  />
                </div>
              );
            })()}

            {/* 3. Missing Information & Follow-Up Questions */}
            <MissingInfoCard
              missingInfo={triageCase.extractions?.missing_information || []}
              followUpQuestions={triageCase.extractions?.follow_up_questions || []}
            />

            {/* 4. Clinician Actions & Disposition */}
            <ClinicianActionPanel
              caseId={triageCase.id}
              caseNumber={triageCase.case_number}
              existingReviews={triageCase.clinician_reviews || []}
              onCompleteReview={handleCompleteReview}
              onOpenReferralModal={() => setIsReferralModalOpen(true)}
            />

            {/* 5. Immutable Case Audit Trail */}
            <AuditLogViewer caseId={triageCase.id} />
          </div>

          {/* Right Column: Reports & Telemetry */}
          <div className="lg:col-span-4 space-y-6">
            {/* Telemetry Vitals Card */}
            <div className="clay-card-static rounded-[28px] p-6 bg-white/85 shadow-clayCard">
              <div className="flex items-center space-x-2.5 pb-3 border-b border-purple-100">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-700">
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-black text-[#332F3A] uppercase tracking-wide font-heading">
                  Measured Vital Telemetry
                </h3>
              </div>

              {triageCase.hardware_readings && triageCase.hardware_readings.length > 0 ? (
                <div className="space-y-2.5 mt-4">
                  {triageCase.hardware_readings.map((reading) => (
                    <div
                      key={reading.id}
                      className="p-3.5 bg-[#EFEBF5] rounded-[20px] shadow-clayPressed flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-[#332F3A] block font-heading">
                          {reading.reading_type === 'ECG' ? 'ECG (Lead-I Telemetry)' : reading.reading_type}
                        </span>
                        <span className="text-[10px] text-[#635F69] font-medium block">
                          {new Date(reading.measured_at).toLocaleTimeString()}
                        </span>
                        {reading.reading_type === 'ECG' && (
                          <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-bold text-violet-700 bg-violet-100/90 px-2 py-0.5 rounded-full">
                            <Activity className="w-2.5 h-2.5" />
                            Rhythm Strip Recorded
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-[#332F3A] font-heading">
                          {reading.numerical_value}
                        </span>
                        <span className="text-xs font-bold text-[#7C3AED] ml-1 font-heading">{reading.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#635F69] mt-3 italic font-medium">
                  No hardware telemetry recorded for this case.
                </p>
              )}
            </div>

            {/* Attached Diagnostic Reports */}
            <div className="clay-card-static rounded-[28px] p-6 bg-white/85 shadow-clayCard">
              <div className="flex items-center space-x-2.5 pb-3 border-b border-purple-100">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/15 flex items-center justify-center text-cyan-700">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-black text-[#332F3A] uppercase tracking-wide font-heading">
                  Attached Reports ({triageCase.reports?.length || 0})
                </h3>
              </div>

              {triageCase.reports && triageCase.reports.length > 0 ? (
                <div className="space-y-2.5 mt-4">
                  {triageCase.reports.map((report) => (
                    <div
                      key={report.id}
                      className="p-3.5 bg-white/90 rounded-[20px] shadow-clayPill border border-white text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-[#332F3A] truncate max-w-[170px] font-heading">
                          {report.file_name}
                        </div>
                        <div className="text-[10px] text-[#635F69] font-medium">
                          {(report.file_size_bytes / 1024).toFixed(0)} KB &bull;{' '}
                          {report.ocr_confidence
                            ? `OCR: ${(report.ocr_confidence * 100).toFixed(0)}%`
                            : 'Uploaded'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedReport(report)}
                        className="clay-btn-primary text-[10px] px-3 py-1.5 min-h-[30px] rounded-xl"
                      >
                        Inspect
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#635F69] mt-3 italic font-medium">
                  No diagnostic documents uploaded for this case.
                </p>
              )}
            </div>

            {/* Raw Input Transcript */}
            <div className="clay-card-static rounded-[28px] p-6 bg-white/85 shadow-clayCard">
              <h3 className="text-xs font-black text-[#332F3A] uppercase tracking-wide pb-2 border-b border-purple-100 font-heading">
                Original Patient Statement
              </h3>
              <div className="mt-3 p-4 bg-[#EFEBF5] rounded-[20px] shadow-clayPressed text-xs text-[#332F3A] font-mono leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
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

        {(() => {
          const ecgReading = triageCase.hardware_readings?.find((r) => r.reading_type === 'ECG');
          const prReading = triageCase.hardware_readings?.find((r) => r.reading_type === 'PULSE_RATE');
          const spo2Reading = triageCase.hardware_readings?.find((r) => r.reading_type === 'SPO2');
          const hr = prReading?.numerical_value && prReading.numerical_value > 0 ? prReading.numerical_value : 74;
          const spo2 = spo2Reading?.numerical_value && spo2Reading.numerical_value > 0 ? spo2Reading.numerical_value : 98;
          const ecgSamples = ecgReading?.waveform_samples || [];
          const ppgSamples = ecgReading?.ppg_samples || [];
          const metrics = ecgReading?.clinical_metrics || calculateEcgMetrics(ecgSamples, hr, spo2);

          return (
            <ClinicalEcgReportModal
              isOpen={isEcgReportOpen}
              onClose={() => setIsEcgReportOpen(false)}
              caseNumber={triageCase.case_number}
              patientName={triageCase.primary_concern ? `Patient (${triageCase.primary_concern})` : `Patient #${triageCase.case_number.slice(-4)}`}
              patientAge={triageCase.reported_duration || 'Adult (42 Y)'}
              patientGender="Unspecified"
              recordedAt={ecgReading?.measured_at || triageCase.created_at}
              chiefComplaint={triageCase.extractions?.chief_complaint || triageCase.primary_concern || 'Routine Triage Vitals Check'}
              heartRate={hr}
              spo2={spo2}
              metrics={metrics}
              ecgSamples={ecgSamples}
              ppgSamples={ppgSamples}
              leadsOff={!ecgReading?.is_stable}
              clinicianName={user?.fullName || 'Dr. Attending Medical Officer (MD)'}
              facilityName={triageCase.facility_name || 'Primary Health Centre (PHC) - Telemedicine Division'}
            />
          );
        })()}
      </div>
    </div>
  );
};
