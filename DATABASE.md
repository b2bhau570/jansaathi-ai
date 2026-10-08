# JANSAATHI AI - Database Schema Documentation

## 1. Overview
The database uses normalized PostgreSQL with UUID keys, foreign key constraints, indexes on query fields, and strict Row Level Security.

## 2. Table Summary

| Table | Purpose | Security & RLS |
| :--- | :--- | :--- |
| `profiles` | Extended user profile linked to `auth.users` | Self or Facility Admin |
| `facilities` | Hospital, PHC, CHC, and Health Camp registry | Public read for active units |
| `facility_members` | Staff assignments to facilities | Facility Admin |
| `consents` | Explicit patient informed consent records | Patient insert, Staff select |
| `triage_cases` | Core clinical workflow case units (`P-YYYY-XXXXXX`) | Facility-scoped |
| `patient_inputs` | Raw voice, text, and telemetry entries | Case association |
| `voice_sessions` | Speech duration, provider, and language metadata | Staff select |
| `transcripts` | Raw and patient-corrected transcriptions | Staff select |
| `reports` | Uploaded diagnostic scans (PDF/JPG/PNG) | 15MB limit, Staff select |
| `report_extractions` | OCR discrete findings and confidence | Staff select |
| `triage_extractions` | Structured clinical schema (symptoms, timeline, etc.) | Staff select |
| `timeline_events` | Chronological symptom onset milestones | Staff select |
| `follow_up_questions` | Non-leading queries for health workers | Staff select |
| `urgency_rules` | Versioned deterministic red-flag definitions | Admin manage, Staff select |
| `urgency_flags` | Case-specific urgency triggers with explanations | Staff select |
| `clinician_reviews` | Doctor physical findings, notes, and dispositions | Clinician insert/select |
| `referrals` | Authorized hospital transfer notes | Clinician manage |
| `hardware_devices` | Telemetry devices (pulse oximeters, ECG, etc.) | Staff select |
| `hardware_readings` | Discrete SpO2, Pulse Rate, and Temperature telemetry | Staff select/insert |
| `system_settings` | Operational retention policies and provider keys | Admin manage |
| `ai_processing_logs` | Audit of AI processing duration and tokens (No PII) | System service |
| `audit_logs` | Immutable audit trail for all events | Append-only, No update/delete |

## 3. Case Identifier Generation
Case IDs are generated via PostgreSQL sequence as `P-YYYY-XXXXXX` (e.g. `P-2026-000001`). No personal identifying information (PII) is included in case numbers.
