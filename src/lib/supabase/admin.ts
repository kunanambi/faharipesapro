
import { createClient } from '@supabase/supabase-js';

// This client is used for admin-level operations that bypass RLS.
// It should only be used in server-side code (Server Actions, Route Handlers).
export function createClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
