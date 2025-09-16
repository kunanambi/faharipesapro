
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// By defining these here, we ensure they are loaded once per module
// and are available for both client creation functions.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// This function creates a Supabase client with the service role key for admin-level operations.
// It should only be used in server actions where elevated privileges are necessary.
// THIS FUNCTION IS THE SOURCE OF THE BUGS AND IS REMOVED.
// We will rely on RLS policies instead.
export function createAdminClient() {
  // Using the standard client now. RLS policies will handle authorization.
  // This function is kept for compatibility in case it's called elsewhere,
  // but it no longer creates a privileged client.
  return createClient();
}
