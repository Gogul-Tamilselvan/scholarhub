import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
// Service role JWT — bypasses RLS, used only in the admin dashboard
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Key is missing in environment variables');
}

// Public client for reviewer/user-facing pages
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: { storageKey: 'sb-public-auth' }
});

// Admin client — bypasses RLS, isolated storage key to avoid GoTrueClient conflict
export const supabaseAdmin = createClient(
  supabaseUrl || '',
  supabaseServiceKey || supabaseAnonKey || '',
  {
    auth: {
      persistSession: false,
      storageKey: 'sb-admin-auth',
      autoRefreshToken: false,
      detectSessionInUrl: false,
    }
  }
);
