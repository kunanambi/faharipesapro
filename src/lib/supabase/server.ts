
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = "https://wlcwmvsmuuevrewrjfib.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsY3dtdnNtdXVldnJld3JqZmliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4ODY5NTIsImV4cCI6MjA3MzQ2Mjk1Mn0.6ruySdHZu_HBNVkZOuSggVtHuwAQndGQb70Y2DpwgSE";


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

export function createAdminClient() {
    // This function is deprecated. We are using RLS policies instead of the service role key.
    // For admin-level access, we will rely on RLS policies that check the user's role or email.
    console.warn("createAdminClient is deprecated. Using createClient with RLS policies instead.");
    return createClient();
}
