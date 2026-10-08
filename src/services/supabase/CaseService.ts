// JANSAATHI AI - Case Management Service
// Real case persistence, anonymous case ID generation, and multi-provenance data management.
// Starts with ZERO fake data. Completely empty queue unless created by real user workflows.

import { supabase, isSupabaseConfigured } from './supabaseClient';
import {
  TriageCase,
  PatientInput,
  TriageExtraction,
  UrgencyFlag,
  HardwareReading,
  ReportDocument,
  ClinicianReview,
  ReferralNote,
  CaseStatus,
} from '../../types';
import { AuditService } from './AuditService';

const LOCAL_CASES_STORAGE_KEY = 'jansaathi_cases_store';

export class CaseService {
  // Generate human-readable anonymous case ID (e.g. P-2026-000001)
  public static generateCaseNumber(): string {
    const year = new Date().getFullYear();
    const existing = this.getLocalCases();
    const nextSeq = existing.length + 1;
    const padded = String(nextSeq).padStart(6, '0');
    return `P-${year}-${padded}`;
  }

  public static getLocalCases(): TriageCase[] {
    try {
      const raw = localStorage.getItem(LOCAL_CASES_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private static saveLocalCases(cases: TriageCase[]) {
    try {
      localStorage.setItem(LOCAL_CASES_STORAGE_KEY, JSON.stringify(cases));
    } catch (e) {
      console.error('Local storage write failed:', e);
    }
  }

  // Create new triage case from patient submission
  public static async createCase(params: {
    language: string;
    rawText: string;
    inputType: 'VOICE' | 'TEXT' | 'REPORT_IMAGE' | 'HARDWARE';
    extraction: TriageExtraction;
    urgencyFlags: UrgencyFlag[];
    hardwareReadings?: HardwareReading[];
    reports?: ReportDocument[];
  }): Promise<TriageCase> {
    const caseId = `case-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const caseNumber = this.generateCaseNumber();
    const now = new Date().toISOString();

    const priorityLevel = params.urgencyFlags.some((f) => f.priority === 'URGENT_REVIEW')
      ? 'URGENT_REVIEW'
      : params.urgencyFlags.some((f) => f.priority === 'PRIORITY_REVIEW')
      ? 'PRIORITY_REVIEW'
      : 'ROUTINE_REVIEW';

    const newCase: TriageCase = {
      id: caseId,
      case_number: caseNumber,
      input_language: params.language,
      status: 'READY_FOR_REVIEW',
      priority_level: priorityLevel,
      primary_concern: params.extraction.chief_complaint,
      reported_duration: params.extraction.duration,
      created_at: now,
      updated_at: now,
      inputs: [
        {
          id: `inp-${Date.now()}`,
          case_id: caseId,
          input_type: params.inputType,
          raw_content: params.rawText,
          original_language: params.language,
          created_at: now,
        },
      ],
      extractions: params.extraction,
      urgency_flags: params.urgencyFlags,
      hardware_readings: params.hardwareReadings || [],
      reports: params.reports || [],
    };

    // 1. If Supabase is configured, insert to PostgreSQL
    if (isSupabaseConfigured) {
      try {
        await supabase.from('triage_cases').insert({
          id: newCase.id,
          case_number: newCase.case_number,
          input_language: newCase.input_language,
          status: newCase.status,
          priority_level: newCase.priority_level,
          primary_concern: newCase.primary_concern,
          reported_duration: newCase.reported_duration,
        });

        await supabase.from('patient_inputs').insert({
          case_id: newCase.id,
          input_type: params.inputType,
          raw_content: params.rawText,
          original_language: params.language,
        });

        await supabase.from('triage_extractions').insert({
          case_id: newCase.id,
          language: params.extraction.language,
          chief_complaint: params.extraction.chief_complaint,
          symptoms: params.extraction.symptoms,
          duration: params.extraction.duration,
          timeline: params.extraction.timeline,
          reported_severity: params.extraction.reported_severity,
          associated_symptoms: params.extraction.associated_symptoms,
          medical_history: params.extraction.medical_history,
          medications_reported: params.extraction.medications_reported,
          allergies_reported: params.extraction.allergies_reported,
          missing_information: params.extraction.missing_information,
          follow_up_questions: params.extraction.follow_up_questions,
          uncertainties: params.extraction.uncertainties,
          source_references: params.extraction.source_references,
          ai_provider: params.extraction.ai_provider,
          model_version: params.extraction.model_version,
        });

        if (params.urgencyFlags.length > 0) {
          for (const flag of params.urgencyFlags) {
            await supabase.from('urgency_flags').insert({
              case_id: newCase.id,
              rule_code: flag.rule_code,
              detected_signal: flag.detected_signal,
              priority: flag.priority,
              explanation: flag.explanation,
              source_reference: flag.source_reference,
            });
          }
        }
      } catch (err) {
        console.warn('Supabase case insertion error (persisted locally):', err);
      }
    }

    // 2. Persist locally
    const cases = this.getLocalCases();
    cases.unshift(newCase);
    this.saveLocalCases(cases);

    // 3. Immutable audit trail
    await AuditService.logEvent(
      'CASE_CREATED',
      'patient',
      {
        case_number: caseNumber,
        language: params.language,
        priority: priorityLevel,
        flags_count: params.urgencyFlags.length,
      },
      caseId
    );

    return newCase;
  }

  // Fetch all cases for clinical triage queue
  public static async getAllCases(): Promise<TriageCase[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('triage_cases')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data as TriageCase[];
        }
      } catch (err) {
        console.warn('Supabase fetch error, using local storage:', err);
      }
    }

    return this.getLocalCases();
  }

  // Fetch case by ID
  public static async getCaseById(id: string): Promise<TriageCase | null> {
    const local = this.getLocalCases().find((c) => c.id === id || c.case_number === id);
    if (local) return local;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('triage_cases').select('*').eq('id', id).single();
        if (!error && data) {
          return data as TriageCase;
        }
      } catch {
        // Fall through
      }
    }

    return null;
  }

  // Update case status
  public static async updateCaseStatus(
    id: string,
    status: CaseStatus,
    actorRole = 'clinician',
    actorName = 'Dr. Reviewer'
  ): Promise<void> {
    const cases = this.getLocalCases();
    const target = cases.find((c) => c.id === id);
    if (target) {
      target.status = status;
      target.updated_at = new Date().toISOString();
      this.saveLocalCases(cases);
    }

    if (isSupabaseConfigured) {
      try {
        await supabase.from('triage_cases').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
      } catch (err) {
        console.warn('Supabase status update error:', err);
      }
    }

    await AuditService.logEvent(
      'CASE_ASSIGNED',
      actorRole,
      { new_status: status, reviewer: actorName },
      id
    );
  }

  // Submit clinician review notes and corrections
  public static async addClinicianReview(
    caseId: string,
    review: Omit<ClinicianReview, 'id' | 'reviewed_at'>
  ): Promise<void> {
    const now = new Date().toISOString();
    const fullReview: ClinicianReview = {
      ...review,
      id: `rev-${Date.now()}`,
      reviewed_at: now,
    };

    const cases = this.getLocalCases();
    const target = cases.find((c) => c.id === caseId);
    if (target) {
      if (!target.clinician_reviews) target.clinician_reviews = [];
      target.clinician_reviews.push(fullReview);
      target.status = 'COMPLETED';
      target.updated_at = now;
      this.saveLocalCases(cases);
    }

    if (isSupabaseConfigured) {
      try {
        await supabase.from('clinician_reviews').insert({
          case_id: caseId,
          clinician_id: review.clinician_id,
          review_notes: review.review_notes,
          corrections_made: review.corrections_made || {},
          clinical_status: review.clinical_status,
          verified_extractions: review.verified_extractions,
        });
        await supabase.from('triage_cases').update({ status: 'COMPLETED', updated_at: now }).eq('id', caseId);
      } catch (err) {
        console.warn('Supabase clinician review insert error:', err);
      }
    }

    await AuditService.logEvent(
      'CASE_COMPLETED',
      'clinician',
      { clinician_id: review.clinician_id, clinical_status: review.clinical_status },
      caseId
    );
  }

  // Create or authorize referral
  public static async saveReferral(caseId: string, referral: ReferralNote): Promise<void> {
    const cases = this.getLocalCases();
    const target = cases.find((c) => c.id === caseId);
    if (target) {
      target.referral = referral;
      target.status = 'REFERRED';
      target.updated_at = new Date().toISOString();
      this.saveLocalCases(cases);
    }

    if (isSupabaseConfigured) {
      try {
        await supabase.from('referrals').insert({
          case_id: caseId,
          receiving_facility_name: referral.receiving_facility_name,
          reason_for_referral: referral.reason_for_referral,
          clinician_id: referral.clinician_name,
          referral_note: referral.clinical_summary,
          status: referral.status,
          authorised_at: referral.authorised_at,
        });
        await supabase.from('triage_cases').update({ status: 'REFERRED' }).eq('id', caseId);
      } catch (err) {
        console.warn('Supabase referral insert error:', err);
      }
    }

    await AuditService.logEvent(
      'REFERRAL_AUTHORISED',
      'clinician',
      {
        referral_to: referral.receiving_facility_name,
        doctor: referral.clinician_name,
        status: referral.status,
      },
      caseId
    );
  }
}
