// JANSAATHI AI - Tesseract OCR Client-Side Service
// Real in-browser text and lab report extraction using Tesseract.js Web Worker without paid API costs

import { createWorker } from 'tesseract.js';
import { StructuredReportFinding } from '../../types';

export interface OCRProcessingResult {
  rawText: string;
  confidence: number;
  structuredFindings: StructuredReportFinding[];
  reportDate?: string;
  uncertaintyNotes?: string;
}

export class TesseractOCRService {
  private static workerPromise: Promise<any> | null = null;

  private static async getWorker(): Promise<any> {
    if (!this.workerPromise) {
      this.workerPromise = (async () => {
        const worker = await createWorker('eng');
        return worker;
      })();
    }
    return this.workerPromise;
  }

  public static async extractFromImage(
    imageSource: string | File | Blob,
    onProgress?: (progress: number, statusText: string) => void
  ): Promise<OCRProcessingResult> {
    try {
      if (onProgress) onProgress(10, 'Initializing OCR engine...');
      const worker = await this.getWorker();

      if (onProgress) onProgress(30, 'Analyzing document layout...');
      const ret = await worker.recognize(imageSource);

      if (onProgress) onProgress(85, 'Extracting laboratory parameters...');
      const rawText = ret.data.text || '';
      const confidence = (ret.data.confidence || 0) / 100;

      const structuredFindings = this.parseLabFindings(rawText);
      const reportDate = this.extractReportDate(rawText);

      let uncertaintyNotes: string | undefined;
      if (confidence < 0.65) {
        uncertaintyNotes =
          'Some report information could not be reliably extracted due to low image clarity or lighting. Please verify against the original document.';
      }

      if (onProgress) onProgress(100, 'Extraction complete');

      return {
        rawText,
        confidence,
        structuredFindings,
        reportDate,
        uncertaintyNotes,
      };
    } catch (err: any) {
      console.error('OCR Extraction error:', err);
      throw new Error(`OCR Processing failed: ${err?.message || 'Unable to read document'}`);
    }
  }

  // Deterministic parser for standard Indian laboratory report formats
  private static parseLabFindings(text: string): StructuredReportFinding[] {
    const findings: StructuredReportFinding[] = [];
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

    // Common lab tests patterns with typical units and reference ranges
    const knownTests = [
      { name: 'Hemoglobin (Hb)', regex: /(?:hemoglobin|hb)\s*[:=-]?\s*([0-9.]+)\s*(g\/dl|gm\/dl)?/i, unit: 'g/dL', normalMin: 12.0, normalMax: 17.5 },
      { name: 'Fasting Blood Sugar (FBS)', regex: /(?:fasting blood sugar|fbs|fasting glucose)\s*[:=-]?\s*([0-9.]+)\s*(mg\/dl)?/i, unit: 'mg/dL', normalMin: 70, normalMax: 100 },
      { name: 'Post-Prandial Blood Sugar (PPBS)', regex: /(?:post prandial|ppbs|pp glucose)\s*[:=-]?\s*([0-9.]+)\s*(mg\/dl)?/i, unit: 'mg/dL', normalMin: 90, normalMax: 140 },
      { name: 'Random Blood Sugar (RBS)', regex: /(?:random blood sugar|rbs)\s*[:=-]?\s*([0-9.]+)\s*(mg\/dl)?/i, unit: 'mg/dL', normalMin: 70, normalMax: 140 },
      { name: 'Total Leukocyte Count (TLC / WBC)', regex: /(?:tlc|total count|wbc count)\s*[:=-]?\s*([0-9,.]+)\s*(cells\/cumm|\/cumm)?/i, unit: 'cells/cu.mm', normalMin: 4000, normalMax: 11000 },
      { name: 'Platelet Count', regex: /(?:platelet|plt count)\s*[:=-]?\s*([0-9,.]+)\s*(lakhs|\/cumm)?/i, unit: 'lakhs/cu.mm', normalMin: 1.5, normalMax: 4.5 },
      { name: 'Serum Creatinine', regex: /(?:serum creatinine|creatinine)\s*[:=-]?\s*([0-9.]+)\s*(mg\/dl)?/i, unit: 'mg/dL', normalMin: 0.6, normalMax: 1.2 },
      { name: 'Serum Bilirubin Total', regex: /(?:total bilirubin|s\. bilirubin)\s*[:=-]?\s*([0-9.]+)\s*(mg\/dl)?/i, unit: 'mg/dL', normalMin: 0.2, normalMax: 1.2 },
      { name: 'Blood Pressure (BP)', regex: /(?:bp|blood pressure)\s*[:=-]?\s*([0-9]{2,3})\s*[\/|]\s*([0-9]{2,3})\s*(mmhg)?/i, unit: 'mmHg', normalMin: 90, normalMax: 140 },
    ];

    for (const test of knownTests) {
      for (const line of lines) {
        const match = line.match(test.regex);
        if (match) {
          const valStr = match[1].replace(/,/g, '');
          const valNum = parseFloat(valStr);
          let isAbnormal = false;
          let observedDisplay = match[1];

          if (test.name === 'Blood Pressure (BP)' && match[2]) {
            observedDisplay = `${match[1]}/${match[2]}`;
            const sys = parseInt(match[1]);
            const dia = parseInt(match[2]);
            if (sys > 140 || sys < 90 || dia > 90 || dia < 60) {
              isAbnormal = true;
            }
          } else if (!isNaN(valNum)) {
            if (valNum < test.normalMin || valNum > test.normalMax) {
              isAbnormal = true;
            }
          }

          findings.push({
            test_name: test.name,
            observed_value: observedDisplay,
            unit: test.unit,
            reference_range: `${test.normalMin} - ${test.normalMax} ${test.unit}`,
            is_abnormal: isAbnormal,
          });
          break; // Found this test
        }
      }
    }

    return findings;
  }

  private static extractReportDate(text: string): string | undefined {
    // Look for common date formats: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
    const dateRegex = /\b(\d{1,2}[-/.](?:\d{1,2}|[a-zA-Z]{3})[-/.](?:20\d{2}|\d{2}))\b/;
    const match = text.match(dateRegex);
    return match ? match[1] : undefined;
  }
}
