# JANSAATHI AI - Environment Configuration Reference

| Variable Name | Purpose | Required / Optional | Client / Server | Where to Obtain |
| :--- | :--- | :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Supabase Project API endpoint | Optional (app defaults to resilient client storage if omitted) | Client-Safe | Supabase Dashboard -> Project Settings -> API |
| `VITE_SUPABASE_ANON_KEY` | Supabase Public Anonymous API Key | Optional (app defaults to resilient client storage if omitted) | Client-Safe | Supabase Dashboard -> Project Settings -> API |
| `VITE_GEMINI_API_KEY` | Google Gemini 2.0 / 1.5 Flash API Key | Optional (app defaults to offline Deterministic Extractor if omitted) | Client-Safe | Google AI Studio (aistudio.google.com) |
| `VITE_APP_ENV` | Application environment label (e.g. `production`, `development`) | Optional | Client-Safe | Deployment Environment |
| `VITE_APP_VERSION` | Application release version (e.g. `1.0.0`) | Optional | Client-Safe | Release Tag |

> [!IMPORTANT]
> Never expose the Supabase `service_role` key in any `VITE_` frontend environment variable. The service-role key grants administrative bypass of Row Level Security and must remain strictly server-side.
