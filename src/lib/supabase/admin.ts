
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// This client is used for admin-level operations that bypass RLS.
// It should only be used in server-side code (Server Actions, Route Handlers).
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase URL or service role key is missing from environment variables.');
  }

  return createSupabaseClient(
    supabaseUrl,
    supabaseServiceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
