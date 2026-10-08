// JANSAATHI AI - Strict Schema & Safety Validator
// Ensures all extracted data conforms strictly to the schema and contains ZERO medical diagnoses or prescriptions.

import { TriageExtraction } from '../../types';

export class SchemaValidator {
  private static FORBIDDEN_WORDS = [
    'diagnosis:',
    'prescribe',
    'prescription:',
    'take amoxicillin',
    'take paracetamol',
    'take ciprofloxacin',
    'probability of',
    'chance of disease',
    'confirmed disease',
    'you suffer from',
    'you definitely have',
  ];

  public static validate(data: any): { isValid: boolean; sanitized?: TriageExtraction; error?: string } {
    if (!data || typeof data !== 'object') {
      return { isValid: false, error: 'Extraction output is not a valid JSON object.' };
    }

    // Safety checks against clinical overreach
    const jsonString = JSON.stringify(data).toLowerCase();
    for (const forbidden of this.FORBIDDEN_WORDS) {
      if (jsonString.includes(forbidden)) {
        return {
          isValid: false,
          error: `Safety violation: AI output contained forbidden clinical prescription or diagnostic phrase ("${forbidden}"). Output rejected.`,
        };
      }
    }

    // Required fields check
    const chiefComplaint = typeof data.chief_complaint === 'string' ? data.chief_complaint.trim() : '';
    if (!chiefComplaint) {
      return { isValid: false, error: 'Missing or empty chief_complaint field.' };
    }

    const symptoms = Array.isArray(data.symptoms) ? data.symptoms.filter((s: any) => typeof s === 'string') : [];
    const duration = typeof data.duration === 'string' ? data.duration : 'Not specified';
    const reportedSeverity = ['MILD', 'MODERATE', 'SEVERE', 'UNSPECIFIED'].includes(data.reported_severity)
      ? data.reported_severity
      : 'UNSPECIFIED';

    const timeline = Array.isArray(data.timeline)
      ? data.timeline.map((item: any) => ({
          approximate_time: item.approximate_time || 'Recent',
          description: item.description || '',
          is_approximate: item.is_approximate !== false,
          source: item.source || 'PATIENT_VOICE',
        }))
      : [];

    const sanitized: TriageExtraction = {
      schema_version: '1.0.0',
      language: typeof data.language === 'string' ? data.language : 'en',
      chief_complaint: chiefComplaint,
      symptoms,
      duration,
      timeline,
      reported_severity: reportedSeverity,
      associated_symptoms: Array.isArray(data.associated_symptoms) ? data.associated_symptoms : [],
      medical_history: Array.isArray(data.medical_history) ? data.medical_history : [],
      medications_reported: Array.isArray(data.medications_reported) ? data.medications_reported : [],
      allergies_reported: Array.isArray(data.allergies_reported) ? data.allergies_reported : [],
      missing_information: Array.isArray(data.missing_information) ? data.missing_information : [],
      follow_up_questions: Array.isArray(data.follow_up_questions) ? data.follow_up_questions : [],
      uncertainties: Array.isArray(data.uncertainties) ? data.uncertainties : [],
      source_references: Array.isArray(data.source_references)
        ? data.source_references.map((r: any) => ({
            fact: r.fact || '',
            source: r.source || 'PATIENT_VOICE',
            source_id: r.source_id,
            confidence: r.confidence,
            extracted_at: r.extracted_at || new Date().toISOString(),
          }))
        : [],
      ai_provider: typeof data.ai_provider === 'string' ? data.ai_provider : 'system_extractor',
      model_version: typeof data.model_version === 'string' ? data.model_version : '1.0',
      extracted_at: new Date().toISOString(),
    };

    return { isValid: true, sanitized };
  }
}
