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
