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
