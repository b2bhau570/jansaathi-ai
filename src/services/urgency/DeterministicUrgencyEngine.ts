// JANSAATHI AI - Deterministic Urgency Rule Engine
// Evaluates explicitly reported signals using deterministic criteria. NEVER uses an LLM to assign urgency.
// Emits objective urgency flags with clinical explanations and source references.

import { HardwareReading, PriorityLevel, UrgencyFlag, UrgencyRule } from '../../types';

export const SYSTEM_URGENCY_RULES: UrgencyRule[] = [
  {
    id: 'rule-chest-pain-001',
    rule_code: 'RULE_CHEST_PAIN',
    name: 'Reported Acute Chest Discomfort or Pressure',
    description: 'Patient reports acute, crushing, radiating chest discomfort, heaviness, or chest tightness.',
    priority: 'URGENT_REVIEW',
    trigger_conditions: {
      keywords: [
        'chest pain',
        'chest pressure',
        'pain radiating to arm',
        'chest heaviness',
        'crushing pain in chest',
        'chhati me dard',
        'chhati me jalan',
        'buke batha',
        'chhati re jantrana',
        'nenju vali',
        'rommulo noppi',
      ],
    },
    rationale: 'Acute chest symptoms require rapid clinical assessment to evaluate for acute coronary syndrome, aortic dissection, or pulmonary embolism.',
    version: 'v1.0.0',
    active: true,
  },
  {
    id: 'rule-resp-distress-002',
    rule_code: 'RULE_RESPIRATORY_DISTRESS',
    name: 'Reported Severe Breathing Difficulty',
    description: 'Patient reports severe shortness of breath, gasping, inability to speak full sentences, or blue lips/fingers.',
    priority: 'URGENT_REVIEW',
    trigger_conditions: {
      keywords: [
        'cannot breathe',
        'shortness of breath',
        'severe breathlessness',
        'gasping for air',
        'struggling to breathe',
        'saans lene me takleef',
        'sas phula',
        'dam attakna',
        'swasa theesukovadam kashtam',
        'swas kosto',
      ],
      vital_threshold: {
        spo2_below: 92,
      },
    },
    rationale: 'Severe respiratory compromise demands immediate bedside evaluation of airway patency, oxygenation, and ventilation.',
    version: 'v1.0.0',
    active: true,
  },
  {
    id: 'rule-neuro-deficit-003',
    rule_code: 'RULE_NEURO_DEFICIT',
    name: 'Acute Neurological Deficit Signals',
    description: 'Reported sudden facial weakness, unilateral limb weakness, speech difficulty, or sudden altered consciousness.',
    priority: 'URGENT_REVIEW',
    trigger_conditions: {
      keywords: [
        'face drooping',
        'facial weakness',
        'arm weakness',
        'leg weakness',
        'slurred speech',
        'unable to speak',
        'sudden paralysis',
        'bolne me dikkat',
        'ek taraf kamjori',
        'behoshi',
        'loss of consciousness',
        'akoshmik durbolota',
      ],
    },
    rationale: 'Acute focal neurological symptoms exhibit high time-sensitivity for acute ischemic stroke, intracranial hemorrhage, or neurological emergencies.',
    version: 'v1.0.0',
    active: true,
  },
  {
    id: 'rule-bleeding-004',
    rule_code: 'RULE_UNCONTROLLED_BLEEDING',
    name: 'Active Severe Hemorrhage or Blood Loss',
    description: 'Reported vomiting blood, coughing blood, large volume rectal bleeding, or continuous uncontrolled external bleeding.',
    priority: 'URGENT_REVIEW',
    trigger_conditions: {
      keywords: [
        'vomiting blood',
        'coughing blood',
        'blood in vomit',
        'heavy bleeding',
        'continuous bleeding',
        'khoon ki ulti',
        'rakta baman',
        'khoon behna',
        'rakta padiba',
        'raththam kakkuvathu',
      ],
    },
    rationale: 'Active significant bleeding indicates potential hemodynamically unstable hemorrhage or active internal lesion.',
    version: 'v1.0.0',
    active: true,
  },
  {
    id: 'rule-vital-hypoxia-005',
    rule_code: 'RULE_VITAL_HYPOXIA',
    name: 'Measured Pulse Oximetry Hypoxia',
    description: 'Telemetry or hardware sensor confirms SpO2 below 92% or pulse rate > 130 bpm or < 45 bpm.',
    priority: 'URGENT_REVIEW',
    trigger_conditions: {
      vital_threshold: {
        spo2_below: 92,
        pulse_above: 130,
        pulse_below: 45,
      },
    },
    rationale: 'Direct peripheral oxygen saturation < 92% or extreme heart rate anomaly demonstrates acute physiological instability.',
    version: 'v1.0.0',
    active: true,
  },
  {
    id: 'rule-anaphylaxis-006',
    rule_code: 'RULE_ANAPHYLAXIS_SIGNAL',
    name: 'Suspected Acute Allergic Reaction',
    description: 'Reported sudden lip/tongue/throat swelling, hives with respiratory distress or fainting following allergen exposure.',
    priority: 'URGENT_REVIEW',
    trigger_conditions: {
      keywords: [
        'swollen lips',
        'swollen tongue',
        'throat closing',
        'severe allergy with breathlessness',
        'galey me sujan',
        'mukha phuliba',
      ],
    },
    rationale: 'Rapid onset angioedema with mucosal involvement carries immediate risk of catastrophic airway obstruction.',
    version: 'v1.0.0',
    active: true,
  },
  {
    id: 'rule-prolonged-fever-007',
    rule_code: 'RULE_PROLONGED_FEVER',
    name: 'Persistent Fever (> 5 Days)',
    description: 'Patient reports fever persisting for five or more consecutive days.',
    priority: 'PRIORITY_REVIEW',
    trigger_conditions: {
      keywords: [
        'fever for 5 days',
        'fever for 6 days',
        'fever for 7 days',
        'fever for week',
        'fever for two weeks',
        'ek hafte se bukhar',
        '5 din se bukhar',
        'dina dhariki jwara',
      ],
      duration_days_min: 5,
    },
    rationale: 'Prolonged pyrexia requires structured diagnostic workup for endemic infectious diseases (e.g. enteric fever, malaria, scrub typhus, dengue).',
    version: 'v1.0.0',
    active: true,
  },
  {
    id: 'rule-diabetic-wound-008',
    rule_code: 'RULE_DIABETIC_WOUND',
    name: 'Reported Non-healing Foot Wound in Diabetes',
    description: 'Patient with known diabetes reports open ulcer, blackening, or persistent non-healing wound on lower extremity.',
    priority: 'PRIORITY_REVIEW',
    trigger_conditions: {
      keywords: [
        'diabetic foot',
        'foot wound not healing',
        'sugar wound',
        'pair me ghav',
        'pada re ghata',
      ],
      comorbidity: 'diabetes',
    },
    rationale: 'Diabetic foot lesions present heightened vulnerability to rapidly ascending soft tissue and bone infections.',
    version: 'v1.0.0',
    active: true,
  },
];

export interface UrgencyEvaluationInput {
  caseId: string;
  patientStatements: string[];
  extractedSymptoms?: string[];
  vitals?: HardwareReading[];
  reportedDuration?: string;
  medicalHistory?: string[];
}

export interface UrgencyEvaluationResult {
  priorityLevel: PriorityLevel;
  flags: UrgencyFlag[];
  evaluatedRuleCount: number;
  triggeredCount: number;
}

export class DeterministicUrgencyEngine {
  private rules: UrgencyRule[];

  constructor(customRules?: UrgencyRule[]) {
    this.rules = (customRules && customRules.length > 0) ? customRules : SYSTEM_URGENCY_RULES;
  }

  public evaluate(input: UrgencyEvaluationInput): UrgencyEvaluationResult {
    const flags: UrgencyFlag[] = [];
    const corpus = [
      ...input.patientStatements,
      ...(input.extractedSymptoms || []),
      input.reportedDuration || '',
      ...(input.medicalHistory || []),
    ]
      .join(' ')
      .toLowerCase();

    for (const rule of this.rules) {
      if (!rule.active) continue;

      let triggered = false;
      let detectedSignal = '';
      let matchedSource = 'PATIENT_REPORTED_TEXT';

      // 1. Keyword condition matching
      if (rule.trigger_conditions.keywords && rule.trigger_conditions.keywords.length > 0) {
        for (const kw of rule.trigger_conditions.keywords) {
          if (corpus.includes(kw.toLowerCase())) {
            triggered = true;
            detectedSignal = `Patient reported text matched keyword: "${kw}"`;
            matchedSource = 'PATIENT_REPORTED_TEXT';
            break;
          }
        }
      }

      // 2. Sensor / Vitals condition matching
      if (rule.trigger_conditions.vital_threshold && input.vitals && input.vitals.length > 0) {
        const vt = rule.trigger_conditions.vital_threshold;

        for (const vital of input.vitals) {
          if (vital.reading_type === 'SPO2' && vt.spo2_below !== undefined) {
            if (vital.numerical_value < vt.spo2_below) {
              triggered = true;
              detectedSignal = `Measured SpO2 of ${vital.numerical_value}% is below safety threshold (${vt.spo2_below}%)`;
              matchedSource = 'HARDWARE_TELEMETRY';
            }
          }
          if (vital.reading_type === 'PULSE_RATE') {
            if (vt.pulse_above !== undefined && vital.numerical_value > vt.pulse_above) {
              triggered = true;
              detectedSignal = `Measured Pulse Rate of ${vital.numerical_value} bpm is above threshold (${vt.pulse_above} bpm)`;
              matchedSource = 'HARDWARE_TELEMETRY';
            }
            if (vt.pulse_below !== undefined && vital.numerical_value < vt.pulse_below) {
              triggered = true;
              detectedSignal = `Measured Pulse Rate of ${vital.numerical_value} bpm is below safety threshold (${vt.pulse_below} bpm)`;
              matchedSource = 'HARDWARE_TELEMETRY';
            }
          }
        }
      }

      if (triggered) {
        flags.push({
          id: `flag-${rule.rule_code}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          case_id: input.caseId,
          rule_code: rule.rule_code,
          detected_signal: detectedSignal,
          priority: rule.priority,
          explanation: `Urgency signal detected: ${rule.name}. Rationale: ${rule.rationale} Qualified healthcare professional review is required.`,
          source_reference: matchedSource,
          created_at: new Date().toISOString(),
        });
      }
    }

    // Determine overall case priority level
    let priorityLevel: PriorityLevel = 'ROUTINE_REVIEW';
    if (flags.some((f) => f.priority === 'URGENT_REVIEW')) {
      priorityLevel = 'URGENT_REVIEW';
    } else if (flags.some((f) => f.priority === 'PRIORITY_REVIEW')) {
      priorityLevel = 'PRIORITY_REVIEW';
    } else if (input.patientStatements.length === 0 && (!input.vitals || input.vitals.length === 0)) {
      priorityLevel = 'UNCLASSIFIED';
    }

    return {
      priorityLevel,
      flags,
      evaluatedRuleCount: this.rules.length,
      triggeredCount: flags.length,
    };
  }
}
