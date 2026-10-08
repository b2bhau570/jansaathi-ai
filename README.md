# JANSAATHI AI
## Production-Ready Human-in-the-Loop Multilingual Triage Assistant

> "Every language. One structured triage note. A qualified human always decides."

JANSAATHI AI is a specialized clinical triage-support and information-organization web system engineered for public health institutions, Primary Health Centres (PHCs), Community Health Centres (CHCs), mobile health screening camps, occupational health units, and company clinics across India.

---

### Core Purpose & Clinical Boundary Notice

JANSAATHI AI converts messy, multilingual patient-reported symptom descriptions and laboratory reports into a structured, chronological triage note with multi-source provenance tags for a qualified healthcare professional to review.

**CRITICAL CLINICAL NOTICE:**
- JANSAATHI AI NEVER acts as a doctor.
- It NEVER independently diagnoses conditions, prescribes medication, or determines clinical treatments.
- All health-related outputs are advisory and reviewer-facing.
- A qualified healthcare professional retains complete responsibility for all clinical decisions and referral handoffs.

---

### Architecture & Zero-Software-Investment Principles

The entire application is engineered to operate on free and open-source infrastructure:

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 + TypeScript + Vite | Maximum speed, strict type safety, zero legacy bloat |
| **Styling** | Tailwind CSS v4 | High-contrast, WCAG 2.2 AA compliant clinical interface |
| **Database & Auth** | Supabase (PostgreSQL + RLS) | Free tier PostgreSQL, Row Level Security, Auth RBAC |
| **Speech Recognition** | Browser Web Speech API | Client-side native transcription without paid cloud STT |
| **Diagnostic Report OCR** | Tesseract.js Web Worker | 100% in-browser client OCR for JPG/PNG/PDF reports |
| **Urgency Classification** | Deterministic Rule Engine | Pure deterministic evaluation; LLMs are never used for emergency triage |
| **AI Extraction Engine** | Gemini Flash / Offline Deterministic Parser | Free tier structured parsing with offline fallback |
| **Hardware Telemetry** | Web Serial API / Web Bluetooth API | Direct USB/UART reading for pulse oximeter SpO2 and PR |
| **Hosting & Deployment** | Vercel | Seamless edge deployment with SPA routing rewrites |

---

### Supported Indian Languages & Capability Registry

JANSAATHI AI features an honest capability registry for 13 Indian languages:
1. **English (India)** – Text, Speech, UI
2. **Hindi (हिन्दी)** – Text, Speech, UI
3. **Odia (ଓଡ଼ିଆ)** – Text, UI (Honest notice: Speech recognition is unavailable on standard browser engines)
4. **Bengali (বাংলা)** – Text, Speech, UI
5. **Telugu (తెలుగు)** – Text, Speech, UI
6. **Tamil (தமிழ்)** – Text, Speech, UI
7. **Kannada (ಕನ್ನಡ)** – Text, Speech, UI
8. **Malayalam (മലയാളം)** – Text, Speech, UI
9. **Marathi (मराठी)** – Text, Speech, UI
10. **Gujarati (ગુજરાતી)** – Text, Speech, UI
11. **Punjabi (ਪੰਜਾਬੀ)** – Text, UI
12. **Assamese (অসমীয়া)** – Text, UI
13. **Urdu (اردو)** – Text, Speech, UI

---

### Quick Start & Development

```bash
# 1. Clone repository
git clone https://github.com/your-org/jansaathi-ai.git
cd jansaathi-ai

# 2. Install dependencies
npm install

# 3. Setup environment variables (optional for offline testing)
cp .env.example .env

# 4. Run automated test suite
npm test

# 5. Start development server
npm run dev

# 6. Build production bundle
npm run build
```

---

### Key Workflows

1. **Patient Intake (`/patient`)**:
   - Informed consent acknowledgment (mandatory).
   - Language selection with capability badges.
   - Multimodal input: Voice dictation, Multilingual text, Report OCR upload, Telemetry vital signs.
   - Plain-language review of what the system understood.
   - Submission confirmation with anonymous case identifier (e.g., `P-2026-000001`).

2. **Clinician Queue (`/cases`)**:
   - Data-dense clinical queue ordered by deterministic review priorities (`URGENT REVIEW`, `PRIORITY REVIEW`, `ROUTINE REVIEW`).
   - Multi-factor search by case reference and symptoms.

3. **Case Detail Workspace (`/cases/:id`)**:
   - High-visibility deterministic urgency banner with clinical rationale.
   - Structured triage note with multi-source evidence tags (`PATIENT_VOICE`, `PATIENT_TEXT`, `REPORT_OCR`, `HARDWARE_READING`).
   - Attached diagnostic scans with side-by-side OCR inspector.
   - Identified clinical gaps and non-leading clarifying questions.
   - Attending clinician observations, disposition recording, and transfer note generation.
   - Tamper-evident immutable audit trail.
