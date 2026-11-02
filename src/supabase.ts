import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url: string | undefined = import.meta.env.VITE_SUPABASE_URL;
const key: string | undefined = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in .env');
}

export const supabase: SupabaseClient = createClient(url, key);
