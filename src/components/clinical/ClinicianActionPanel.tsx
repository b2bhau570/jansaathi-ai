// JANSAATHI AI - Clinician Review Actions & Final Disposition Panel
// Human-in-the-loop decision capture. Records clinician-entered observations and dispositions.

import React, { useState } from 'react';
import { UserCheck, Send, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

interface ClinicianActionPanelProps {
  caseId: string;
  onCompleteReview: (notes: string, status: 'REVIEWED' | 'ESCALATED' | 'REFERRED' | 'COMPLETED') => Promise<void>;
  onOpenReferralModal: () => void;
  isSubmitting?: boolean;
}

export const ClinicianActionPanel: React.FC<ClinicianActionPanelProps> = ({
  onCompleteReview,
  onOpenReferralModal,
  isSubmitting = false,
}) => {
  const [notes, setNotes] = useState('');
  const [selectedDisposition, setSelectedDisposition] = useState<'REVIEWED' | 'ESCALATED' | 'REFERRED' | 'COMPLETED'>('REVIEWED');
  const [verifiedInformation, setVerifiedInformation] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) return;
    await onCompleteReview(notes, selectedDisposition);
  };

  return (
    <div className="bg-white rounded border border-slate-300 p-5 shadow-xs mb-6">
      <div className="flex items-center space-x-2 pb-3 border-b border-slate-200">
        <UserCheck className="w-5 h-5 text-teal-800" />
        <div>
          <h3 className="text-base font-bold text-slate-900">Qualified Clinician Assessment & Disposition</h3>
          <p className="text-xs text-slate-500">
            A registered healthcare professional must review and document clinical findings.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {/* Clinician Notes Entry */}
        <div>
          <label htmlFor="clinician-notes" className="block text-xs font-bold text-slate-800 mb-1">
            Attending Clinician Observations & Management Notes:
          </label>
          <textarea
            id="clinician-notes"
            rows={4}
            required
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Document physical examination findings, clinical impressions, bedside tests, and prescribed actions..."
            className="w-full p-3 border border-slate-300 rounded text-sm text-slate-900 leading-relaxed focus:ring-1 focus:ring-teal-700 bg-slate-50/50"
          />
        </div>

        {/* Verification Checkbox */}
        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-800">
          <input
            type="checkbox"
            checked={verifiedInformation}
            onChange={(e) => setVerifiedInformation(e.target.checked)}
            className="w-4 h-4 text-teal-700 rounded border-slate-300 focus:ring-teal-600"
          />
          <span>I have verified the patient-reported statements and structured triage synthesis.</span>
        </label>

        {/* Disposition Selector */}
        <div className="pt-3 border-t border-slate-200">
          <span className="block text-xs font-bold text-slate-800 mb-2">
            Clinical Disposition / Next Step:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setSelectedDisposition('REVIEWED')}
              className={`p-2.5 rounded border text-center transition-colors ${
                selectedDisposition === 'REVIEWED'
                  ? 'bg-blue-50 border-blue-600 text-blue-900 ring-1 ring-blue-600'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-blue-600" />
              Reviewed (Routine)
            </button>

            <button
              type="button"
              onClick={() => setSelectedDisposition('ESCALATED')}
              className={`p-2.5 rounded border text-center transition-colors ${
                selectedDisposition === 'ESCALATED'
                  ? 'bg-red-50 border-red-600 text-red-900 ring-1 ring-red-600'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <AlertTriangle className="w-4 h-4 mx-auto mb-1 text-red-600" />
              Escalate Case
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedDisposition('REFERRED');
                onOpenReferralModal();
              }}
              className={`p-2.5 rounded border text-center transition-colors ${
                selectedDisposition === 'REFERRED'
                  ? 'bg-purple-50 border-purple-600 text-purple-900 ring-1 ring-purple-600'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <FileText className="w-4 h-4 mx-auto mb-1 text-purple-600" />
              Prepare Referral
            </button>

            <button
              type="button"
              onClick={() => setSelectedDisposition('COMPLETED')}
              className={`p-2.5 rounded border text-center transition-colors ${
                selectedDisposition === 'COMPLETED'
                  ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-1 ring-emerald-600'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
              Complete & Close
            </button>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onOpenReferralModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded text-xs font-semibold transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            Generate Structured Referral Note
          </button>

          <button
            type="submit"
            disabled={!notes.trim() || isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 bg-teal-800 hover:bg-teal-700 text-white rounded text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Recording Action...' : 'Submit Clinician Decision'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
