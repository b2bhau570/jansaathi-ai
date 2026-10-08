# JANSAATHI AI - Deployment Guide

## 1. Prerequisites
- Node.js v20+ or v24+
- A Supabase project (Free Tier)
- A Vercel account (Free Tier)

## 2. Supabase Database Configuration
1. Open your Supabase Dashboard and navigate to the **SQL Editor**.
2. Run the migration scripts in numerical sequence:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_auth_and_roles.sql`
   - `supabase/migrations/003_triage_schema.sql`
   - `supabase/migrations/004_hardware_schema.sql`
   - `supabase/migrations/005_audit_and_rls.sql`
   - `supabase/migrations/006_seed_urgency_rules.sql`
3. Verify in **Table Editor** that RLS is enabled for all 21 tables.

## 3. Environment Configuration
Create production environment variables in Vercel or locally:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GEMINI_API_KEY=your-optional-gemini-key
```

## 4. Local Build & Test Validation
```bash
npm install
npm test
npm run build
```

## 5. Vercel Deployment
Deploy directly via Git or Vercel CLI:
```bash
npx vercel --prod
```
The included `vercel.json` ensures that single-page application (SPA) client routes (`/patient`, `/cases/:id`, `/dashboard`, etc.) resolve seamlessly to `index.html`.
