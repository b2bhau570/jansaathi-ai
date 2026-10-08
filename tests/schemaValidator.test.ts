// JANSAATHI AI - Schema & Safety Validator Unit Tests
// Ensures strict non-diagnostic boundary enforcement and schema sanitization

import { describe, it, expect } from 'vitest';
import { SchemaValidator } from '../src/services/ai/SchemaValidator';

describe('SchemaValidator', () => {
  it('validates and sanitizes well-formed extraction objects', () => {
    const validData = {
      language: 'en',
      chief_complaint: 'Fever and body ache',
      symptoms: ['Fever', 'Body ache'],
      duration: '3 days',
      reported_severity: 'MODERATE',
      timeline: [
        { approximate_time: '3 days ago', description: 'Onset of fever', is_approximate: true, source: 'PATIENT_TEXT' },
      ],
      associated_symptoms: ['Chills'],
      medical_history: ['Hypertension'],
      medications_reported: ['Paracetamol'],
      allergies_reported: [],
      missing_information: [],
      follow_up_questions: [],
      uncertainties: [],
      source_references: [],
      ai_provider: 'test-extractor',
      model_version: '1.0',
    };

    const res = SchemaValidator.validate(validData);
    expect(res.isValid).toBe(true);
    expect(res.sanitized?.chief_complaint).toBe('Fever and body ache');
    expect(res.sanitized?.reported_severity).toBe('MODERATE');
  });

  it('rejects output containing forbidden clinical diagnoses', () => {
    const unsafeData = {
      chief_complaint: 'Fever',
      symptoms: ['Fever'],
      medical_history: ['Diagnosis: Acute Malaria'],
    };

    const res = SchemaValidator.validate(unsafeData);
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('Safety violation');
  });

  it('rejects output containing forbidden medication prescriptions', () => {
    const unsafeData = {
      chief_complaint: 'Cough',
      symptoms: ['Cough'],
      prescriptions: 'Take amoxicillin 500mg twice daily',
    };

    const res = SchemaValidator.validate(unsafeData);
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('Safety violation');
  });

  it('rejects non-object or null input', () => {
    const res = SchemaValidator.validate(null);
    expect(res.isValid).toBe(false);
  });
});
