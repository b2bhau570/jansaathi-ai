// JANSAATHI AI - High-Fidelity Claymorphism Clinician Review Actions & Final Disposition Panel
// Human-in-the-loop decision capture. Records clinician-entered observations and dispositions.

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ClinicianReview } from '../../types';
import {
  UserCheck,
  Send,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ExternalLink,
  Clock,
  User,
  ArrowRight,
} from 'lucide-react';

interface ClinicianActionPanelProps {
  caseId: string;
  caseNumber?: string;
  existingReviews?: ClinicianReview[];
  onCompleteReview: (notes: string, status: 'REVIEWED' | 'ESCALATED' | 'REFERRED' | 'COMPLETED') => Promise<void>;
  onOpenReferralModal: () => void;
  isSubmitting?: boolean;
}

export const ClinicianActionPanel: React.FC<ClinicianActionPanelProps> = ({
  caseId,
  caseNumber,
  existingReviews = [],
  onCompleteReview,
  onOpenReferralModal,
}) => {
  const [notes, setNotes] = useState('');
  const [selectedDisposition, setSelectedDisposition] = useState<'REVIEWED' | 'ESCALATED' | 'REFERRED' | 'COMPLETED'>('REVIEWED');
  const [verifiedInformation, setVerifiedInformation] = useState(true);
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      setErrorMessage('Please document your clinician observations and management notes.');
      return;
    }

    setIsSubmittingLocal(true);
    setErrorMessage('');
    setSuccessMessage(false);

    try {
      await onCompleteReview(notes.trim(), selectedDisposition);
      setSuccessMessage(true);
      setNotes(''); // Clear notes after successful recording
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit clinician decision. Please try again.');
    } finally {
      setIsSubmittingLocal(false);
    }
  };

  return (
    <div className="clay-card-static rounded-[36px] p-7 md:p-8 bg-white/85 shadow-clayCard mb-6 space-y-5">
      <div className="flex items-center space-x-3 pb-4 border-b border-purple-100">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white shadow-clayOrb shrink-0">
          <UserCheck className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-black text-[#332F3A] font-heading">Qualified Clinician Assessment & Disposition</h3>
          <p className="text-xs font-semibold text-[#635F69] mt-0.5">
            A registered healthcare professional must review and document clinical findings.
          </p>
        </div>
      </div>

      {/* Success Alert Banner */}
      {successMessage && (
        <div role="status" className="p-5 rounded-[24px] bg-emerald-500/15 border border-emerald-300 text-emerald-950 text-xs space-y-2 shadow-clayPill">
          <div className="flex items-center gap-2 font-black text-emerald-900 text-sm font-heading">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            <span>Clinician Decision Recorded Successfully!</span>
          </div>
          <p className="text-[#332F3A] font-medium">
            Your clinical findings and advice have been saved to the permanent case record.
            The patient can now view your recommendations in their status portal.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to={`/status?id=${caseNumber || caseId}`}
              target="_blank"
              className="clay-btn-primary text-xs px-5 py-2.5 min-h-[38px] rounded-[18px]"
            >
              <span>View in Patient Status Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/cases"
              className="clay-btn-secondary text-xs px-5 py-2.5 min-h-[38px] rounded-[18px]"
            >
              <span>Return to Triage Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {errorMessage && (
        <div role="alert" className="p-4 rounded-[20px] bg-rose-500/15 border border-rose-300 text-rose-900 text-xs font-bold flex items-center gap-2 shadow-clayPill">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Previously Recorded Reviews on this Case */}
      {existingReviews.length > 0 && (
        <div className="p-5 rounded-[28px] bg-[#EFEBF5] shadow-clayPressed space-y-3">
          <div className="flex items-center justify-between border-b border-purple-200/60 pb-2">
            <span className="text-xs font-black text-[#332F3A] uppercase tracking-wide flex items-center gap-2 font-heading">
              <CheckCircle2 className="w-4 h-4 text-[#7C3AED]" />
              Recorded Clinical Reviews ({existingReviews.length}):
            </span>
            <span className="clay-pill bg-emerald-500/15 text-emerald-900 text-[10px]">
              Active in Case Record
            </span>
          </div>

          <div className="space-y-2.5">
            {existingReviews.map((rev, idx) => (
              <div key={rev.id || idx} className="p-4 rounded-[20px] bg-white/90 shadow-clayPill text-xs space-y-2 border border-white">
                <div className="flex items-center justify-between text-[#635F69] text-xs">
                  <span className="font-bold text-[#332F3A] flex items-center gap-1.5 font-heading">
                    <User className="w-3.5 h-3.5 text-[#7C3AED]" />
                    {rev.clinician_name || 'Attending Physician'}
                  </span>
                  <span className="font-mono flex items-center gap-1 font-bold">
                    <Clock className="w-3 h-3" />
                    {new Date(rev.reviewed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[#332F3A] bg-[#FAF8FD] p-3 rounded-2xl text-xs font-medium whitespace-pre-wrap">
                  "{rev.review_notes}"
                </p>
                <div className="flex items-center gap-2 text-xs pt-1 text-[#635F69] font-medium">
                  <span>Disposition:</span>
                  <span className="clay-pill bg-violet-100 text-[#7C3AED] text-[10px] py-0.5">{rev.clinical_status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clinician Entry Form */}
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div>
          <label htmlFor="clinician-notes" className="block text-xs font-bold text-[#332F3A] mb-1.5 font-heading">
            {existingReviews.length > 0
              ? 'Add Further Observations & Treatment Instructions:'
              : 'Attending Clinician Observations & Management Notes:'}
          </label>
          <textarea
            id="clinician-notes"
            rows={4}
            required
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Document physical examination findings, clinical impressions, bedside tests, and prescribed actions..."
            className="clay-input rounded-[22px] p-4 text-xs leading-relaxed"
          />
        </div>

        {/* Verification Checkbox */}
        <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-[#332F3A] select-none">
          <input
            type="checkbox"
            checked={verifiedInformation}
            onChange={(e) => setVerifiedInformation(e.target.checked)}
            className="w-4 h-4 text-[#7C3AED] rounded accent-[#7C3AED]"
          />
          <span>I have verified the patient-reported statements and structured triage synthesis.</span>
        </label>

        {/* Disposition Selector */}
        <div className="pt-4 border-t border-purple-100">
          <span className="block text-xs font-black text-[#332F3A] mb-3 font-heading">
            Clinical Disposition / Next Step:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold font-heading">
            <button
              type="button"
              onClick={() => setSelectedDisposition('REVIEWED')}
              className={`p-4 rounded-[20px] text-center transition-all cursor-pointer ${
                selectedDisposition === 'REVIEWED'
                  ? 'bg-blue-500/15 border-2 border-blue-500 text-blue-900 shadow-clayPill -translate-y-1'
                  : 'bg-white shadow-clayPill text-[#635F69] hover:bg-slate-50'
              } active:scale-95`}
            >
              <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-blue-600" />
              Reviewed (Routine)
            </button>

            <button
              type="button"
              onClick={() => setSelectedDisposition('ESCALATED')}
              className={`p-4 rounded-[20px] text-center transition-all cursor-pointer ${
                selectedDisposition === 'ESCALATED'
                  ? 'bg-rose-500/15 border-2 border-rose-500 text-rose-900 shadow-clayPill -translate-y-1'
                  : 'bg-white shadow-clayPill text-[#635F69] hover:bg-slate-50'
              } active:scale-95`}
            >
              <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-rose-600" />
              Escalate Case
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedDisposition('REFERRED');
                onOpenReferralModal();
              }}
              className={`p-4 rounded-[20px] text-center transition-all cursor-pointer ${
                selectedDisposition === 'REFERRED'
                  ? 'bg-purple-500/15 border-2 border-purple-500 text-purple-900 shadow-clayPill -translate-y-1'
                  : 'bg-white shadow-clayPill text-[#635F69] hover:bg-slate-50'
              } active:scale-95`}
            >
              <FileText className="w-5 h-5 mx-auto mb-1 text-purple-600" />
              Prepare Referral
            </button>

            <button
              type="button"
              onClick={() => setSelectedDisposition('COMPLETED')}
              className={`p-4 rounded-[20px] text-center transition-all cursor-pointer ${
                selectedDisposition === 'COMPLETED'
                  ? 'bg-emerald-500/15 border-2 border-emerald-500 text-emerald-900 shadow-clayPill -translate-y-1'
                  : 'bg-white shadow-clayPill text-[#635F69] hover:bg-slate-50'
              } active:scale-95`}
            >
              <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
              Complete & Close
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-purple-100">
          <button
            type="button"
            onClick={onOpenReferralModal}
            className="clay-btn-secondary w-full sm:w-auto text-xs px-6 py-3 h-12 rounded-[18px]"
          >
            <FileText className="w-4 h-4 text-[#7C3AED]" />
            <span>Generate Structured Referral Note</span>
          </button>

          <button
            type="submit"
            disabled={!notes.trim() || isSubmittingLocal}
            className="clay-btn-primary w-full sm:w-auto text-xs px-7 py-3 h-12 rounded-[18px] disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmittingLocal ? 'Recording Decision...' : 'Submit Clinician Decision'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
