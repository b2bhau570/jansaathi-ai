-- JANSAATHI AI - Migration 001: Initial Core Schema & Extensions
-- Description: Core extensions, sequences for anonymous case numbering, facilities, and profiles

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Sequence for human-readable anonymous Case ID (e.g., P-2026-000001)
CREATE SEQUENCE IF NOT EXISTS case_number_seq START WITH 1 INCREMENT BY 1;

-- Function to generate standardized anonymous case identifier
CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS text AS $$
DECLARE
  current_yr text := to_char(CURRENT_DATE, 'YYYY');
  next_val text := lpad(nextval('case_number_seq')::text, 6, '0');
BEGIN
  RETURN 'P-' || current_yr || '-' || next_val;
END;
$$ LANGUAGE plpgsql;

-- 1. Facilities (Hospitals, PHCs, CHCs, Public Health Camps, Company Clinics)
CREATE TABLE IF NOT EXISTS public.facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    facility_type TEXT NOT NULL CHECK (facility_type IN ('PRIMARY_HEALTH_CENTRE', 'COMMUNITY_HEALTH_CENTRE', 'DISTRICT_HOSPITAL', 'HEALTH_CAMP', 'COMPANY_CLINIC', 'CAMPUS_HEALTH_CENTRE', 'OCCUPATIONAL_HEALTH_UNIT')),
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    contact_phone TEXT,
    contact_email TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_facilities_state_district ON public.facilities(state, district);

-- 2. User Profiles (Extending auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('patient', 'health_worker', 'clinician', 'facility_admin', 'system_admin')),
    designation TEXT,
    registration_number TEXT, -- For verified medical professionals
    facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_facility ON public.profiles(facility_id);

-- 3. Facility Memberships (Many-to-many relationship for staff assigned to multiple units)
CREATE TABLE IF NOT EXISTS public.facility_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role_in_facility TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE(facility_id, profile_id)
);
-- JANSAATHI AI - Migration 002: Authentication Triggers and Role-Based Authorization
-- Description: Trigger on new auth.users signup and secure role resolution functions

-- Security function to obtain current authenticated user's assigned role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
  RETURN COALESCE(v_role, 'anonymous');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Security function to obtain current user's primary facility
CREATE OR REPLACE FUNCTION public.get_user_facility()
RETURNS UUID AS $$
DECLARE
  v_fac UUID;
BEGIN
  SELECT facility_id INTO v_fac FROM public.profiles WHERE id = auth.uid();
  RETURN v_fac;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Automatic profile sync from Supabase Auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    designation,
    facility_id
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'System User'),
    -- Prevent self-assigned elevated privileges: default to health_worker or patient unless explicitly created by admin
    COALESCE(NEW.raw_user_meta_data->>'role', 'health_worker'),
    NEW.raw_user_meta_data->>'designation',
    (NEW.raw_user_meta_data->>'facility_id')::uuid
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger firing on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
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
-- JANSAATHI AI - Migration 004: Hardware Devices and Vital Readings
-- Description: Integration tables for real medical telemetry (SpO2, Pulse Rate, Temperature, BP)

CREATE TABLE IF NOT EXISTS public.hardware_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_identifier TEXT NOT NULL UNIQUE, -- e.g. BLE UUID or Serial Port ID
    device_type TEXT NOT NULL CHECK (device_type IN ('PULSE_OXIMETER', 'INFRARED_THERMOMETER', 'BLOOD_PRESSURE_MONITOR', 'MULTI_VITAL_GATEWAY')),
    manufacturer_model TEXT,
    firmware_version TEXT,
    facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
    connection_type TEXT NOT NULL CHECK (connection_type IN ('BLUETOOTH_LE', 'WEB_SERIAL', 'HTTP_GATEWAY', 'MQTT')),
    status TEXT NOT NULL DEFAULT 'DISCONNECTED' CHECK (status IN ('CONNECTED', 'DISCONNECTED', 'CONNECTING', 'UNAVAILABLE', 'ERROR')),
    last_seen TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.hardware_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID REFERENCES public.hardware_devices(id) ON DELETE SET NULL,
    case_id UUID REFERENCES public.triage_cases(id) ON DELETE CASCADE,
    reading_type TEXT NOT NULL CHECK (reading_type IN ('SPO2', 'PULSE_RATE', 'BODY_TEMPERATURE', 'SYSTOLIC_BP', 'DIASTOLIC_BP')),
    numerical_value NUMERIC(6, 2) NOT NULL,
    unit TEXT NOT NULL, -- '%', 'bpm', 'degC', 'degF', 'mmHg'
    raw_packet TEXT,
    is_stable BOOLEAN NOT NULL DEFAULT true,
    measured_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_hardware_readings_case ON public.hardware_readings(case_id);
CREATE INDEX IF NOT EXISTS idx_hardware_readings_device ON public.hardware_readings(device_id);
-- JANSAATHI AI - Migration 005: Audit Trail and Row Level Security (RLS)
-- Description: Immutable audit logging and comprehensive role-based RLS policies

-- 1. Immutable Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL, -- e.g. CASE_CREATED, CONSENT_RECORDED, VOICE_TRANSCRIBED, URGENCY_RULE_TRIGGERED, CASE_REVIEWED, REFERRAL_AUTHORISED, LOGIN, ACCESS_DENIED
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_role TEXT NOT NULL DEFAULT 'anonymous',
    case_id UUID REFERENCES public.triage_cases(id) ON DELETE SET NULL,
    facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
    action_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_audit_case ON public.audit_logs(case_id);
CREATE INDEX IF NOT EXISTS idx_audit_event_type ON public.audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON public.audit_logs(created_at DESC);

-- Enable RLS on every table without exception
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.triage_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.triage_extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_up_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.urgency_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.urgency_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinician_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_processing_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hardware_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hardware_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Audit Logs Policies: STRICT APPEND-ONLY. No UPDATE or DELETE allowed by any user.
CREATE POLICY "System admins can read all audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.get_user_role() = 'system_admin');

CREATE POLICY "Facility admins and clinicians can view audits for their facility"
  ON public.audit_logs FOR SELECT
  USING (
    public.get_user_role() IN ('facility_admin', 'clinician')
    AND facility_id = public.get_user_facility()
  );

CREATE POLICY "Authenticated users and services can insert audit records"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- Facilities Policies
CREATE POLICY "Public read for active facilities"
  ON public.facilities FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage facilities"
  ON public.facilities FOR ALL
  USING (public.get_user_role() IN ('facility_admin', 'system_admin'));

-- Profiles Policies
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid() OR public.get_user_role() IN ('system_admin', 'facility_admin', 'clinician'));

CREATE POLICY "Admins can update profiles"
  ON public.profiles FOR UPDATE
  USING (public.get_user_role() IN ('facility_admin', 'system_admin'));

-- Urgency Rules Policies
CREATE POLICY "All authenticated staff and triage processors can view active urgency rules"
  ON public.urgency_rules FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage urgency rules"
  ON public.urgency_rules FOR ALL
  USING (public.get_user_role() IN ('facility_admin', 'system_admin'));

-- Consents Policies
CREATE POLICY "Anonymous or patient users can create consent"
  ON public.consents FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Staff can view consents"
  ON public.consents FOR SELECT
  USING (public.get_user_role() IN ('health_worker', 'clinician', 'facility_admin', 'system_admin'));

-- Triage Cases Policies
CREATE POLICY "Patient can insert new triage case"
  ON public.triage_cases FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Health workers and clinicians can view facility cases"
  ON public.triage_cases FOR SELECT
  USING (
    public.get_user_role() IN ('health_worker', 'clinician', 'facility_admin', 'system_admin')
    AND (
      facility_id = public.get_user_facility()
      OR public.get_user_role() = 'system_admin'
      OR facility_id IS NULL
    )
  );

CREATE POLICY "Staff can update triage case status"
  ON public.triage_cases FOR UPDATE
  USING (public.get_user_role() IN ('health_worker', 'clinician', 'facility_admin', 'system_admin'));

-- Patient Inputs Policies
CREATE POLICY "Allow patient input insertion"
  ON public.patient_inputs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Staff can view patient inputs"
  ON public.patient_inputs FOR SELECT
  USING (public.get_user_role() IN ('health_worker', 'clinician', 'facility_admin', 'system_admin'));

-- Reports and Extractions Policies
CREATE POLICY "Allow report insertion"
  ON public.reports FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Staff can view reports"
  ON public.reports FOR SELECT
  USING (public.get_user_role() IN ('health_worker', 'clinician', 'facility_admin', 'system_admin'));

CREATE POLICY "Staff can view report extractions"
  ON public.report_extractions FOR SELECT
  USING (public.get_user_role() IN ('health_worker', 'clinician', 'facility_admin', 'system_admin'));

CREATE POLICY "Allow report extraction insertion"
  ON public.report_extractions FOR INSERT
  WITH CHECK (true);

-- Triage Extractions Policies
CREATE POLICY "Allow triage extractions insert"
  ON public.triage_extractions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Staff can view triage extractions"
  ON public.triage_extractions FOR SELECT
  USING (public.get_user_role() IN ('health_worker', 'clinician', 'facility_admin', 'system_admin'));

-- Urgency Flags Policies
CREATE POLICY "Allow urgency flag insertion"
  ON public.urgency_flags FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Staff can view urgency flags"
  ON public.urgency_flags FOR SELECT
  USING (public.get_user_role() IN ('health_worker', 'clinician', 'facility_admin', 'system_admin'));

-- Clinician Reviews Policies
CREATE POLICY "Clinicians can create reviews"
  ON public.clinician_reviews FOR INSERT
  WITH CHECK (public.get_user_role() IN ('clinician', 'system_admin'));

CREATE POLICY "Staff can view reviews"
  ON public.clinician_reviews FOR SELECT
  USING (public.get_user_role() IN ('health_worker', 'clinician', 'facility_admin', 'system_admin'));

-- Referrals Policies
CREATE POLICY "Clinicians can manage referrals"
  ON public.referrals FOR ALL
  USING (public.get_user_role() IN ('clinician', 'facility_admin', 'system_admin'));

CREATE POLICY "Staff can view referrals"
  ON public.referrals FOR SELECT
  USING (public.get_user_role() IN ('health_worker', 'clinician', 'facility_admin', 'system_admin'));

-- Hardware Devices & Readings
CREATE POLICY "All staff can view hardware devices"
  ON public.hardware_devices FOR SELECT
  USING (public.get_user_role() IN ('health_worker', 'clinician', 'facility_admin', 'system_admin'));

CREATE POLICY "Staff can insert hardware readings"
  ON public.hardware_readings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Staff can view hardware readings"
  ON public.hardware_readings FOR SELECT
  USING (public.get_user_role() IN ('health_worker', 'clinician', 'facility_admin', 'system_admin'));
-- JANSAATHI AI - Migration 006: Seed Deterministic Urgency Rules
-- Description: Standard deterministic review rules with trigger patterns and clinical rationales.
-- Note: These rules flag for priority human review; they NEVER diagnose or prescribe.

INSERT INTO public.urgency_rules (
  rule_code,
  name,
  description,
  priority,
  trigger_conditions,
  rationale,
  version,
  active
) VALUES
(
  'RULE_CHEST_PAIN',
  'Reported Acute Chest Discomfort or Pressure',
  'Patient reports acute, crushing, radiating chest pain, severe chest heaviness, or chest tightness with breathlessness.',
  'URGENT_REVIEW',
  '{"keywords": ["chest pain", "chest pressure", "radiating pain to arm", "crushing pain", "chhati me dard", "buke batha", "chhati re jantrana"], "exclude_minor": false}'::jsonb,
  'Acute chest symptoms require immediate clinical evaluation to assess for acute coronary syndrome, pulmonary embolism, or aortic emergencies.',
  'v1.0.0',
  true
),
(
  'RULE_RESPIRATORY_DISTRESS',
  'Reported Severe Breathing Difficulty',
  'Patient reports acute shortness of breath, gasping, inability to complete full sentences, or blue discoloration (cyanosis).',
  'URGENT_REVIEW',
  '{"keywords": ["cannot breathe", "shortness of breath", "severe breathlessness", "gasping", "saans lene me takleef", "sas phula", "dam attakna"], "vital_threshold": {"spo2_below": 92}}'::jsonb,
  'Respiratory distress indicates potential airway, pulmonary, or cardiac compromise requiring rapid professional airway and oxygenation review.',
  'v1.0.0',
  true
),
(
  'RULE_NEURO_DEFICIT',
  'Acute Neurological Deficit (FAST Signals)',
  'Patient or family reports sudden unilateral weakness, facial asymmetry, slurred speech, or acute loss of consciousness.',
  'URGENT_REVIEW',
  '{"keywords": ["face drooping", "arm weakness", "slurred speech", "sudden paralysis", "bolne me dikkat", "ek taraf kamjori", "behoshi"], "time_sensitive": true}'::jsonb,
  'Acute focal neurological signs carry high time-sensitivity for stroke assessment or intracranial pathology.',
  'v1.0.0',
  true
),
(
  'RULE_UNCONTROLLED_BLEEDING',
  'Active Severe Hemorrhage or Blood Loss',
  'Reported vomiting blood (hematemesis), coughing blood (hemoptysis), or continuous uncontrolled external bleeding.',
  'URGENT_REVIEW',
  '{"keywords": ["vomiting blood", "coughing blood", "blood in stool", "heavy bleeding", "khoon ki ulti", "rakta padiba", "khoon behna"]}'::jsonb,
  'Active severe bleeding carries risk of hypovolemic shock requiring urgent stabilization and source identification.',
  'v1.0.0',
  true
),
(
  'RULE_HIGH_FEVER_LETHARGY',
  'High Fever with Altered Sensorium or Stiff Neck',
  'Reported high fever (>102F / 38.9C) combined with neck stiffness, severe headache, confusion, or inability to wake up.',
  'URGENT_REVIEW',
  '{"keywords": ["fever with confusion", "fever with stiff neck", "high fever cannot wake", "tez bukhar behoshi", "tez jwara"]}'::jsonb,
  'High fever with meningism or altered sensorium demands rapid assessment for central nervous system infection or sepsis.',
  'v1.0.0',
  true
),
(
  'RULE_VITAL_HYPOXIA',
  'Measured Pulse Oximetry Hypoxia',
  'Hardware reading indicates SpO2 below 92% on room air or pulse rate exceeding 130 bpm or below 45 bpm.',
  'URGENT_REVIEW',
  '{"sensor_conditions": [{"metric": "SPO2", "operator": "<", "value": 92}, {"metric": "PULSE_RATE", "operator": ">", "value": 130}, {"metric": "PULSE_RATE", "operator": "<", "value": 45}]}'::jsonb,
  'Objective hypoxemia or extreme hemodynamic rate anomalies indicate physiological distress requiring bedside clinical examination.',
  'v1.0.0',
  true
),
(
  'RULE_ANAPHYLAXIS_SIGNAL',
  'Suspected Acute Allergic Reaction',
  'Reported sudden swelling of lips, tongue, or throat following medication, food, or insect sting with difficulty swallowing or wheezing.',
  'URGENT_REVIEW',
  '{"keywords": ["swollen lips", "swollen tongue", "throat closing", "allergic reaction with wheeze", "galey me sujan"]}'::jsonb,
  'Risk of airway obstruction and anaphylactic shock requiring immediate human clinical review.',
  'v1.0.0',
  true
),
(
  'RULE_PERSISTENT_HIGH_FEVER',
  'Persistent Prolonged Fever (>5 days)',
  'Patient reports fever lasting more than 5 consecutive days without improvement.',
  'PRIORITY_REVIEW',
  '{"keywords": ["fever for week", "fever 5 days", "fever 6 days", "fever 7 days", "ek hafte se bukhar", "dina dhariki jwara"], "duration_days_min": 5}'::jsonb,
  'Prolonged fever requires structured clinical investigation for endemic or localized infectious etiologies.',
  'v1.0.0',
  true
),
(
  'RULE_DIABETIC_FOOT_ULCER',
  'Reported Non-healing Extremity Wound in Diabetes',
  'Patient with history of diabetes reports an open non-healing wound, ulceration, or dark discoloration on foot or toes.',
  'PRIORITY_REVIEW',
  '{"keywords": ["diabetic foot", "wound on toe not healing", "pair me ghav", "sugar wound"], "comorbidity": "diabetes"}'::jsonb,
  'Early specialist assessment prevents progression to deep soft-tissue infection or osteomyelitis.',
  'v1.0.0',
  true
)
ON CONFLICT (rule_code) DO NOTHING;
