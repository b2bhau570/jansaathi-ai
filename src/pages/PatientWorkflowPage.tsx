// JANSAATHI AI - High-Fidelity Claymorphism Patient Intake Workflow
// Multi-step patient intake: Consent -> Language -> Input -> Clarification -> Review -> Confirmation with Anonymous Case ID

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { ConsentStep } from '../components/patient/ConsentStep';
import { LanguageSelectorModal } from '../components/patient/LanguageSelectorModal';
import { VoiceRecorderPanel } from '../components/patient/VoiceRecorderPanel';
import { TextInputPanel } from '../components/patient/TextInputPanel';
import { ReportUploadPanel } from '../components/patient/ReportUploadPanel';
import { HardwareReadingPanel } from '../components/patient/HardwareReadingPanel';
import { PatientReviewSummary } from '../components/patient/PatientReviewSummary';
import { PatientFollowUpStep } from '../components/patient/PatientFollowUpStep';
import { ClinicalDisclaimer } from '../components/common/ClinicalDisclaimer';
import { AIFactory } from '../services/ai/AIFactory';
import { DeterministicUrgencyEngine } from '../services/urgency/DeterministicUrgencyEngine';
import { MissingInformationEngine } from '../services/ai/MissingInformationEngine';
import { FollowUpQuestionEngine, ClinicalFollowUpQuestion } from '../services/ai/FollowUpQuestionEngine';
import { CaseService } from '../services/supabase/CaseService';
import { TriageExtraction, HardwareReading, ReportDocument, UrgencyFlag, TriageCase } from '../types';
import {
  Mic,
  FileText,
  UploadCloud,
  Activity,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Search,
  Sparkles,
} from 'lucide-react';

type WorkflowStep = 'CONSENT' | 'LANGUAGE' | 'INPUT' | 'PROCESSING' | 'FOLLOW_UP' | 'REVIEW' | 'SUBMITTED';

export const PatientWorkflowPage: React.FC = () => {
  const { currentLanguage } = useLanguage();
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState(false);

  const [step, setStep] = useState<WorkflowStep>('CONSENT');
  const [activeInputTab, setActiveInputTab] = useState<'VOICE' | 'TEXT' | 'REPORT' | 'VITALS'>('VOICE');

  // Collected data
  const [patientText, setPatientText] = useState('');
  const [vitals, setVitals] = useState<HardwareReading[]>([]);
  const [reports, setReports] = useState<ReportDocument[]>([]);

  // Extraction & Urgency results
  const [extraction, setExtraction] = useState<TriageExtraction | null>(null);
  const [urgencyFlags, setUrgencyFlags] = useState<UrgencyFlag[]>([]);
  const [followUpQuestions, setFollowUpQuestions] = useState<ClinicalFollowUpQuestion[]>([]);
  const [submittedCase, setSubmittedCase] = useState<TriageCase | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Consent Handler
  const handleConsentGiven = () => {
    setStep('LANGUAGE');
  };

  const handleConsentDecline = () => {
    navigate('/');
  };

  // 2. Language Handler
  const handleLanguageSelected = () => {
    setStep('INPUT');
  };

  // 3. Process Input to Extracted Triage Note
  const handleProceedToReview = async () => {
    if (!patientText.trim() && reports.length === 0 && vitals.length === 0) {
      setErrorMessage('Please provide symptoms by speaking, typing, uploading a report, or measuring vitals.');
      return;
    }

    setErrorMessage(null);
    setStep('PROCESSING');

    try {
      const ocrSummary = reports.map((r) => r.extracted_text).filter(Boolean).join('\n');
      const vitalsSummary = vitals
        .map((v) => `${v.reading_type}: ${v.numerical_value} ${v.unit}`)
        .join(', ');

      const provider = AIFactory.getProvider();
      const extracted = await provider.extractTriageInformation({
        caseId: 'temp-prep',
        language: currentLanguage,
        rawText: patientText,
        reportOcrText: ocrSummary,
        hardwareReadingsSummary: vitalsSummary,
      });

      // Deterministic urgency evaluation
      const urgencyEngine = new DeterministicUrgencyEngine();
      const evalResult = urgencyEngine.evaluate({
        caseId: 'temp-prep',
        patientStatements: [patientText, ocrSummary],
        extractedSymptoms: extracted.symptoms,
        vitals,
        reportedDuration: extracted.duration,
        medicalHistory: extracted.medical_history,
      });

      // Analyze clinical gaps and generate targeted follow-up questions in patient language
      const gaps = MissingInformationEngine.analyze(extracted, vitals.length > 0);
      const generatedQuestions = FollowUpQuestionEngine.generateQuestions(
        gaps,
        extracted.chief_complaint,
        currentLanguage,
        extracted.follow_up_questions
      );

      setExtraction(extracted);
      setUrgencyFlags(evalResult.flags);
      setFollowUpQuestions(generatedQuestions);

      // If we found targeted questions, route to interactive follow-up step first
      if (generatedQuestions.length > 0) {
        setStep('FOLLOW_UP');
      } else {
        setStep('REVIEW');
      }
    } catch (err: any) {
      setErrorMessage('Failed to analyze medical notes. Please check input and retry.');
      setStep('INPUT');
    }
  };

  // Callback when patient answers AI follow-up questions
  const handleFollowUpCompleted = (answeredAnswers: { question: string; answer: string }[]) => {
    if (!extraction) return;

    if (answeredAnswers.length > 0) {
      const followUpTranscript = answeredAnswers
        .map((a) => `[Follow-up Q: ${a.question} | Patient Answer: ${a.answer}]`)
        .join('\n');

      const updatedText = patientText ? `${patientText}\n\n${followUpTranscript}` : followUpTranscript;
      setPatientText(updatedText);

      const updatedExtraction = {
        ...extraction,
        patient_notes_translated: `${extraction.patient_notes_translated || ''}\n\nClarification Answers:\n${followUpTranscript}`,
      };

      const urgencyEngine = new DeterministicUrgencyEngine();
      const evalResult = urgencyEngine.evaluate({
        caseId: 'temp-prep',
        patientStatements: [updatedText],
        extractedSymptoms: updatedExtraction.symptoms,
        vitals,
        reportedDuration: updatedExtraction.duration,
        medicalHistory: updatedExtraction.medical_history,
      });

      setExtraction(updatedExtraction);
      setUrgencyFlags(evalResult.flags);
    }
    setStep('REVIEW');
  };

  // 4. Final Confirmation & Submission
  const handleConfirmSubmission = async () => {
    if (!extraction) return;

    setIsSubmitting(true);
    try {
      const created = await CaseService.createCase({
        language: currentLanguage,
        rawText: patientText || 'Direct report and vitals submission',
        inputType: activeInputTab === 'VOICE' ? 'VOICE' : activeInputTab === 'REPORT' ? 'REPORT_IMAGE' : 'TEXT',
        extraction,
        urgencyFlags,
        hardwareReadings: vitals,
        reports,
      });

      setSubmittedCase(created);
      setStep('SUBMITTED');
    } catch (err: any) {
      setErrorMessage('Failed to submit case to review queue. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsList = [
    { key: 'CONSENT', num: 1, label: 'Consent' },
    { key: 'LANGUAGE', num: 2, label: 'Language' },
    { key: 'INPUT', num: 3, label: 'Symptoms' },
    { key: 'FOLLOW_UP', num: 4, label: 'Clarification' },
    { key: 'REVIEW', num: 5, label: 'Review' },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-6">
          <ClinicalDisclaimer />
        </div>

        {/* Workflow Progress Breadcrumb in Clay Pill Bar */}
        {step !== 'SUBMITTED' && (
          <div className="clay-card-static rounded-[28px] p-3.5 mb-8 bg-white/80 flex items-center justify-between text-xs font-bold text-[#332F3A] overflow-x-auto gap-2">
            {stepsList.map((s, index) => {
              const isCurrent = step === s.key || (s.key === 'REVIEW' && step === 'PROCESSING');
              return (
                <React.Fragment key={s.key}>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black font-heading transition-all ${
                        isCurrent
                          ? 'bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white shadow-clayOrb scale-110'
                          : 'bg-[#EFEBF5] text-[#635F69] shadow-clayPressed'
                      }`}
                    >
                      {s.num}
                    </span>
                    <span
                      className={`font-heading tracking-wide ${
                        isCurrent ? 'text-[#7C3AED] font-black' : 'text-[#635F69]'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {index < stepsList.length - 1 && (
                    <span className="text-purple-300 font-black shrink-0">&bull;</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-[22px] bg-rose-500/15 border border-rose-300 text-rose-900 text-xs font-bold flex items-center gap-2.5 shadow-clayPill"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Informed Consent */}
        {step === 'CONSENT' && (
          <ConsentStep onConsentGiven={handleConsentGiven} onDecline={handleConsentDecline} />
        )}

        {/* STEP 2: Language Selection */}
        {step === 'LANGUAGE' && (
          <LanguageSelectorModal onLanguageSelected={handleLanguageSelected} />
        )}

        {/* STEP 3: Intake Inputs */}
        {step === 'INPUT' && (
          <div className="space-y-6">
            {/* Input Method Selector Tabs in Recessed Clay Bar */}
            <div className="max-w-2xl mx-auto rounded-[24px] bg-[#EFEBF5] p-2 shadow-clayPressed flex items-center justify-between text-xs font-black font-heading gap-1">
              <button
                type="button"
                onClick={() => setActiveInputTab('VOICE')}
                className={`flex-1 py-3 px-3 rounded-[18px] flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeInputTab === 'VOICE'
                    ? 'bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white shadow-clayButton'
                    : 'text-[#635F69] hover:text-[#332F3A] hover:bg-white/50'
                }`}
              >
                <Mic className="w-4 h-4" />
                <span>Speak (Voice)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveInputTab('TEXT')}
                className={`flex-1 py-3 px-3 rounded-[18px] flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeInputTab === 'TEXT'
                    ? 'bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white shadow-clayButton'
                    : 'text-[#635F69] hover:text-[#332F3A] hover:bg-white/50'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Type (Text)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveInputTab('REPORT')}
                className={`flex-1 py-3 px-3 rounded-[18px] flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeInputTab === 'REPORT'
                    ? 'bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white shadow-clayButton'
                    : 'text-[#635F69] hover:text-[#332F3A] hover:bg-white/50'
                }`}
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Report</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveInputTab('VITALS')}
                className={`flex-1 py-3 px-3 rounded-[18px] flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeInputTab === 'VITALS'
                    ? 'bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white shadow-clayButton'
                    : 'text-[#635F69] hover:text-[#332F3A] hover:bg-white/50'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Vital Signs</span>
              </button>
            </div>

            {/* Active Panel */}
            {activeInputTab === 'VOICE' && (
              <VoiceRecorderPanel
                initialTranscript={patientText}
                onTranscriptReady={(transcript) => setPatientText(transcript)}
              />
            )}

            {activeInputTab === 'TEXT' && (
              <TextInputPanel value={patientText} onChange={(val) => setPatientText(val)} />
            )}

            {activeInputTab === 'REPORT' && (
              <ReportUploadPanel
                onReportProcessed={(doc) => {
                  setReports((prev) => [...prev.filter((r) => r.id !== doc.id), doc]);
                  if (doc.extracted_text && !patientText) {
                    setPatientText(`Attached diagnostic report: ${doc.file_name}`);
                  }
                }}
              />
            )}

            {activeInputTab === 'VITALS' && (
              <HardwareReadingPanel
                initialReadings={vitals}
                onReadingsUpdated={(items) => setVitals(items)}
              />
            )}

            {/* Summary preview & Continue button */}
            <div className="max-w-2xl mx-auto clay-card-static rounded-[28px] p-6 bg-white/80 flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="text-xs text-[#332F3A] space-y-1">
                <span className="font-extrabold block text-sm text-[#332F3A] font-heading">
                  Current Intake Record:
                </span>
                <span className="text-[#635F69] font-medium block">
                  {patientText ? `"${patientText.slice(0, 50)}..."` : 'No text entered yet'} &bull;{' '}
                  {reports.length} report(s) &bull; {vitals.length} vital reading(s)
                </span>
              </div>

              <button
                type="button"
                onClick={handleProceedToReview}
                className="clay-btn-primary w-full sm:w-auto text-sm px-7 py-3.5 h-14"
              >
                <span>Continue to Summary</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* PROCESSING LOADER */}
        {step === 'PROCESSING' && (
          <div className="max-w-md mx-auto clay-card rounded-[36px] p-10 text-center space-y-5 animate-clay-breathe">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] flex items-center justify-center text-white shadow-clayOrb mx-auto animate-spin">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-[#332F3A] font-heading">
              Structuring Clinical Information...
            </h3>
            <p className="text-xs text-[#635F69] font-medium leading-relaxed">
              Evaluating symptom timeline, identifying missing baseline data, and testing against deterministic urgency rules.
            </p>
          </div>
        )}

        {/* STEP 4: Interactive AI Follow-up Questions */}
        {step === 'FOLLOW_UP' && followUpQuestions.length > 0 && (
          <PatientFollowUpStep
            questions={followUpQuestions}
            language={currentLanguage}
            onComplete={handleFollowUpCompleted}
            onSkip={() => setStep('REVIEW')}
          />
        )}

        {/* STEP 4: Review what was understood */}
        {step === 'REVIEW' && extraction && (
          <PatientReviewSummary
            extraction={extraction}
            vitals={vitals}
            reports={reports}
            isSubmitting={isSubmitting}
            onEdit={() => setStep('INPUT')}
            onConfirm={handleConfirmSubmission}
          />
        )}

        {/* STEP 5: Final Submission Confirmation */}
        {step === 'SUBMITTED' && submittedCase && (
          <div className="max-w-2xl mx-auto clay-card rounded-[40px] p-10 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto text-white shadow-clayOrb animate-clay-breathe">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div>
              <h2 className="text-3xl font-black text-[#332F3A] font-heading">
                Case Submitted to Clinical Queue
              </h2>
              <p className="text-sm text-[#635F69] font-medium mt-1.5">
                Your structured triage summary has been routed for qualified healthcare professional review.
              </p>
            </div>

            {/* Recessed Anonymous Case ID Block */}
            <div className="p-6 rounded-[28px] bg-[#EFEBF5] shadow-clayPressed max-w-md mx-auto space-y-3 text-xs">
              <div className="text-[#635F69] font-black uppercase tracking-wider text-xs font-heading">
                Your Anonymous Case ID:
              </div>
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl font-black font-mono text-[#7C3AED] tracking-wider">
                  {submittedCase.case_number}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(submittedCase.case_number);
                    setCopiedId(true);
                    setTimeout(() => setCopiedId(false), 2000);
                  }}
                  title="Copy Case ID"
                  className="p-2.5 rounded-2xl bg-white shadow-clayButton hover:-translate-y-0.5 active:scale-90 text-[#332F3A] cursor-pointer transition-all"
                >
                  {copiedId ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5 text-[#7C3AED]" />}
                </button>
              </div>
              <p className="text-xs text-[#7C3AED] font-bold">
                Keep this ID! You can use it anytime to check doctor notes & ask AI follow-up doubts.
              </p>
              <div className="text-[11px] text-[#635F69] font-medium">
                Registered: {new Date(submittedCase.created_at).toLocaleTimeString()}
              </div>
            </div>

            <div className="p-5 rounded-[24px] bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-300/60 shadow-clayPill text-xs text-amber-950 text-left space-y-2">
              <strong className="block text-sm font-heading font-black text-amber-900">What Happens Next:</strong>
              <p className="text-[#332F3A] font-medium">
                1. A qualified doctor or health worker at the facility will review your case in the clinical queue.
              </p>
              <p className="text-[#332F3A] font-medium">
                2. They will examine the symptoms, inspect any uploaded reports, and document clinical advice.
              </p>
              <p className="text-[#332F3A] font-medium">
                3. You can enter your Anonymous Case ID in the Patient Status Portal to read their review notes.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to={`/status?caseId=${submittedCase.case_number}`}
                className="clay-btn-primary w-full sm:w-auto px-7 py-3.5 h-14 text-sm"
              >
                <Search className="w-4 h-4" />
                <span>Track This Case Now</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setStep('CONSENT');
                  setPatientText('');
                  setReports([]);
                  setVitals([]);
                  setExtraction(null);
                  setSubmittedCase(null);
                }}
                className="clay-btn-secondary w-full sm:w-auto px-7 py-3.5 h-14 text-sm"
              >
                Submit Another Case
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
