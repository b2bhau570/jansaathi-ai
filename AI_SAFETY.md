# JANSAATHI AI - Clinical AI Safety & Guardrails

## 1. Fundamental Clinical Boundaries

JANSAATHI AI is strictly an **information organizer**, not an autonomous clinical diagnostic system.

### Strictly Forbidden AI Behaviors:
1. **No Medical Diagnoses**: The system must never assert or suggest disease states (e.g., "The patient has pneumonia").
2. **No Prescriptions or Drug Dosages**: The system must never recommend medicines, dosages, or pharmaceutical regimens.
3. **No Disease Probability Scores**: The system must never output probabilistic diagnostic ratings (e.g., "85% likelihood of appendicitis").
4. **No Autonomous Clinical Dispositions**: Final decisions to discharge, admit, or transfer rest exclusively with a licensed human medical officer.

## 2. Deterministic Urgency Rule Engine

Urgency classification is decoupled from Large Language Models:
- Red flags (such as acute chest pain, respiratory distress, unilateral facial droop, hematemesis, or SpO2 &lt; 92%) are evaluated using deterministic boolean rules.
- LLMs are never permitted to suppress or bypass an urgency flag.
- Every urgency flag provides the rule code, matched signal, clinical rationale, and version.

## 3. Strict Schema Validation

All AI-generated extraction objects are passed through the `SchemaValidator` before rendering:
- Verifies adherence to the strict JSON triage schema.
- Scans for forbidden phrases (e.g., "diagnosis:", "prescription:", "take amoxicillin", "you suffer from").
- Any detected clinical overreach results in immediate rejection of the untrusted output and fallback to the local deterministic parser.

## 4. Multi-Source Traceability

The clinician dashboard visually differentiates evidence sources using distinct badges:
- Spoken words are tagged `PATIENT_VOICE`.
- Written statements are tagged `PATIENT_TEXT`.
- OCR laboratory values are tagged `REPORT_OCR`.
- Sensor vitals are tagged `HARDWARE_READING`.
- Physical examination notes are tagged `CLINICIAN_ENTRY`.
