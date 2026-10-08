// JANSAATHI AI - Supabase Client Configuration
// Clean environment variable initialization with safe client fallback

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your-project')
);

// Fallback dummy URL to prevent client initialization crash if unconfigured
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder-jansaathi.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key'
);
