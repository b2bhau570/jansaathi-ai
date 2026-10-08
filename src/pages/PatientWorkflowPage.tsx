// JANSAATHI AI - Patient Intake Workflow Page
// Multi-step patient intake: Consent -> Language -> Input -> Review -> Confirmation with Anonymous Case ID

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
import { ClinicalDisclaimer } from '../components/common/ClinicalDisclaimer';
import { AIFactory } from '../services/ai/AIFactory';
import { DeterministicUrgencyEngine } from '../services/urgency/DeterministicUrgencyEngine';
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
  Stethoscope,
  Globe,
} from 'lucide-react';

type WorkflowStep = 'CONSENT' | 'LANGUAGE' | 'INPUT' | 'PROCESSING' | 'REVIEW' | 'SUBMITTED';

export const PatientWorkflowPage: React.FC = () => {
  const { currentLanguage, languageInfo } = useLanguage();
  const navigate = useNavigate();

  const [step, setStep] = useState<WorkflowStep>('CONSENT');
  const [activeInputTab, setActiveInputTab] = useState<'VOICE' | 'TEXT' | 'REPORT' | 'VITALS'>('VOICE');

  // Collected data
  const [patientText, setPatientText] = useState('');
  const [vitals, setVitals] = useState<HardwareReading[]>([]);
  const [reports, setReports] = useState<ReportDocument[]>([]);

  // Extraction & Urgency results
  const [extraction, setExtraction] = useState<TriageExtraction | null>(null);
  const [urgencyFlags, setUrgencyFlags] = useState<UrgencyFlag[]>([]);
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

      setExtraction(extracted);
      setUrgencyFlags(evalResult.flags);
      setStep('REVIEW');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error structuring patient information.');
      setStep('INPUT');
    }
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

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <ClinicalDisclaimer />

        {/* Workflow Progress Breadcrumb */}
        {step !== 'SUBMITTED' && (
          <div className="bg-white rounded border border-slate-200 p-3 mb-6 shadow-2xs flex items-center justify-between text-xs font-semibold text-slate-700">
            <div className="flex items-center space-x-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === 'CONSENT' ? 'bg-teal-800 text-white' : 'bg-slate-200 text-slate-700'}`}>1</span>
              <span className={step === 'CONSENT' ? 'text-teal-900 font-bold' : ''}>Consent</span>
            </div>
            <span>&bull;</span>
            <div className="flex items-center space-x-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === 'LANGUAGE' ? 'bg-teal-800 text-white' : 'bg-slate-200 text-slate-700'}`}>2</span>
              <span className={step === 'LANGUAGE' ? 'text-teal-900 font-bold' : ''}>Language</span>
            </div>
            <span>&bull;</span>
            <div className="flex items-center space-x-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === 'INPUT' ? 'bg-teal-800 text-white' : 'bg-slate-200 text-slate-700'}`}>3</span>
              <span className={step === 'INPUT' ? 'text-teal-900 font-bold' : ''}>Provide Symptoms</span>
            </div>
            <span>&bull;</span>
            <div className="flex items-center space-x-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === 'REVIEW' || step === 'PROCESSING' ? 'bg-teal-800 text-white' : 'bg-slate-200 text-slate-700'}`}>4</span>
              <span className={step === 'REVIEW' ? 'text-teal-900 font-bold' : ''}>Review & Confirm</span>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-300 text-red-900 rounded text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
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
            {/* Input Method Selector Tabs */}
            <div className="max-w-2xl mx-auto bg-white rounded border border-slate-300 p-2 shadow-2xs flex items-center justify-between text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveInputTab('VOICE')}
                className={`flex-1 py-2 px-2 rounded flex items-center justify-center gap-1.5 transition-colors ${
                  activeInputTab === 'VOICE' ? 'bg-teal-800 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Speak (Voice)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveInputTab('TEXT')}
                className={`flex-1 py-2 px-2 rounded flex items-center justify-center gap-1.5 transition-colors ${
                  activeInputTab === 'TEXT' ? 'bg-teal-800 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Type (Text)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveInputTab('REPORT')}
                className={`flex-1 py-2 px-2 rounded flex items-center justify-center gap-1.5 transition-colors ${
                  activeInputTab === 'REPORT' ? 'bg-teal-800 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload Report</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveInputTab('VITALS')}
                className={`flex-1 py-2 px-2 rounded flex items-center justify-center gap-1.5 transition-colors ${
                  activeInputTab === 'VITALS' ? 'bg-teal-800 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
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
            <div className="max-w-2xl mx-auto bg-white rounded border border-slate-300 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-700">
                <span className="font-semibold block text-slate-900">Current Intake Record:</span>
                <span className="text-slate-500">
                  {patientText ? `"${patientText.slice(0, 45)}..."` : 'No text entered yet'} &bull;{' '}
                  {reports.length} report(s) &bull; {vitals.length} vital reading(s)
                </span>
              </div>

              <button
                type="button"
                onClick={handleProceedToReview}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-teal-800 hover:bg-teal-700 text-white rounded text-xs font-semibold shadow-xs transition-colors"
              >
                <span>Continue to Summary</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* PROCESSING LOADER */}
        {step === 'PROCESSING' && (
          <div className="max-w-md mx-auto bg-white rounded border border-slate-300 p-8 shadow-xs text-center space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-teal-200 border-t-teal-800 animate-spin mx-auto"></div>
            <h3 className="text-base font-bold text-slate-900">Structuring Clinical Information...</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Evaluating symptom timeline, identifying missing baseline data, and testing against deterministic urgency rules.
            </p>
          </div>
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
          <div className="max-w-2xl mx-auto bg-white rounded border border-slate-300 p-8 shadow-xs text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center mx-auto text-emerald-800">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900">Case Submitted to Clinical Queue</h2>
              <p className="text-xs text-slate-600 mt-1">
                Your structured triage summary has been routed for qualified healthcare professional review.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded border border-slate-200 max-w-sm mx-auto space-y-2 text-xs">
              <div className="text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                Anonymous Case Reference:
              </div>
              <div className="text-2xl font-bold font-mono text-teal-900">
                {submittedCase.case_number}
              </div>
              <div className="text-[11px] text-slate-500">
                Registered: {new Date(submittedCase.created_at).toLocaleTimeString()}
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded border border-amber-300 text-xs text-amber-950 text-left space-y-1">
              <strong>What Happens Next:</strong>
              <p className="text-slate-800">
                1. A qualified doctor or health worker at the facility will open your case in the clinical queue.
              </p>
              <p className="text-slate-800">
                2. They will examine the symptoms, inspect any uploaded reports, and perform physical consultation.
              </p>
              <p className="text-slate-800">
                3. All medical decisions and prescriptions will be given directly by the healthcare professional.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setStep('CONSENT');
                  setPatientText('');
                  setVitals([]);
                  setReports([]);
                  setExtraction(null);
                  setSubmittedCase(null);
                }}
                className="w-full sm:w-auto px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded text-xs font-semibold"
              >
                Register Another Patient
              </button>
              <Link
                to={`/cases/${submittedCase.id}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-800 hover:bg-teal-700 text-white rounded text-xs font-semibold shadow-xs"
              >
                <Stethoscope className="w-4 h-4" />
                <span>View in Clinician Queue</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
