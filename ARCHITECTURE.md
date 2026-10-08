# JANSAATHI AI - Architecture Specification

## 1. System Overview

JANSAATHI AI is designed as a human-in-the-loop clinical triage assistant. It isolates administrative data gathering and AI information organization from clinical decision-making.

```
+-----------------------------------------------------------------------------------+
|                              PATIENT INTAKE WORKFLOW                              |
|  1. Informed Consent  ->  2. Language Choice  ->  3. Speech / Text / OCR / Vitals |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                           LOCAL CLIENT-SIDE PROCESSING                            |
|  - Web Speech API (Live STT)                                                      |
|  - Tesseract.js Web Worker (OCR extraction of discrete lab values)                |
|  - Web Serial / BLE Gateway (SpO2, Pulse Rate, Temperature telemetry)             |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                       AI & DETERMINISTIC STRUCTURE ENGINES                        |
|  - AI Provider (Gemini Flash / Deterministic Extractor fallback)                  |
|  - Strict Schema & Safety Validator (Blocks diagnoses/prescriptions)             |
|  - Deterministic Urgency Rule Engine (Evaluates red flags strictly via rules)    |
|  - Missing Information & Follow-Up Question Engine (Clarifying queries)           |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                        SUPABASE PERSISTENCE & RLS TIER                            |
|  - Anonymous Cases (P-YYYY-XXXXXX)                                                |
|  - Role-Based Access Control (Clinician, Health Worker, Admin)                    |
|  - Append-Only Immutable Audit Ledger                                             |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                        CLINICIAN TRIAGE WORKSPACE (/cases/:id)                    |
|  - Attending doctor verifies extractions, examines original scans & telemetry     |
|  - Records physical observations & authorizes structured referral note            |
+-----------------------------------------------------------------------------------+
```

## 2. Multi-Provenance Evidence Model

Every clinical symptom, timeline event, and lab finding preserves its origin:
- `PATIENT_VOICE`: Transcribed from spoken audio.
- `PATIENT_TEXT`: Directly entered by the patient or caregiver.
- `REPORT_OCR`: Extracted from uploaded laboratory documentation.
- `HARDWARE_READING`: Directly captured from USB/BLE telemetry device.
- `CLINICIAN_ENTRY`: Documented by a registered medical practitioner.

## 3. Failure Handling & Resilience

- **Speech Recognition Failure**: Honest fallback notification allowing manual text entry; no synthetic transcriptions.
- **OCR Failure / Low Clarity**: Displays uncertainty notice with confidence score and preserves the original document image for visual doctor review.
- **AI Service Offline**: Seamless local deterministic extractor runs offline in 100% of cases with zero cloud dependencies.
- **Network Outage**: Resilient local browser persistence ensures patient statements are never lost.
