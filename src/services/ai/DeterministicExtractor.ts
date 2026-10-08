// JANSAATHI AI - Deterministic Local Information Extractor
// Zero-cost, 100% offline-capable NLP extractor. Guarantees safety and never makes diagnoses.

import { IAIProvider, ExtractionInput } from './AIProvider';
import { TriageExtraction, SourceReference, TimelineItem } from '../../types';
import { SchemaValidator } from './SchemaValidator';
import { MissingInformationEngine } from './MissingInformationEngine';
import { FollowUpQuestionEngine } from './FollowUpQuestionEngine';

export class DeterministicExtractor implements IAIProvider {
  public readonly name = 'JANSAATHI Deterministic Clinical Extractor';
  public readonly model = 'v1.0-deterministic-rulebase';

  public isAvailable(): boolean {
    return true; // Always available offline or without cloud API keys
  }

  public async extractTriageInformation(input: ExtractionInput): Promise<TriageExtraction> {
    const raw = (input.rawText || '').trim();
    const rawLower = raw.toLowerCase();
    const sources: SourceReference[] = [];
    const timeline: TimelineItem[] = [];

    // 1. Extract chief complaint (First sentence or primary reported symptom)
    let chiefComplaint = 'Unspecified presenting concern';
    const sentences = raw.split(/[.?!।\n]+/).map((s) => s.trim()).filter(Boolean);
    if (sentences.length > 0) {
      chiefComplaint = sentences[0];
    }
    sources.push({
      fact: chiefComplaint,
      source: 'PATIENT_TEXT',
      extracted_at: new Date().toISOString(),
    });

    // 2. Extract symptoms across languages
    const symptoms: string[] = [];
    const symptomPatterns: { term: string; canonical: string }[] = [
      { term: 'fever', canonical: 'Fever (Pyrexia)' },
      { term: 'bukhar', canonical: 'Fever (reported as bukhar)' },
      { term: 'jwara', canonical: 'Fever (reported as jwara)' },
      { term: 'cough', canonical: 'Cough' },
      { term: 'khansi', canonical: 'Cough (reported as khansi)' },
      { term: 'chest pain', canonical: 'Chest pain' },
      { term: 'chhati me dard', canonical: 'Chest pain (reported as chhati me dard)' },
      { term: 'breathless', canonical: 'Shortness of breath' },
      { term: 'saans', canonical: 'Breathing difficulty' },
      { term: 'headache', canonical: 'Headache' },
      { term: 'sar dard', canonical: 'Headache (reported as sar dard)' },
      { term: 'vomit', canonical: 'Vomiting / Nausea' },
      { term: 'ulti', canonical: 'Vomiting (reported as ulti)' },
      { term: 'loose stool', canonical: 'Diarrhea / Loose stools' },
      { term: 'dast', canonical: 'Diarrhea (reported as dast)' },
      { term: 'joint pain', canonical: 'Joint pain (Arthralgia)' },
      { term: 'jodo me dard', canonical: 'Joint pain (reported as jodo me dard)' },
      { term: 'rash', canonical: 'Skin rash' },
      { term: 'chakatte', canonical: 'Skin rash (reported as chakatte)' },
      { term: 'swelling', canonical: 'Localized swelling (Edema)' },
      { term: 'sujan', canonical: 'Swelling (reported as sujan)' },
      { term: 'weakness', canonical: 'Generalized weakness / Fatigue' },
      { term: 'kamjori', canonical: 'Weakness (reported as kamjori)' },
    ];

    for (const pat of symptomPatterns) {
      if (rawLower.includes(pat.term)) {
        if (!symptoms.includes(pat.canonical)) {
          symptoms.push(pat.canonical);
          sources.push({
            fact: pat.canonical,
            source: 'PATIENT_TEXT',
            extracted_at: new Date().toISOString(),
          });
        }
      }
    }

    if (symptoms.length === 0 && chiefComplaint) {
      symptoms.push(chiefComplaint);
    }

    // 3. Extract duration & timeline
    let duration = 'Not specified';
    const durationRegex = /(\d+)\s*(day|days|din|week|weeks|hafte|month|months|mahine|hour|hours|ghante)/i;
    const durMatch = raw.match(durationRegex);
    if (durMatch) {
      duration = durMatch[0];
      timeline.push({
        approximate_time: `Approximately ${durMatch[0]} ago`,
        description: `Patient noted symptom onset (${symptoms[0] || 'primary concern'}).`,
        is_approximate: true,
        source: 'PATIENT_TEXT',
      });
    } else if (rawLower.includes('yesterday') || rawLower.includes('kal')) {
      duration = 'Since yesterday';
      timeline.push({
        approximate_time: '1 day ago (Yesterday)',
        description: 'Patient noted symptom onset.',
        is_approximate: true,
        source: 'PATIENT_TEXT',
      });
    } else if (rawLower.includes('today') || rawLower.includes('aaj')) {
      duration = 'Started today';
      timeline.push({
        approximate_time: 'Today',
        description: 'Acute onset on presentation day.',
        is_approximate: false,
        source: 'PATIENT_TEXT',
      });
    }

    // 4. Severity detection
    let reportedSeverity: 'MILD' | 'MODERATE' | 'SEVERE' | 'UNSPECIFIED' = 'UNSPECIFIED';
    if (rawLower.includes('severe') || rawLower.includes('bahut tez') || rawLower.includes('unbearable') || rawLower.includes('bahut jyada')) {
      reportedSeverity = 'SEVERE';
    } else if (rawLower.includes('moderate') || rawLower.includes('thoda jyada') || rawLower.includes('medium')) {
      reportedSeverity = 'MODERATE';
    } else if (rawLower.includes('mild') || rawLower.includes('thoda') || rawLower.includes('slight')) {
      reportedSeverity = 'MILD';
    }

    // 5. Medical history & Medications
    const medicalHistory: string[] = [];
    const medicationsReported: string[] = [];
    const allergiesReported: string[] = [];

    if (rawLower.includes('diabetes') || rawLower.includes('sugar')) medicalHistory.push('Diabetes Mellitus');
    if (rawLower.includes('bp') || rawLower.includes('hypertension') || rawLower.includes('blood pressure')) medicalHistory.push('Hypertension');
    if (rawLower.includes('asthma') || rawLower.includes('dama')) medicalHistory.push('Asthma / Bronchospasm');
    if (rawLower.includes('paracetamol') || rawLower.includes('crocin') || rawLower.includes('dolo')) medicationsReported.push('Paracetamol / Dolo');
    if (rawLower.includes('allergy') || rawLower.includes('allergic')) allergiesReported.push('Reported allergy (details pending verification)');

    // 6. Integrate OCR data if provided
    if (input.reportOcrText && input.reportOcrText.trim()) {
      sources.push({
        fact: 'Laboratory report attached and parsed via OCR',
        source: 'REPORT_OCR',
        extracted_at: new Date().toISOString(),
      });
    }

    // 7. Gaps & follow-up questions
    const gaps = MissingInformationEngine.analyze(
      {
        duration,
        reported_severity: reportedSeverity,
        medications_reported: medicationsReported,
        allergies_reported: allergiesReported,
        medical_history: medicalHistory,
      },
      Boolean(input.hardwareReadingsSummary)
    );

    const missingInfoLabels = gaps
      .filter((g) => g.status === 'PATIENT_DID_NOT_PROVIDE' || g.status === 'NEEDS_VERIFICATION')
      .map((g) => `${g.label}: ${g.explanation}`);

    const followUps = FollowUpQuestionEngine.generateQuestions(gaps, chiefComplaint);

    const uncertainties: string[] = [];
    if (duration === 'Not specified') {
      uncertainties.push('Symptom duration was not reported by the patient.');
    }
    if (symptoms.length <= 1) {
      uncertainties.push('Limited symptom detail was provided; further clinical history gathering recommended.');
    }

    const rawExtraction: TriageExtraction = {
      schema_version: '1.0.0',
      language: input.language || 'en',
      chief_complaint: chiefComplaint,
      symptoms,
      duration,
      timeline,
      reported_severity: reportedSeverity,
      associated_symptoms: symptoms.slice(1),
      medical_history: medicalHistory,
      medications_reported: medicationsReported,
      allergies_reported: allergiesReported,
      missing_information: missingInfoLabels,
      follow_up_questions: followUps,
      uncertainties,
      source_references: sources,
      ai_provider: this.name,
      model_version: this.model,
      extracted_at: new Date().toISOString(),
    };

    const validation = SchemaValidator.validate(rawExtraction);
    if (!validation.isValid || !validation.sanitized) {
      throw new Error(`Extraction validation failed: ${validation.error}`);
    }

    return validation.sanitized;
  }
}
