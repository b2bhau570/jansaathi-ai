// JANSAATHI AI - Live Integration Verification for Gemini AI Assistant
import { describe, it, expect } from 'vitest';
import { GeminiProvider } from '../src/services/ai/GeminiProvider';
import { SchemaValidator } from '../src/services/ai/SchemaValidator';
import { DeterministicUrgencyEngine } from '../src/services/urgency/DeterministicUrgencyEngine';

describe('Live Gemini Assistant Integration', () => {
  const apiKey = process.env.VITE_GEMINI_API_KEY || 'TEST_GEMINI_API_KEY_PLACEHOLDER';
  const provider = new GeminiProvider(apiKey);
  const urgencyEngine = new DeterministicUrgencyEngine();

  it('connects to Gemini API and extracts structured clinical triage note', async () => {
    const rawPatientStatement =
      'Patient reports severe crushing chest pain radiating to the left arm and severe shortness of breath since 2 hours ago. Has taken one paracetamol without relief.';

    const extraction = await provider.extractTriageInformation({
      caseId: 'live-test-001',
      language: 'en',
      rawText: rawPatientStatement,
    });

    console.log('Live Gemini Extraction Result:', JSON.stringify(extraction, null, 2));

    // Verify Schema validation
    expect(extraction.schema_version).toBe('1.0.0');
    expect(extraction.chief_complaint).toBeTruthy();
    expect(extraction.symptoms.length).toBeGreaterThan(0);
    expect(extraction.duration).toBeTruthy();

    // Verify non-diagnostic safety
    const validation = SchemaValidator.validate(extraction);
    expect(validation.isValid).toBe(true);

    // Test Deterministic Urgency Engine on the extracted result
    const evalResult = urgencyEngine.evaluate({
      caseId: 'live-test-001',
      patientStatements: [rawPatientStatement],
      extractedSymptoms: extraction.symptoms,
      reportedDuration: extraction.duration,
    });

    console.log('Deterministic Urgency Result:', evalResult.priorityLevel, evalResult.flags);

    // Chest pain and respiratory distress MUST be flagged
    expect(evalResult.priorityLevel).toBe('URGENT_REVIEW');
    const flagCodes = evalResult.flags.map((f) => f.rule_code);
    expect(flagCodes).toContain('RULE_CHEST_PAIN');
    expect(flagCodes).toContain('RULE_RESPIRATORY_DISTRESS');
  }, 15000);
});
