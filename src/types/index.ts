// JANSAATHI AI - Core Domain Types
// Strictly enforces clinical safety boundaries, deterministic rules, and multi-provenance auditability

export type UserRole = 'patient' | 'health_worker' | 'clinician' | 'facility_admin' | 'system_admin';

export type CaseStatus =
  | 'NEW'
  | 'PROCESSING'
  | 'READY_FOR_REVIEW'
  | 'UNDER_REVIEW'
  | 'ESCALATED'
  | 'REFERRED'
  | 'COMPLETED'
  | 'ERROR';

export type PriorityLevel =
  | 'URGENT_REVIEW'
  | 'PRIORITY_REVIEW'
  | 'ROUTINE_REVIEW'
  | 'UNCLASSIFIED';

export type InputType =
  | 'VOICE'
  | 'TEXT'
  | 'REPORT_IMAGE'
  | 'REPORT_PDF'
  | 'HARDWARE';

export type SourceType =
  | 'PATIENT_VOICE'
  | 'PATIENT_TEXT'
  | 'REPORT_OCR'
  | 'HARDWARE_READING'
  | 'CLINICIAN_ENTRY'
  | 'HEALTH_WORKER_ENTRY';

export interface SourceReference {
  fact: string;
  source: SourceType;
  source_id?: string;
  confidence?: number;
  extracted_at: string;
}

export interface TimelineItem {
  approximate_time: string;
  description: string;
  is_approximate: boolean;
  source: SourceType;
}

export interface StructuredReportFinding {
  test_name: string;
  observed_value: string;
  unit: string;
  reference_range: string;
  is_abnormal: boolean;
}

export interface TriageExtraction {
  schema_version: string;
  language: string;
  chief_complaint: string;
  symptoms: string[];
  duration: string;
  timeline: TimelineItem[];
  reported_severity: 'MILD' | 'MODERATE' | 'SEVERE' | 'UNSPECIFIED';
  associated_symptoms: string[];
  medical_history: string[];
  medications_reported: string[];
  allergies_reported: string[];
  missing_information: string[];
  follow_up_questions: string[];
  uncertainties: string[];
  source_references: SourceReference[];
  ai_provider: string;
  model_version: string;
  extracted_at: string;
  patient_notes_translated?: string;
}

export interface UrgencyRule {
  id: string;
  rule_code: string;
  name: string;
  description: string;
  priority: 'URGENT_REVIEW' | 'PRIORITY_REVIEW';
  trigger_conditions: {
    keywords?: string[];
    vital_threshold?: {
      spo2_below?: number;
      pulse_above?: number;
      pulse_below?: number;
      temp_above_c?: number;
    };
    duration_days_min?: number;
    comorbidity?: string;
  };
  rationale: string;
  version: string;
  active: boolean;
}

export interface UrgencyFlag {
  id: string;
  case_id: string;
  rule_code: string;
  detected_signal: string;
  priority: 'URGENT_REVIEW' | 'PRIORITY_REVIEW';
  explanation: string;
  source_reference: string;
  created_at: string;
}

export interface EcgClinicalMetrics {
  heartRate: number;
  rrIntervalMs: number;
  prIntervalMs: number;
  qrsDurationMs: number;
  qtIntervalMs: number;
  qtcIntervalMs: number;
  stDeviationMm: number;
  rhythmInterpretation: string;
  isRegular: boolean;
  recordingDurationSeconds: number;
  perfusionIndex?: number;
}

export interface HardwareReading {
  id: string;
  device_id?: string;
  case_id?: string;
  reading_type: 'SPO2' | 'PULSE_RATE' | 'BODY_TEMPERATURE' | 'BLOOD_PRESSURE' | 'ECG';
  numerical_value: number;
  unit: string;
  is_stable: boolean;
  measured_at: string;
  waveform_samples?: number[];
  ppg_samples?: number[];
  clinical_metrics?: EcgClinicalMetrics;
}

export interface TriageCase {
  id: string;
  case_number: string;
  facility_id?: string;
  facility_name?: string;
  consent_id?: string;
  input_language: string;
  status: CaseStatus;
  priority_level: PriorityLevel;
  primary_concern?: string;
  reported_duration?: string;
  assigned_clinician_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Associated entities for rich clinical workspace
  inputs?: PatientInput[];
  extractions?: TriageExtraction;
  urgency_flags?: UrgencyFlag[];
  hardware_readings?: HardwareReading[];
  reports?: ReportDocument[];
  clinician_reviews?: ClinicianReview[];
  referral?: ReferralNote;
}

export interface PatientInput {
  id: string;
  case_id: string;
  input_type: InputType;
  raw_content: string;
  original_language: string;
  input_metadata?: Record<string, unknown>;
  created_at: string;
}

export interface ReportDocument {
  id: string;
  case_id: string;
  file_name: string;
  file_type: string;
  file_size_bytes: number;
  storage_path: string;
  upload_status: 'UPLOADED' | 'OCR_PROCESSING' | 'OCR_COMPLETED' | 'OCR_FAILED';
  extracted_text?: string;
  findings?: StructuredReportFinding[];
  ocr_confidence?: number;
  created_at: string;
}

export interface ClinicianReview {
  id: string;
  case_id: string;
  clinician_id: string;
  clinician_name?: string;
  review_notes: string;
  corrections_made?: Record<string, unknown>;
  clinical_status: 'REVIEWED' | 'ESCALATED' | 'REFERRED' | 'COMPLETED';
  verified_extractions: boolean;
  reviewed_at: string;
}

export interface ReferralNote {
  id: string;
  case_id: string;
  case_number: string;
  referring_facility_name: string;
  receiving_facility_name: string;
  reason_for_referral: string;
  clinician_name: string;
  clinician_registration: string;
  clinical_summary: string;
  reported_symptoms: string[];
  urgency_signals: string[];
  vital_readings: string[];
  status: 'DRAFT' | 'AUTHORISED' | 'DISPATCHED';
  authorised_at?: string;
  created_at: string;
}

export interface AuditLogItem {
  id: string;
  event_type:
    | 'CASE_CREATED'
    | 'CONSENT_RECORDED'
    | 'VOICE_STARTED'
    | 'VOICE_TRANSCRIBED'
    | 'REPORT_UPLOADED'
    | 'OCR_COMPLETED'
    | 'EXTRACTION_COMPLETED'
    | 'URGENCY_RULE_TRIGGERED'
    | 'CASE_OPENED'
    | 'CASE_ASSIGNED'
    | 'CLINICIAN_NOTE_ADDED'
    | 'EXTRACTION_VERIFIED'
    | 'REFERRAL_CREATED'
    | 'REFERRAL_AUTHORISED'
    | 'CASE_COMPLETED'
    | 'LOGIN'
    | 'LOGOUT'
    | 'ACCESS_DENIED'
    | 'HARDWARE_CONNECTED'
    | 'HARDWARE_READING_RECORDED';
  actor_id?: string;
  actor_role: string;
  actor_name?: string;
  case_id?: string;
  action_details: Record<string, unknown>;
  created_at: string;
}

export interface LanguageCapability {
  code: string;
  name: string;
  nativeName: string;
  textInput: boolean;
  speechInput: boolean;
  speechOutput: boolean;
  translation: boolean;
  uiSupported: boolean;
  browserSpeechRecognitionCode?: string;
}
