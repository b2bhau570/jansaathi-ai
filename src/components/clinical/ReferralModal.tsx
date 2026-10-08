// JANSAATHI AI - Structured Clinical Referral Note Generator & Authorization Modal
// Compiles multi-provenance data into a clinical transfer document authorized by a qualified doctor.

import React, { useState } from 'react';
import { TriageCase, ReferralNote } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { FileText, Printer, Check, X, ShieldAlert, Building2 } from 'lucide-react';

interface ReferralModalProps {
  triageCase: TriageCase;
  isOpen: boolean;
  onClose: () => void;
  onSaveReferral: (referral: ReferralNote) => Promise<void>;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({
  triageCase,
  isOpen,
  onClose,
  onSaveReferral,
}) => {
  const { user } = useAuth();

  const [receivingFacility, setReceivingFacility] = useState('District Headquarters Hospital, Dept of Medicine');
  const [reasonForReferral, setReasonForReferral] = useState(
    triageCase.urgency_flags && triageCase.urgency_flags.length > 0
      ? `Urgent specialist evaluation required for: ${triageCase.urgency_flags.map((f) => f.rule_code).join(', ')}`
      : 'Specialist clinical assessment and further diagnostic investigations required.'
  );
  const [clinicalSummary, setClinicalSummary] = useState(
    `Patient presents with ${triageCase.primary_concern || 'unspecified complaints'}, reported duration: ${
      triageCase.reported_duration || 'not specified'
    }. Symptoms include: ${triageCase.extractions?.symptoms.join(', ') || 'none listed'}.`
  );
  const [clinicianName, setClinicianName] = useState(user?.fullName || 'Dr. Attending Medical Officer');
  const [clinicianReg, setClinicianReg] = useState('WB-64921-MCI');
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  if (!isOpen) return null;

  const handleAuthorize = async () => {
    setIsAuthorizing(true);
    const now = new Date().toISOString();

    const referralDoc: ReferralNote = {
      id: `ref-${Date.now()}`,
      case_id: triageCase.id,
      case_number: triageCase.case_number,
      referring_facility_name: user?.facilityName || 'Primary Health Centre #4',
      receiving_facility_name: receivingFacility,
      reason_for_referral: reasonForReferral,
      clinician_name: clinicianName,
      clinician_registration: clinicianReg,
      clinical_summary: clinicalSummary,
      reported_symptoms: triageCase.extractions?.symptoms || [],
      urgency_signals: triageCase.urgency_flags?.map((f) => f.detected_signal) || [],
      vital_readings:
        triageCase.hardware_readings?.map((v) => `${v.reading_type}: ${v.numerical_value} ${v.unit}`) || [],
      status: 'AUTHORISED',
      authorised_at: now,
      created_at: now,
    };

    await onSaveReferral(referralDoc);
    setIsAuthorizing(false);
    onClose();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="referral-modal-title"
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white rounded border border-slate-300 shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-teal-800" />
            <h2 id="referral-modal-title" className="text-base font-bold text-slate-900">
              Structured Clinical Referral Note & Transfer Order
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-slate-800 rounded"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Official Header */}
          <div className="p-4 bg-slate-50 rounded border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
              <span className="font-bold text-slate-900 text-sm">JANSAATHI CLINICAL TRANSFER NOTE</span>
              <span className="font-mono text-slate-700 font-semibold">{triageCase.case_number}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-700">
              <div>
                <strong>Referring Centre:</strong> {user?.facilityName || 'District Community Health Centre'}
              </div>
              <div>
                <strong>Date & Time:</strong> {new Date().toLocaleString()}
              </div>
            </div>
          </div>

          {/* Receiving Facility Selection */}
          <div>
            <label htmlFor="receiving-fac" className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-teal-700" />
              <span>Receiving Healthcare Facility / Speciality Department:</span>
            </label>
            <input
              id="receiving-fac"
              type="text"
              value={receivingFacility}
              onChange={(e) => setReceivingFacility(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded text-xs text-slate-900 focus:ring-1 focus:ring-teal-700"
            />
          </div>

          {/* Reason for Referral */}
          <div>
            <label htmlFor="referral-reason" className="block font-bold text-slate-800 mb-1">
              Primary Reason for Clinical Referral:
            </label>
            <textarea
              id="referral-reason"
              rows={2}
              value={reasonForReferral}
              onChange={(e) => setReasonForReferral(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded text-xs text-slate-900 focus:ring-1 focus:ring-teal-700"
            />
          </div>

          {/* Comprehensive Clinical Summary */}
          <div>
            <label htmlFor="clinical-summary" className="block font-bold text-slate-800 mb-1">
              Structured Clinical Summary (Triage Symptoms & Objective Findings):
            </label>
            <textarea
              id="clinical-summary"
              rows={4}
              value={clinicalSummary}
              onChange={(e) => setClinicalSummary(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded text-xs text-slate-900 focus:ring-1 focus:ring-teal-700 font-mono text-[11px]"
            />
          </div>

          {/* Clinician Signature / Verification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded border border-slate-200">
            <div>
              <label htmlFor="doctor-name" className="block font-semibold text-slate-700 mb-1">
                Referring Clinician Name:
              </label>
              <input
                id="doctor-name"
                type="text"
                value={clinicianName}
                onChange={(e) => setClinicianName(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
              />
            </div>
            <div>
              <label htmlFor="doctor-reg" className="block font-semibold text-slate-700 mb-1">
                Medical Council Registration #:
              </label>
              <input
                id="doctor-reg"
                type="text"
                value={clinicianReg}
                onChange={(e) => setClinicianReg(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
              />
            </div>
          </div>

          {/* Medical Legal Disclaimer */}
          <div className="p-3 bg-amber-50 rounded border border-amber-300 text-amber-950 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              This referral note is drafted by triage software and legally authorized by the signing medical practitioner.
              It does not establish an automated hospital bed reservation unless verified by telephone/secure protocol.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded text-xs font-semibold"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Note
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAuthorize}
              disabled={isAuthorizing}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-teal-800 hover:bg-teal-700 text-white rounded text-xs font-semibold shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isAuthorizing ? 'Authorizing...' : 'Authorize Referral Note'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
