// JANSAATHI AI - Missing Information Engine
// Deterministically inspects extracted patient information and identifies objective clinical gaps.
// Distinguishes: Known, Unknown, Patient did not provide, Needs verification.

import { TriageExtraction } from '../../types';

export interface MissingGap {
  category: 'DURATION' | 'SEVERITY' | 'MEDICATIONS' | 'ALLERGIES' | 'VITALS' | 'MEDICAL_HISTORY' | 'ASSOCIATED_SYMPTOMS';
  label: string;
  status: 'KNOWN' | 'PATIENT_DID_NOT_PROVIDE' | 'NEEDS_VERIFICATION';
  explanation: string;
}

export class MissingInformationEngine {
  public static analyze(extraction: Partial<TriageExtraction>, hasVitals: boolean): MissingGap[] {
    const gaps: MissingGap[] = [];

    // 1. Duration check
    if (!extraction.duration || extraction.duration.toLowerCase().includes('not specified') || extraction.duration.trim() === '') {
      gaps.push({
        category: 'DURATION',
        label: 'Symptom Onset and Duration',
        status: 'PATIENT_DID_NOT_PROVIDE',
        explanation: 'Patient has not stated exact hours, days, or timeline since symptoms started.',
      });
    } else {
      gaps.push({
        category: 'DURATION',
        label: 'Symptom Onset and Duration',
        status: 'KNOWN',
        explanation: `Reported as "${extraction.duration}".`,
      });
    }

    // 2. Severity check
    if (!extraction.reported_severity || extraction.reported_severity === 'UNSPECIFIED') {
      gaps.push({
        category: 'SEVERITY',
        label: 'Reported Severity',
        status: 'PATIENT_DID_NOT_PROVIDE',
        explanation: 'Patient did not classify severity (mild, moderate, or severe).',
      });
    } else {
      gaps.push({
        category: 'SEVERITY',
        label: 'Reported Severity',
        status: 'KNOWN',
        explanation: `Reported as ${extraction.reported_severity}.`,
      });
    }

    // 3. Current Medications
    if (!extraction.medications_reported || extraction.medications_reported.length === 0) {
      gaps.push({
        category: 'MEDICATIONS',
        label: 'Current Medications',
        status: 'PATIENT_DID_NOT_PROVIDE',
        explanation: 'No current prescription or over-the-counter medications were explicitly mentioned.',
      });
    } else {
      gaps.push({
        category: 'MEDICATIONS',
        label: 'Current Medications',
        status: 'KNOWN',
        explanation: `${extraction.medications_reported.length} medication(s) reported by patient.`,
      });
    }

    // 4. Known Allergies
    if (!extraction.allergies_reported || extraction.allergies_reported.length === 0) {
      gaps.push({
        category: 'ALLERGIES',
        label: 'Known Allergies',
        status: 'NEEDS_VERIFICATION',
        explanation: 'Drug or food allergies not reported. Health worker should verify before treatment.',
      });
    } else {
      gaps.push({
        category: 'ALLERGIES',
        label: 'Known Allergies',
        status: 'KNOWN',
        explanation: extraction.allergies_reported.join(', '),
      });
    }

    // 5. Objective Vitals
    if (!hasVitals) {
      gaps.push({
        category: 'VITALS',
        label: 'Objective Vital Signs (SpO2, Pulse, Temp)',
        status: 'NEEDS_VERIFICATION',
        explanation: 'No hardware telemetry or measured vital readings recorded for this case yet.',
      });
    } else {
      gaps.push({
        category: 'VITALS',
        label: 'Objective Vital Signs',
        status: 'KNOWN',
        explanation: 'Hardware telemetry recorded.',
      });
    }

    // 6. Medical History / Co-morbidities
    if (!extraction.medical_history || extraction.medical_history.length === 0) {
      gaps.push({
        category: 'MEDICAL_HISTORY',
        label: 'Past Medical History & Chronic Conditions',
        status: 'PATIENT_DID_NOT_PROVIDE',
        explanation: 'History of diabetes, hypertension, asthma, or cardiac disease was not recorded.',
      });
    } else {
      gaps.push({
        category: 'MEDICAL_HISTORY',
        label: 'Past Medical History',
        status: 'KNOWN',
        explanation: extraction.medical_history.join(', '),
      });
    }

    return gaps;
  }
}
