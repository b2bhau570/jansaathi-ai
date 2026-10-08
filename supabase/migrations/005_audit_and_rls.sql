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
