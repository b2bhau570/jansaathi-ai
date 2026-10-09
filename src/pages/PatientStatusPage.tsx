// JANSAATHI AI - High-Fidelity Claymorphism Patient Case Status & AI Follow-Up Inquiry Portal
// Allows citizens to track their case by ID, read doctor review notes, inspect AI triage summaries,
// and ask interactive follow-up doubts to AI with clinical safety guardrails.

import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CaseService } from '../services/supabase/CaseService';
import { GeminiProvider } from '../services/ai/GeminiProvider';
import { TriageCase } from '../types';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { ClinicalDisclaimer } from '../components/common/ClinicalDisclaimer';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  HelpCircle,
  Sparkles,
  Stethoscope,
  Copy,
  Check,
  FileText,
  Building,
  User,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import { EcgWaveformGraph, calculateEcgMetrics } from '../components/clinical/EcgWaveformGraph';
import { ClinicalEcgReportModal } from '../components/clinical/ClinicalEcgReportModal';

export const PatientStatusPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get('id') || searchParams.get('caseId') || '';

  const [inputCaseId, setInputCaseId] = useState(initialId);
  const [currentCase, setCurrentCase] = useState<TriageCase | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [isEcgReportOpen, setIsEcgReportOpen] = useState(false);

  // AI Doubt State
  const [doubtText, setDoubtText] = useState('');
  const [isAskingDoubt, setIsAskingDoubt] = useState(false);
  const [doubtHistory, setDoubtHistory] = useState<
    Array<{ id: string; question: string; answer: string; timestamp: string }>
  >([]);

  const geminiProvider = new GeminiProvider();

  const handleSearch = async (targetId?: string) => {
    const idToSearch = (targetId || inputCaseId).trim();
    if (!idToSearch) {
      setErrorMessage('Please enter your Case ID (e.g. P-2026-000001).');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      const found = await CaseService.getCaseById(idToSearch);
      if (found) {
        setCurrentCase(found);
        setSearchParams({ id: found.case_number });
      } else {
        setCurrentCase(null);
        setErrorMessage(`No case found with ID "${idToSearch}". Please check the spelling and try again.`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to load case details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      handleSearch(initialId);
    }
  }, [initialId]);

  const handleCopyId = () => {
    if (currentCase) {
      navigator.clipboard.writeText(currentCase.case_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAskDoubt = async (customPrompt?: string) => {
    const question = (customPrompt || doubtText).trim();
    if (!question || !currentCase) return;

    setIsAskingDoubt(true);
    setDoubtText('');

    const latestReview = currentCase.clinician_reviews?.[currentCase.clinician_reviews.length - 1];

    try {
      const answer = await geminiProvider.answerPatientDoubt({
        chiefComplaint: currentCase.primary_concern || currentCase.extractions?.chief_complaint || '',
        symptoms: currentCase.extractions?.symptoms || [],
        doctorNotes: latestReview?.review_notes || '',
        disposition: latestReview?.clinical_status || '',
        patientQuestion: question,
        language: currentCase.input_language || 'en',
      });

      const newEntry = {
        id: `doubt-${Date.now()}`,
        question,
        answer,
        timestamp: new Date().toLocaleTimeString(),
      };

      setDoubtHistory((prev) => [newEntry, ...prev]);
    } catch (err: any) {
      setDoubtHistory((prev) => [
        {
          id: `doubt-err-${Date.now()}`,
          question,
          answer: 'Unable to process doubt right now. Please consult the clinician directly.',
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);
    } finally {
      setIsAskingDoubt(false);
    }
  };

  const suggestedDoubts = [
    'What did the doctor advise for my symptoms?',
    'Are there any red-flag emergency signs I should watch for?',
    'Can I continue my regular daily routine?',
    'When should I visit the primary health centre again?',
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        <ClinicalDisclaimer />

        {/* Search Header Card in High-Fidelity Claymorphism */}
        <div className="clay-card rounded-[36px] p-7 md:p-9">
          <div className="flex items-center space-x-4 pb-4 border-b border-purple-100">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white flex items-center justify-center shrink-0 shadow-clayOrb">
              <Search className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#332F3A] font-heading">
                Patient Case Status & Follow-Up Portal
              </h1>
              <p className="text-xs font-semibold text-[#635F69] mt-0.5">
                Track doctor reviews, read your clinical summary, and ask follow-up questions
              </p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="mt-6 flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-[#7C3AED] absolute left-4 top-4" />
              <input
                type="text"
                value={inputCaseId}
                onChange={(e) => setInputCaseId(e.target.value)}
                placeholder="Enter your Case ID (e.g. P-2026-000001)"
                className="clay-input rounded-[22px] pl-12 pr-4 py-3.5 text-sm font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="clay-btn-primary px-8 py-3.5 h-13 rounded-[20px] text-xs disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>{isLoading ? 'Searching...' : 'Check Status'}</span>
            </button>
          </form>

          {errorMessage && (
            <div role="alert" className="mt-5 p-4 rounded-[20px] bg-rose-500/15 border border-rose-300 text-rose-900 text-xs font-bold flex items-center gap-2 shadow-clayPill">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Case Details */}
        {currentCase && (
          <div className="space-y-6">
            {/* Case Header Card */}
            <div className="clay-card-static rounded-[32px] p-6 bg-white/85 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-black text-[#635F69] uppercase tracking-wider font-heading">
                    Case Number:
                  </span>
                  <span className="text-xl font-black font-mono text-[#7C3AED] tracking-wide">
                    {currentCase.case_number}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    title="Copy Case ID"
                    className="p-1.5 rounded-xl bg-[#EFEBF5] shadow-clayPressed hover:bg-white text-[#332F3A] cursor-pointer transition-all active:scale-90"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-[#7C3AED]" />}
                  </button>
                </div>
                <div className="text-xs text-[#635F69] font-medium mt-1.5 flex items-center gap-3">
                  <span>Registered: {new Date(currentCase.created_at).toLocaleString()}</span>
                  <span>&bull;</span>
                  <span className="capitalize">Language: {currentCase.input_language}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <PriorityBadge priority={currentCase.priority_level} />
                <StatusBadge status={currentCase.status} />
              </div>
            </div>

            {/* Doctor / Clinician Review Section */}
            <div className="clay-card rounded-[36px] p-7 md:p-8 space-y-4">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-clayOrb">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black text-[#332F3A] font-heading">Doctor's Clinical Review & Advice</h2>
              </div>

              {currentCase.clinician_reviews && currentCase.clinician_reviews.length > 0 ? (
                <div className="space-y-4">
                  {currentCase.clinician_reviews.map((rev, idx) => (
                    <div key={rev.id || idx} className="p-6 rounded-[28px] bg-emerald-500/10 border border-emerald-300/60 shadow-clayPill space-y-3.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/50 pb-2.5">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-emerald-800" />
                          <span className="text-sm font-black text-emerald-950 font-heading">
                            {rev.clinician_name || 'Attending Physician (MD)'}
                          </span>
                        </div>
                        <span className="text-xs text-emerald-800 font-mono font-bold">
                          Reviewed: {new Date(rev.reviewed_at).toLocaleString()}
                        </span>
                      </div>

                      <div>
                        <span className="block text-xs font-black text-emerald-900 uppercase tracking-wider mb-1.5 font-heading">
                          Doctor's Clinical Notes & Guidance:
                        </span>
                        <p className="text-xs sm:text-sm text-[#332F3A] font-medium leading-relaxed whitespace-pre-line bg-white/90 p-4 rounded-[20px] shadow-clayPressed">
                          {rev.review_notes || 'No detailed clinical notes provided.'}
                        </p>
                      </div>

                      {rev.clinical_status && (
                        <div className="flex items-center gap-2 text-xs pt-1">
                          <span className="font-bold text-emerald-900 font-heading">Disposition:</span>
                          <span className="clay-pill bg-white text-emerald-900 font-black">
                            {rev.clinical_status.replace(/_/g, ' ')}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Referral Notice if any */}
                  {currentCase.referral && (
                    <div className="p-5 rounded-[24px] bg-gradient-to-br from-amber-500/15 to-orange-500/15 border border-amber-300/80 shadow-clayPill text-xs text-amber-950 space-y-1.5">
                      <div className="font-black flex items-center gap-2 text-amber-900 font-heading text-sm">
                        <Building className="w-4 h-4" />
                        <span>Referral Issued by Clinician</span>
                      </div>
                      <p className="text-[#332F3A] font-medium">
                        <strong>Referred to:</strong> {currentCase.referral.receiving_facility_name}
                      </p>
                      <p className="text-[#332F3A] font-medium">
                        <strong>Reason:</strong> {currentCase.referral.reason_for_referral}
                      </p>
                      {currentCase.referral.clinical_summary && (
                        <p className="italic text-[#635F69]">"{currentCase.referral.clinical_summary}"</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 rounded-[28px] bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-300/60 text-xs text-amber-950 flex items-start gap-3.5 shadow-clayPill">
                  <Clock className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-black text-sm text-amber-900 font-heading">Awaiting Clinician Evaluation</h4>
                    <p className="mt-1 text-[#332F3A] font-medium leading-relaxed">
                      Your symptoms are currently placed in the facility triage queue. The attending doctor or health
                      worker has not finalized their review yet. Please check back shortly or speak with the clinic staff.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* AI Summary Section */}
            <div className="clay-card rounded-[36px] p-7 md:p-8 space-y-4">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white shadow-clayOrb">
                  <FileText className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black text-[#332F3A] font-heading">Your Structured Triage Summary</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-[22px] bg-[#EFEBF5] shadow-clayPressed">
                  <span className="text-[#635F69] font-bold block mb-1 font-heading">Chief Presenting Complaint:</span>
                  <span className="font-black text-[#332F3A] text-base font-heading">
                    {currentCase.primary_concern || currentCase.extractions?.chief_complaint || 'Unspecified complaint'}
                  </span>
                </div>

                <div className="p-4 rounded-[22px] bg-[#EFEBF5] shadow-clayPressed">
                  <span className="text-[#635F69] font-bold block mb-1 font-heading">Reported Duration:</span>
                  <span className="font-black text-[#332F3A] text-base font-heading">
                    {currentCase.reported_duration || currentCase.extractions?.duration || 'Not specified'}
                  </span>
                </div>
              </div>

              {currentCase.extractions?.symptoms && currentCase.extractions.symptoms.length > 0 && (
                <div className="mt-4 pt-2">
                  <span className="text-xs font-black text-[#332F3A] block mb-2 font-heading">Identified Symptoms:</span>
                  <div className="flex flex-wrap gap-2">
                    {currentCase.extractions.symptoms.map((symptom, idx) => (
                      <span
                        key={idx}
                        className="clay-pill bg-white text-[#332F3A] text-xs font-bold"
                      >
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Vitals and ECG Telemetry Section if available */}
            {currentCase.hardware_readings && currentCase.hardware_readings.length > 0 && (
              <div className="clay-card rounded-[36px] p-7 md:p-8 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white shadow-clayOrb">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-[#332F3A] font-heading">Measured Health Vitals</h2>
                      <p className="text-xs text-[#635F69] font-medium">Recorded during initial clinical intake</p>
                    </div>
                  </div>

                  {currentCase.hardware_readings.some((r) => r.reading_type === 'ECG') && (
                    <button
                      type="button"
                      onClick={() => setIsEcgReportOpen(true)}
                      className="clay-btn-primary text-xs px-4 py-2 rounded-2xl flex items-center gap-2 self-start sm:self-auto shadow-clayButton"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>15s Diagnostic Report (Print/PDF)</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {currentCase.hardware_readings.map((v) => (
                    <div key={v.id} className="p-4 rounded-[22px] bg-[#EFEBF5] shadow-clayPressed text-xs">
                      <span className="text-[#635F69] font-bold block mb-1 font-heading">{v.reading_type}</span>
                      <span className="font-black text-[#332F3A] text-xl font-heading">{v.numerical_value}</span>
                      <span className="text-xs font-bold text-[#7C3AED] ml-1">{v.unit}</span>
                    </div>
                  ))}
                </div>

                {(() => {
                  const ecgVital = currentCase.hardware_readings.find((r) => r.reading_type === 'ECG');
                  const prVital = currentCase.hardware_readings.find((r) => r.reading_type === 'PULSE_RATE');
                  const spo2Vital = currentCase.hardware_readings.find((r) => r.reading_type === 'SPO2');
                  if (!ecgVital) return null;

                  return (
                    <div className="mt-4 pt-3 border-t border-purple-100">
                      <EcgWaveformGraph
                        samples={ecgVital.waveform_samples}
                        ppgSamples={ecgVital.ppg_samples}
                        liveValue={ecgVital.numerical_value}
                        isLive={false}
                        leadsOff={!ecgVital.is_stable}
                        heartRate={prVital?.numerical_value || 74}
                        spo2Value={spo2Vital?.numerical_value || 98}
                        durationSeconds={15}
                        caseNumber={currentCase.case_number}
                        recordedAt={ecgVital.measured_at || currentCase.created_at}
                        title="Your Recorded 15-Second ECG & SpO2 Rhythm Strip"
                        subtitle="Standard 25 mm/s rhythm strip transmitted to attending physician for evaluation"
                        compact={false}
                        allowFreeze={false}
                        showControls={true}
                        height={260}
                        onOpenReport={() => setIsEcgReportOpen(true)}
                      />
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Interactive AI Follow-up Doubt Assistant */}
            <div className="clay-card rounded-[36px] p-7 md:p-8 space-y-5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white shadow-clayOrb">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black text-[#332F3A] font-heading">Ask AI Follow-Up Doubts</h2>
              </div>
              <p className="text-xs text-[#635F69] font-medium leading-relaxed">
                Have questions regarding what the doctor advised, your symptoms, or safe home care? Ask below for
                instant, supportive clarification based on your case file.
              </p>

              {/* Suggested Questions */}
              <div>
                <span className="text-xs font-black text-[#332F3A] uppercase tracking-wider block mb-2.5 font-heading">
                  Frequently Asked Doubts (Click to Ask):
                </span>
                <div className="flex flex-wrap gap-2">
                  {suggestedDoubts.map((doubt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={isAskingDoubt}
                      onClick={() => handleAskDoubt(doubt)}
                      className="clay-pill bg-white/90 hover:bg-violet-50 text-[#332F3A] text-xs font-bold cursor-pointer disabled:opacity-50 select-none"
                    >
                      {doubt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAskDoubt();
                }}
                className="flex gap-2.5 pt-2"
              >
                <input
                  type="text"
                  value={doubtText}
                  onChange={(e) => setDoubtText(e.target.value)}
                  placeholder="Type your question or doubt here (e.g. Can I take bath with fever?)..."
                  className="clay-input rounded-[22px] p-3.5 text-xs flex-1"
                />
                <button
                  type="submit"
                  disabled={isAskingDoubt || !doubtText.trim()}
                  className="clay-btn-primary px-6 py-3 h-12 rounded-[18px] text-xs disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isAskingDoubt ? 'Thinking...' : 'Ask'}</span>
                </button>
              </form>

              {/* Doubts Conversation History */}
              {doubtHistory.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-purple-100">
                  <h3 className="text-xs font-black text-[#332F3A] uppercase tracking-wider font-heading">
                    Your Questions & AI Responses:
                  </h3>
                  {doubtHistory.map((item) => (
                    <div key={item.id} className="space-y-2.5 p-5 rounded-[24px] bg-[#EFEBF5] shadow-clayPressed">
                      <div className="flex items-start gap-2.5">
                        <HelpCircle className="w-4 h-4 text-[#7C3AED] shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <span className="font-black text-xs text-[#332F3A] font-heading">{item.question}</span>
                          <span className="text-[10px] text-[#635F69] ml-2 font-mono font-bold">{item.timestamp}</span>
                        </div>
                      </div>
                      <div className="pl-6 border-l-2 border-[#7C3AED] text-xs text-[#332F3A] font-medium leading-relaxed whitespace-pre-line bg-white/90 p-4 rounded-[18px] shadow-xs">
                        {item.answer}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="p-4 rounded-[20px] bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-purple-200/50 flex items-center gap-2.5 text-xs text-[#635F69] shadow-clayPill">
                <ShieldCheck className="w-4 h-4 text-[#7C3AED] shrink-0" />
                <span className="font-medium">
                  JANSAATHI AI answers follow-up doubts for patient education. It does not replace emergency clinical
                  examinations or prescribe new medications.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Diagnostic Report Modal */}
        {(() => {
          if (!currentCase?.hardware_readings) return null;
          const ecgVital = currentCase.hardware_readings.find((r) => r.reading_type === 'ECG');
          if (!ecgVital && !isEcgReportOpen) return null;
          const prVital = currentCase.hardware_readings.find((r) => r.reading_type === 'PULSE_RATE');
          const spo2Vital = currentCase.hardware_readings.find((r) => r.reading_type === 'SPO2');
          const hr = prVital?.numerical_value && prVital.numerical_value > 0 ? prVital.numerical_value : 74;
          const spo2 = spo2Vital?.numerical_value && spo2Vital.numerical_value > 0 ? spo2Vital.numerical_value : 98;
          const ecgSamples = ecgVital?.waveform_samples || [];
          const ppgSamples = ecgVital?.ppg_samples || [];
          const metrics = ecgVital?.clinical_metrics || calculateEcgMetrics(ecgSamples, hr, spo2);

          return (
            <ClinicalEcgReportModal
              isOpen={isEcgReportOpen}
              onClose={() => setIsEcgReportOpen(false)}
              caseNumber={currentCase.case_number}
              patientName={currentCase.primary_concern ? `Patient (${currentCase.primary_concern})` : `Patient #${currentCase.case_number.slice(-4)}`}
              patientAge={currentCase.reported_duration || 'Adult (42 Y)'}
              patientGender="Unspecified"
              recordedAt={ecgVital?.measured_at || currentCase.created_at}
              chiefComplaint={currentCase.extractions?.chief_complaint || currentCase.primary_concern || 'Routine Triage Vitals Check'}
              heartRate={hr}
              spo2={spo2}
              metrics={metrics}
              ecgSamples={ecgSamples}
              ppgSamples={ppgSamples}
              leadsOff={!ecgVital?.is_stable}
              clinicianName="Dr. Attending Medical Officer (MD)"
              facilityName={currentCase.facility_name || 'Primary Health Centre (PHC) - Telemedicine Division'}
            />
          );
        })()}
      </div>
    </div>
  );
};
