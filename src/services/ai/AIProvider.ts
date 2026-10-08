// JANSAATHI AI - AI Provider Interface
// Replaceable abstraction for structured extraction. Strict information organizer, never a doctor.

import { TriageExtraction } from '../../types';

export interface ExtractionInput {
  caseId: string;
  language: string;
  rawText: string;
  reportOcrText?: string;
  hardwareReadingsSummary?: string;
}

export interface IAIProvider {
  name: string;
  model: string;
  isAvailable(): boolean;
  extractTriageInformation(input: ExtractionInput): Promise<TriageExtraction>;
  translateText?(text: string, targetLanguage: string): Promise<string>;
}
