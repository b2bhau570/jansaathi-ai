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
