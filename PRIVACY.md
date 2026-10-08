# JANSAATHI AI - Privacy & Compliance Specification

## 1. Data Minimisation Baseline
JANSAATHI AI adheres to strict data minimization:
- **No Aadhaar Collection**: We explicitly do not request or store 12-digit Aadhaar numbers or national identity tokens.
- **Anonymous Identifiers**: Cases use pseudonymous sequence numbers (`P-YYYY-XXXXXX`).
- **No Demographic Profiling**: Patients are not fingerprinted, tracked across sessions, or monetized.

## 2. Local Processing of Intimate Patient Data
- **Voice Audio**: Transcribed locally via browser Web Speech API; audio blobs are not transmitted to third-party ad networks.
- **Diagnostic Scans**: OCR is performed locally inside in-browser Web Workers using Tesseract.js. Scans are not shared with third-party cloud OCR providers.

## 3. Row Level Security & Audit
- Postgres RLS restricts case viewing strictly to authenticated personnel assigned to that facility.
- An append-only audit trail logs access and clinical actions for accountability without logging unnecessary personal data.
