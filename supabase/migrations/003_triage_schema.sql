-- JANSAATHI AI - Migration 003: Clinical Triage, Inputs, Extractions, and Referrals
-- Description: Core triage lifecycle entities, report attachments, deterministic urgency, clinician reviews

-- 1. Consents Table (Explicit patient consent before any input collection)
CREATE TABLE IF NOT EXISTS public.consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    consent_version TEXT NOT NULL DEFAULT 'v1.0-2026',
    consent_given BOOLEAN NOT NULL DEFAULT false,
    consented_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    purpose_agreed TEXT NOT NULL, -- e.g., 'TRIAGE_PREPARATION_AND_CLINICAL_REVIEW'
    recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_consents_session ON public.consents(session_id);

-- 2. Triage Cases (The primary workflow unit)
CREATE TABLE IF NOT EXISTS public.triage_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number TEXT NOT NULL UNIQUE DEFAULT generate_case_number(),
    facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
    consent_id UUID REFERENCES public.consents(id) ON DELETE SET NULL,
    input_language TEXT NOT NULL DEFAULT 'en', -- e.g. 'hi', 'or', 'bn', 'te', 'ta', 'en'
    status TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN (
      'NEW',
      'PROCESSING',
      'READY_FOR_REVIEW',
      'UNDER_REVIEW',
      'ESCALATED',
      'REFERRED',
      'COMPLETED',
      'ERROR'
    )),
    priority_level TEXT NOT NULL DEFAULT 'UNCLASSIFIED' CHECK (priority_level IN (
      'URGENT_REVIEW',
      'PRIORITY_REVIEW',
      'ROUTINE_REVIEW',
      'UNCLASSIFIED'
    )),
    primary_concern TEXT,
    reported_duration TEXT,
    assigned_clinician_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_cases_status ON public.triage_cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_priority ON public.triage_cases(priority_level);
CREATE INDEX IF NOT EXISTS idx_cases_facility ON public.triage_cases(facility_id);
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON public.triage_cases(created_at DESC);

-- 3. Patient Inputs (Raw inputs: Voice text, Direct text, Report file, or Telemetry)
CREATE TABLE IF NOT EXISTS public.patient_inputs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.triage_cases(id) ON DELETE CASCADE,
    input_type TEXT NOT NULL CHECK (input_type IN ('VOICE', 'TEXT', 'REPORT_IMAGE', 'REPORT_PDF', 'HARDWARE')),
    raw_content TEXT NOT NULL,
    original_language TEXT NOT NULL DEFAULT 'en',
    input_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_patient_inputs_case ON public.patient_inputs(case_id);

-- 4. Voice Sessions (For tracking audio transcription metrics and provenance)
CREATE TABLE IF NOT EXISTS public.voice_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.triage_cases(id) ON DELETE CASCADE,
    audio_duration_seconds NUMERIC(6, 2),
    audio_format TEXT DEFAULT 'audio/webm',
    speech_provider TEXT NOT NULL DEFAULT 'browser_web_speech',
    language_code TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('RECORDING', 'PROCESSING', 'TRANSCRIBED', 'ERROR')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 5. Transcripts
CREATE TABLE IF NOT EXISTS public.transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voice_session_id UUID REFERENCES public.voice_sessions(id) ON DELETE SET NULL,
    case_id UUID NOT NULL REFERENCES public.triage_cases(id) ON DELETE CASCADE,
    raw_transcript TEXT NOT NULL,
    corrected_transcript TEXT,
    confidence NUMERIC(4, 3), -- between 0.000 and 1.000
    is_patient_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 6. Reports (Uploaded lab investigations, prescriptions, discharge slips)
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.triage_cases(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('application/pdf', 'image/jpeg', 'image/png')),
    file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes <= 15728640), -- Max 15MB
    storage_path TEXT NOT NULL,
    upload_status TEXT NOT NULL DEFAULT 'UPLOADED' CHECK (upload_status IN ('UPLOADED', 'OCR_PROCESSING', 'OCR_COMPLETED', 'OCR_FAILED')),
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_reports_case ON public.reports(case_id);

-- 7. Report Extractions (OCR and extracted lab values with confidence)
CREATE TABLE IF NOT EXISTS public.report_extractions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    case_id UUID NOT NULL REFERENCES public.triage_cases(id) ON DELETE CASCADE,
    extracted_text TEXT NOT NULL,
    structured_findings JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of {test_name, value, unit, reference_range, flag}
    ocr_confidence NUMERIC(4, 3),
    uncertainty_notes TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 8. Triage Extractions (Structured AI information organizer output)
CREATE TABLE IF NOT EXISTS public.triage_extractions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.triage_cases(id) ON DELETE CASCADE,
    schema_version TEXT NOT NULL DEFAULT '1.0.0',
    language TEXT NOT NULL,
    chief_complaint TEXT NOT NULL,
    symptoms JSONB NOT NULL DEFAULT '[]'::jsonb,
    duration TEXT,
    timeline JSONB NOT NULL DEFAULT '[]'::jsonb,
    reported_severity TEXT,
    associated_symptoms JSONB NOT NULL DEFAULT '[]'::jsonb,
    medical_history JSONB NOT NULL DEFAULT '[]'::jsonb,
    medications_reported JSONB NOT NULL DEFAULT '[]'::jsonb,
    allergies_reported JSONB NOT NULL DEFAULT '[]'::jsonb,
    missing_information JSONB NOT NULL DEFAULT '[]'::jsonb,
    follow_up_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    uncertainties JSONB NOT NULL DEFAULT '[]'::jsonb,
    source_references JSONB NOT NULL DEFAULT '[]'::jsonb,
    ai_provider TEXT NOT NULL,
    model_version TEXT NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_triage_extractions_case ON public.triage_extractions(case_id);

-- 9. Timeline Events
CREATE TABLE IF NOT EXISTS public.timeline_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.triage_cases(id) ON DELETE CASCADE,
    approximate_time TEXT NOT NULL,
    event_description TEXT NOT NULL,
    is_approximate BOOLEAN NOT NULL DEFAULT true,
    source_type TEXT NOT NULL, -- e.g., 'PATIENT_VOICE', 'REPORT_DATE', 'CLINICIAN_ENTRY'
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 10. Follow-up Questions (Questions generated for health workers to clarify gaps)
CREATE TABLE IF NOT EXISTS public.follow_up_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.triage_cases(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    target_gap TEXT NOT NULL,
    answered BOOLEAN NOT NULL DEFAULT false,
    response_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 11. Urgency Rules (Strict Deterministic Rule Engine definitions - NOT LLM determined)
CREATE TABLE IF NOT EXISTS public.urgency_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('URGENT_REVIEW', 'PRIORITY_REVIEW')),
    trigger_conditions JSONB NOT NULL,
    rationale TEXT NOT NULL,
    version TEXT NOT NULL DEFAULT 'v1.0.0',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 12. Urgency Flags (Flags detected on specific cases)
CREATE TABLE IF NOT EXISTS public.urgency_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.triage_cases(id) ON DELETE CASCADE,
    rule_id UUID REFERENCES public.urgency_rules(id) ON DELETE SET NULL,
    rule_code TEXT NOT NULL,
    detected_signal TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('URGENT_REVIEW', 'PRIORITY_REVIEW')),
    explanation TEXT NOT NULL,
    source_reference TEXT NOT NULL,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_urgency_flags_case ON public.urgency_flags(case_id);

-- 13. Clinician Reviews (Human review ownership)
CREATE TABLE IF NOT EXISTS public.clinician_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.triage_cases(id) ON DELETE CASCADE,
    clinician_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    review_notes TEXT NOT NULL,
    corrections_made JSONB DEFAULT '{}'::jsonb,
    clinical_status TEXT NOT NULL CHECK (clinical_status IN ('REVIEWED', 'ESCALATED', 'REFERRED', 'COMPLETED')),
    verified_extractions BOOLEAN NOT NULL DEFAULT true,
    reviewed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 14. Referrals
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.triage_cases(id) ON DELETE CASCADE,
    referring_facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
    receiving_facility_name TEXT NOT NULL,
    reason_for_referral TEXT NOT NULL,
    clinician_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    referral_note TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'AUTHORISED', 'DISPATCHED')),
    authorised_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 15. System Settings (Operational parameters, retention days)
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 16. AI Processing Logs (Auditing provider calls without storing PII)
CREATE TABLE IF NOT EXISTS public.ai_processing_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES public.triage_cases(id) ON DELETE SET NULL,
    operation_type TEXT NOT NULL,
    provider_name TEXT NOT NULL,
    model_name TEXT NOT NULL,
    duration_ms INTEGER NOT NULL,
    tokens_used INTEGER,
    status TEXT NOT NULL CHECK (status IN ('SUCCESS', 'FAILED', 'VALIDATION_FAILED')),
    error_details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
