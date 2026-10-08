// JANSAATHI AI - Deterministic Urgency Rule Engine Unit Tests
// Tests required by Specification Section 77:
// Positive trigger, Negative case, Missing information, Malformed input, Multiple simultaneous flags, Conflicting information, Uncertain language.

import { describe, it, expect } from 'vitest';
import { DeterministicUrgencyEngine } from '../src/services/urgency/DeterministicUrgencyEngine';
import { HardwareReading } from '../src/types';

describe('DeterministicUrgencyEngine', () => {
  const engine = new DeterministicUrgencyEngine();

  // 1. Positive Trigger Tests
  it('triggers RULE_CHEST_PAIN for explicit acute chest pain', () => {
    const result = engine.evaluate({
      caseId: 'test-case-1',
      patientStatements: ['Patient reports severe crushing chest pain since 2 hours ago.'],
    });

    expect(result.priorityLevel).toBe('URGENT_REVIEW');
    expect(result.flags.some((f) => f.rule_code === 'RULE_CHEST_PAIN')).toBe(true);
    expect(result.flags[0].explanation).toContain('Qualified healthcare professional review is required');
  });

  it('triggers RULE_RESPIRATORY_DISTRESS for breathing difficulty', () => {
    const result = engine.evaluate({
      caseId: 'test-case-2',
      patientStatements: ['Patient says they cannot breathe and are gasping for air.'],
    });

    expect(result.priorityLevel).toBe('URGENT_REVIEW');
    expect(result.flags.some((f) => f.rule_code === 'RULE_RESPIRATORY_DISTRESS')).toBe(true);
  });

  it('triggers RULE_NEURO_DEFICIT for stroke signs (FAST signals)', () => {
    const result = engine.evaluate({
      caseId: 'test-case-3',
      patientStatements: ['Attendant noticed sudden face drooping and slurred speech.'],
    });

    expect(result.priorityLevel).toBe('URGENT_REVIEW');
    expect(result.flags.some((f) => f.rule_code === 'RULE_NEURO_DEFICIT')).toBe(true);
  });

  it('triggers RULE_UNCONTROLLED_BLEEDING for hematemesis', () => {
    const result = engine.evaluate({
      caseId: 'test-case-4',
      patientStatements: ['Patient had three episodes of vomiting blood today.'],
    });

    expect(result.priorityLevel).toBe('URGENT_REVIEW');
    expect(result.flags.some((f) => f.rule_code === 'RULE_UNCONTROLLED_BLEEDING')).toBe(true);
  });

  it('triggers RULE_VITAL_HYPOXIA when measured SpO2 < 92%', () => {
    const vitals: HardwareReading[] = [
      {
        id: 'vit-1',
        reading_type: 'SPO2',
        numerical_value: 88,
        unit: '%',
        is_stable: true,
        measured_at: new Date().toISOString(),
      },
    ];

    const result = engine.evaluate({
      caseId: 'test-case-5',
      patientStatements: ['Feeling mild cough.'],
      vitals,
    });

    expect(result.priorityLevel).toBe('URGENT_REVIEW');
    expect(result.flags.some((f) => f.rule_code === 'RULE_VITAL_HYPOXIA')).toBe(true);
    expect(result.flags.find((f) => f.rule_code === 'RULE_VITAL_HYPOXIA')?.detected_signal).toContain('88%');
  });

  // 2. Negative Cases (Routine)
  it('assigns ROUTINE_REVIEW for non-urgent benign symptoms', () => {
    const result = engine.evaluate({
      caseId: 'test-case-6',
      patientStatements: ['Mild runny nose and sneezing since yesterday.'],
    });

    expect(result.priorityLevel).toBe('ROUTINE_REVIEW');
    expect(result.flags.length).toBe(0);
  });

  // 3. Missing Information
  it('handles empty patient statements gracefully', () => {
    const result = engine.evaluate({
      caseId: 'test-case-7',
      patientStatements: [],
    });

    expect(result.priorityLevel).toBe('UNCLASSIFIED');
    expect(result.flags.length).toBe(0);
  });

  // 4. Malformed Input
  it('handles malformed or whitespace statements without throwing', () => {
    const result = engine.evaluate({
      caseId: 'test-case-8',
      patientStatements: ['', '   ', '.,!?'],
    });

    expect(result.priorityLevel).toBe('ROUTINE_REVIEW');
    expect(result.flags.length).toBe(0);
  });

  // 5. Multiple Simultaneous Flags
  it('captures multiple simultaneous red flags correctly', () => {
    const vitals: HardwareReading[] = [
      {
        id: 'vit-2',
        reading_type: 'SPO2',
        numerical_value: 85,
        unit: '%',
        is_stable: true,
        measured_at: new Date().toISOString(),
      },
    ];

    const result = engine.evaluate({
      caseId: 'test-case-9',
      patientStatements: ['Crushing chest pain and struggling to breathe.'],
      vitals,
    });

    expect(result.priorityLevel).toBe('URGENT_REVIEW');
    expect(result.flags.length).toBeGreaterThanOrEqual(3);
    const codes = result.flags.map((f) => f.rule_code);
    expect(codes).toContain('RULE_CHEST_PAIN');
    expect(codes).toContain('RULE_RESPIRATORY_DISTRESS');
    expect(codes).toContain('RULE_VITAL_HYPOXIA');
  });

  // 6. Multilingual Keyword Detection
  it('triggers RULE_CHEST_PAIN for Hindi phrasing (chhati me dard)', () => {
    const result = engine.evaluate({
      caseId: 'test-case-10',
      patientStatements: ['Mujhe subah se chhati me dard ho raha hai.'],
    });

    expect(result.priorityLevel).toBe('URGENT_REVIEW');
    expect(result.flags.some((f) => f.rule_code === 'RULE_CHEST_PAIN')).toBe(true);
  });
});
