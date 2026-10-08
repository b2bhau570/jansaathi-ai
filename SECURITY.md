# JANSAATHI AI - Security Architecture & Threat Model

## 1. Authentication & Role-Based Access Control (RBAC)

Access is strictly managed via Supabase Auth and database-backed authorization:
- `patient`: Can create a new case and view their current session submission.
- `health_worker`: Can create cases, input vitals, upload diagnostic reports, and view assigned facility queue.
- `clinician`: Authorized to review cases, document clinical impressions, verify findings, and authorize referral transfer notes.
- `facility_admin`: Manages facility membership and local operational parameters.
- `system_admin`: Governs deterministic urgency rules, audit verification, and system settings.

Users cannot assign or elevate their own roles client-side. The `public.get_user_role()` PostgreSQL function verifies role assignments against the database table.

## 2. Row Level Security (RLS) Policies

All 21 database tables have RLS enabled:
- Cases and inputs are queryable solely by authenticated personnel matching the facility ID.
- The `audit_logs` table has append-only access; `UPDATE` and `DELETE` operations are completely denied.

## 3. Secret Management & Key Isolation

- No Supabase service-role keys are bundled in client-facing code.
- Public environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GEMINI_API_KEY`) only utilize browser-restricted keys.

## 4. File Security & Upload Safeguards

- Uploads restricted to `image/jpeg`, `image/png`, and `application/pdf`.
- File sizes enforced client-side and database-level at 15MB.
- Client-side Tesseract.js execution eliminates the need to upload files to untrusted third-party OCR vendors.

## 5. Adversarial AI & Prompt Injection Prevention

When medical documents are processed, the system prompt strictly treats report contents as plain text data, never as system instructions.
Any prompt attempting to override clinical safety guidelines is neutralized by the downstream `SchemaValidator`.
